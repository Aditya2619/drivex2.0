import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCloud, FiUpload, FiFolder, FiImage, FiVideo, FiEdit2, FiTrash2, FiEye, FiLogOut, FiHardDrive } from 'react-icons/fi';

function DashboardMain() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [fileActionLoading, setFileActionLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = "https://drivex2-0-server.onrender.com/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("driveCloneUser");
    console.log("Raw stored user from localStorage:", storedUser);

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      console.log("Parsed user from localStorage:", parsedUser);
      console.log("User ID from parsed user:", parsedUser.id);
      setUser(parsedUser);

      const userId = parsedUser.id;
      console.log("Using user ID for API calls:", userId);
      fetchFiles(userId);
    } catch (err) {
      console.error("Error parsing stored user:", err);
      localStorage.removeItem("driveCloneUser");
      navigate("/");
    }
  }, [navigate]);

  const fetchFiles = async (userId) => {
    if (!userId) {
      console.error("No user ID provided for fetching files");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching files for user ID:", userId);
      const response = await axios.get(`${API_URL}/files?userId=${userId}`);
      setFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driveCloneUser");
    navigate("/");
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const isValidMediaType = (file) => {
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",

      "video/mp4",
      "video/webm",
    ];

    return acceptedTypes.includes(file.type);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!isValidMediaType(selectedFile)) {
      alert("Invalid file type. Only images and videos are accepted.");
      e.target.value = null;
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const userId = user.id;
      console.log("Using user ID for file upload:", userId);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userId);

      console.log("Form data for upload:", {
        file: selectedFile.name,
        userId: userId,
        fileType: selectedFile.type,
      });

      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Upload response:", response.data);

      setFiles((prevFiles) => [response.data.file, ...prevFiles]);

      setUploading(false);
      setUploadProgress(0);

      e.target.value = null;
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error details:", error.response?.data || error.message);
      setUploading(false);
      setUploadProgress(0);

      if (error.response?.data?.error) {
        alert(`Upload failed: ${error.response.data.error}`);
      } else {
        alert("Failed to upload file. Please try again.");
      }

      e.target.value = null;
    }
  };

  const handlePreview = async (file) => {
    console.log("Previewing file:", file);

    if (file && file.file_path) {
      const fileUrl = getFileUrl(file.file_path);
      console.log("File path from database:", file.file_path);
      console.log("Constructed file URL:", fileUrl);

      try {
        setPreviewLoading(true);

        fetch(fileUrl, { method: "HEAD" })
          .then((response) => {
            if (!response.ok) {
              console.warn(
                `File might not be accessible: ${response.status} ${response.statusText}`
              );
            } else {
              console.log("File is accessible");
            }
          })
          .catch((error) => {
            console.error("Error checking file accessibility:", error);
          });

        setSelectedFile(file);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Error checking file existence:", error);
        setPreviewLoading(false);
        alert("The file could not be found or accessed.");
      }
    } else {
      alert("Invalid file information. Cannot preview this file.");
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    const parts = filePath.split("/");
    const filename = parts[parts.length - 1];

    return `https://drivex2-0-server.onrender.com/uploads/${filename}`;
  };

  const handleDelete = async (fileId) => {
    try {
      setFileActionLoading(true);

      await axios.delete(`${API_URL}/files/${fileId}?userId=${user.id}`);

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));

      setShowDeleteConfirm(false);
      setSelectedFile(null);

      setFileActionLoading(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      console.error("Error details:", error.response?.data || error.message);
      setFileActionLoading(false);
    }
  };

  const handleRenameClick = (file) => {
    setSelectedFile(file);
    setNewFileName(file.file_name);
    setShowRenameModal(true);
  };

  const handleRename = async () => {
    if (!newFileName || newFileName.trim() === "") {
      return;
    }

    try {
      setFileActionLoading(true);

      const response = await axios.patch(
        `${API_URL}/files/${selectedFile.id}/rename`,
        {
          userId: user.id,
          newFileName: newFileName,
        }
      );

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === selectedFile.id ? response.data.file : file
        )
      );

      setShowRenameModal(false);
      setSelectedFile(null);
      setNewFileName("");

      setFileActionLoading(false);
    } catch (error) {
      console.error("Error renaming file:", error);
      console.error("Error details:", error.response?.data || error.message);
      setFileActionLoading(false);
    }
  };

  const getFilePreviewType = (file) => {
    if (!file || !file.file_type) return "unknown";

    const type = file.file_type.split("/")[0];

    if (type === "image") {
      return "image";
    } else if (type === "video") {
      return "video";
    }
    return "unknown";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (!showPreviewModal) {
      setPreviewLoading(false);
    }
  }, [showPreviewModal]);

  useEffect(() => {
    let timeoutId;
    if (previewLoading) {
      timeoutId = setTimeout(() => {
        setPreviewLoading(false);
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [previewLoading]);

  const getFileTypeDescription = (file) => {
    const type = file.file_type.split("/")[0];

    switch (type) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      default:
        return file.file_type;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex items-center space-x-3">
              <FiHardDrive className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">DriveX</h1>
            </div>

            {user && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-9 h-9 rounded-full border-2 border-gray-100"
                    />
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {/* Upload Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">My Files</h2>
                <p className="text-sm text-gray-500">
                  Manage and organize your files
                </p>
              </div>
              <div className="flex flex-col items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  {uploading ? `Uploading... ${uploadProgress}%` : "Upload File"}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: Images and Videos
                </p>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.length > 0 ? (
                  files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {file.file_type.startsWith('image/') ? (
                            <FiImage className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FiVideo className="w-5 h-5 text-purple-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {file.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {getFileTypeDescription(file)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(file.updated_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(file)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRenameClick(file)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Rename"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FiFolder className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500">No files found. Upload a file to get started!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedFile.file_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getFileTypeDescription(selectedFile)} • {formatFileSize(selectedFile.file_size)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedFile(null);
                  setPreviewLoading(false);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-600">Loading preview...</p>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {getFilePreviewType(selectedFile) === "image" ? (
                    <img
                      src={getFileUrl(selectedFile.file_path)}
                      alt={selectedFile.file_name}
                      className="max-h-[500px] max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                  ) : getFilePreviewType(selectedFile) === "video" ? (
                    <video
                      src={getFileUrl(selectedFile.file_path)}
                      controls
                      className="max-h-[500px] max-w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-center py-12">
                      <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Preview not available for this file type.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Rename File</h3>

            <div className="mb-6">
              <label htmlFor="newFileName" className="block text-sm font-medium text-gray-700 mb-2">
                New File Name
              </label>
              <input
                type="text"
                id="newFileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={fileActionLoading}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setSelectedFile(null);
                  setNewFileName("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={fileActionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={fileActionLoading || !newFileName.trim()}
              >
                {fileActionLoading ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete File</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-medium">{selectedFile.file_name}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={fileActionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedFile.id)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={fileActionLoading}
              >
                {fileActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMain;
