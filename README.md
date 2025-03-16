# DriveX - Modern Cloud Storage Solution

DriveX is a modern, user-friendly cloud storage application built with React and Vite. It provides a seamless experience for storing, managing, and sharing your media files.

## 🚀 Features

- **Google Authentication**: Secure sign-in with your Google account
- **File Management**:
  - Upload images and videos
  - Preview media files
  - Rename files
  - Delete files
  - Real-time upload progress
- **Modern UI/UX**:
  - Responsive design
  - Clean and intuitive interface
  - Smooth animations and transitions
  - File type icons and previews
- **Security**:
  - Secure authentication
  - Protected routes
  - Safe file handling

## 🛠️ Tech Stack

- **Frontend**:

  - React 18
  - Vite
  - TailwindCSS
  - React Router DOM
  - Axios
  - React Icons
  - Google OAuth

- **Backend**:
  - Node.js
  - Express
  - PostgreSQL
  - Multer (file handling)

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/drivex.git
   cd drivex
   ```

2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Create a `.env` file in the client directory:

   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google OAuth API
4. Create credentials (OAuth client ID)
5. Add authorized JavaScript origins and redirect URIs
6. Copy the client ID to your `.env` file

## 📱 Usage

1. Visit the application URL
2. Sign in with your Google account
3. Upload files using the "Upload File" button
4. Manage your files:
   - Click the eye icon to preview
   - Click the edit icon to rename
   - Click the trash icon to delete

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

## 🔮 Future Enhancements

- [ ] Folder support
- [ ] File sharing capabilities
- [ ] Advanced search and filters
- [ ] Drag and drop uploads
- [ ] Dark mode support
- [ ] Mobile app version

## 📞 Support

For support, email support@drivex.com or join our Slack channel.

## 🔒 Security

For security issues, please email security@drivex.com.

---

Made with ❤️ by [Your Name]
