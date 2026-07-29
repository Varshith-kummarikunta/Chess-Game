# ♟️ Chess Game – Real-Time Multiplayer Chess Platform

A full-stack real-time multiplayer chess application where users can register, log in, upload profile pictures, create or join game rooms, and play chess online with live move synchronization.

## 🌐 Live Demo

**Frontend:** https://play-chess-online.vercel.app

**Backend:** https://chess-game-backend-vzal.onrender.com

---

# 📸 Features

* 🔐 Secure user authentication (JWT)
* 👤 User registration and login
* 🖼️ Profile picture upload with Cloudinary
* ♟️ Real-time multiplayer chess gameplay
* 🚪 Create and join game rooms
* ⚡ Live move synchronization using Socket.IO
* ✅ Chess move validation using chess.js
* 🏆 Leaderboard system
* 📱 Responsive user interface
* ☁️ Cloud deployment

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Axios
* React Router
* Socket.IO Client
* CSS

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* bcrypt
* Multer
* Cloudinary
* Cookie Parser
* CORS
* dotenv

## Database

* MongoDB Atlas
* Mongoose

---

# 📂 Project Structure

```text
Chess-Game/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   ├── package.json
│   └── index.js
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/Varshith-kummarikunta/Chess-Game.git
```

```bash
cd Chess-Game
```

---

## Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

```env
MONGODB_URL=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_SECRET_KEY=your_secret_key

CLIENT_URL=http://localhost:5173

PORT=4000
```

Start the backend server

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:4000
```

Start the frontend

```bash
npm run dev
```

---

# 🚀 Deployment

## Frontend

* Vercel

## Backend

* Render

## Database

* MongoDB Atlas

## Image Storage

* Cloudinary

---

# 🔐 Authentication Flow

1. User registers.
2. Password is hashed using bcrypt.
3. User logs in.
4. JWT tokens are generated.
5. Authentication cookies are sent to the client.
6. Protected routes verify the user before granting access.

---

# ♟️ Real-Time Gameplay

Socket.IO powers the multiplayer experience by handling:

* Room creation
* Room joining
* Player connections
* Move synchronization
* Turn updates
* Game state synchronization
* Player disconnection handling

---

# 📤 Image Upload

Profile pictures are uploaded using:

* Multer
* Cloudinary
* multer-storage-cloudinary

Images are stored on Cloudinary while their URLs are saved in MongoDB.

---

# 🗄️ Database

MongoDB Atlas stores:

* User accounts
* Authentication details
* Profile image URLs
* Leaderboard information

Mongoose is used for schema creation, validation, and database operations.

---

# 🌍 Environment Variables

## Backend

```env
MONGODB_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_SECRET_KEY=

CLIENT_URL=

PORT=
```

## Frontend

```env
VITE_API_URL=
```

---

# 🧪 Testing Checklist

* ✅ User registration
* ✅ User login
* ✅ JWT authentication
* ✅ Profile image upload
* ✅ Create room
* ✅ Join room
* ✅ Play multiplayer chess
* ✅ Live board synchronization
* ✅ Leaderboard
* ✅ MongoDB connection
* ✅ Cloudinary uploads
* ✅ Production deployment

---

# 📖 Future Improvements

* Add spectator mode
* Add game history
* Add friend system
* Add chat during matches
* Add player matchmaking
* Add game timers
* Add draw and resignation options
* Improve mobile responsiveness
* Add email verification
* Add password reset functionality

---

# 👨‍💻 Author

**Varshith Kummarikunta**

GitHub: https://github.com/Varshith-kummarikunta

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future improvements.
