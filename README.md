# VideoKit 🎥

A complete backend API for a video sharing platform built with Node.js, Express, and MongoDB. This project provides all the essential features needed for a YouTube-like application including user authentication, video upload/streaming, comments, likes, playlists, and more.

## 🚀 Features

### User Management
- **User Registration & Authentication** - Secure signup/login with JWT tokens
- **Profile Management** - Update profile details, avatar, and cover images
- **User Channels** - Each user gets their own channel with subscriber functionality
- **Watch History** - Track and manage viewing history

### Video Operations
- **Video Upload** - Upload videos with thumbnail generation
- **Video Streaming** - Efficient video delivery and playback
- **Video Management** - CRUD operations for video content
- **Video Analytics** - View counts and engagement metrics

### Social Features
- **Comments System** - Nested comments on videos
- **Like/Dislike** - Like videos, comments, and tweets
- **Subscriptions** - Subscribe to channels and get updates
- **Playlists** - Create and manage custom playlists
- **Tweets** - Share thoughts and updates (Twitter-like feature)

### Additional Features
- **Dashboard Analytics** - Channel statistics and insights
- **Health Monitoring** - API health check endpoints
- **File Management** - Cloudinary integration for media storage
- **Security** - JWT authentication, CORS, and input validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Password Hashing**: bcrypt
- **Development**: Nodemon, Prettier

## 📁 Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js              # Application entry point
├── constants.js          # Application constants
├── controllers/          # Request handlers
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── tweet.controller.js
│   ├── dashboard.controller.js
│   └── healthcheck.controller.js
├── models/               # MongoDB schemas
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweet.model.js
├── routes/               # API route definitions
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── tweet.routes.js
│   ├── dashboard.routes.js
│   └── healthcheck.routes.js
├── middlewares/          # Custom middleware
│   ├── auth.middleware.js
│   └── multer.middlewares.js
├── utils/               # Utility functions
│   ├── apiError.js
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   ├── cloudinary.js
│   └── ffmpeg.js
└── db/                  # Database configuration
    └── index.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd videoKit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/videokit
   CORS_ORIGIN=*
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📋 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### User Management
- `GET /api/v1/users/current-user` - Get current user info
- `PATCH /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/avatar` - Update user avatar
- `PATCH /api/v1/users/cover-image` - Update cover image
- `GET /api/v1/users/c/:username` - Get channel profile
- `GET /api/v1/users/history` - Get watch history

### Videos
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video
- `DELETE /api/v1/videos/:videoId` - Delete video

### Comments
- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/comments/:videoId` - Add comment
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

### Likes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle tweet like

### Playlists
- `POST /api/v1/playlists` - Create playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist
- `PATCH /api/v1/playlists/:playlistId` - Update playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist

### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/u/:subscriberId` - Get subscribed channels

### Health Check
- `GET /api/v1/healthcheck` - API health status

## 🔧 Configuration

### Database
The application uses MongoDB with Mongoose for data persistence. Configure your MongoDB URI in the `.env` file.

### File Storage
Cloudinary is used for storing user avatars, cover images, video files, and thumbnails. Set up your Cloudinary credentials in the environment variables.

### Security
- JWT tokens for authentication
- bcrypt for password hashing
- CORS enabled for cross-origin requests
- Input validation and sanitization

## 🧪 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run format` - Format code with Prettier

### File Upload
The application supports file uploads for:
- User avatars
- User cover images
- Video files
- Video thumbnails

All files are automatically uploaded to Cloudinary and local temporary files are cleaned up.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔮 Future Enhancements

- [ ] Video transcoding and multiple quality options
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Video recommendations algorithm
- [ ] Live streaming support
- [ ] Mobile app integration
- [ ] Analytics dashboard
- [ ] Content moderation tools

## 📞 Support

If you have any questions or need help with setup, please open an issue in the repository.

---

**Built with ❤️ using Node.js and Express**
