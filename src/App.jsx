import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCloud, FiLock, FiShare2, FiZap } from 'react-icons/fi';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('driveCloneUser');
    if (storedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const login = useGoogleLogin({
    onSuccess: (userToken) => setUser(userToken),
    onError: (error) => {
      console.log('Login Failed:', error);
      setError("Google login failed. Please try again.");
    }
  });

  // Process Google authentication
  useEffect(() => {
    if (user && user.access_token) {
      setLoading(true);
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json'
          }
        })
        .then((res) => {
          // Save user to database
          const userData = {
            ...res.data,
            accessToken: user.access_token,
            tokenType: user.token_type,
            expiresIn: user.expires_in
          };
          
          return axios.post('https://drivex2-0-server.onrender.com/api/auth/google', userData);
        })
        .then((response) => {
          localStorage.setItem('driveCloneUser', JSON.stringify(response.data.user));
          setLoading(false);
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error(err);
          setError("Authentication failed. Please try again.");
          setLoading(false);
        });
    }
  }, [user, navigate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div className="pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full">
                    ✨ New Platform
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Your Personal
                  <span className="block text-blue-600">Cloud Storage</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Experience the future of cloud storage. Fast, secure, and seamlessly integrated with your Google account.
                </p>
              </div>
              
              <div className="space-y-4">
                {loading && (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600 font-medium">Authenticating...</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                <button 
                  onClick={login} 
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-white text-gray-800 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-5 h-5 mr-3"
                  />
                  <span className="font-medium">Sign in with Google</span>
                </button>

                <p className="text-sm text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-10 transform rotate-3 scale-105"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FiCloud className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">My Drive</h3>
                        <p className="text-sm text-gray-500">250 GB Available</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">Upgrade</div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1">
                          <div className="w-full h-4 bg-gray-100 rounded"></div>
                          <div className="w-2/3 h-3 bg-gray-50 rounded mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
