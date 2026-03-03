# Own-Ten | Owner-Tenant Dispute Resolution Platform

A production-grade MERN stack SaaS platform for resolving disputes between property owners and tenants.

## Features

- 🔐 JWT-based authentication with role-based access control (OWNER, TENANT, ADMIN)
- 🛡️ Secure password hashing with bcrypt
- 📝 Centralized error handling and logging
- 🏥 Health check API
- 🎨 Modern UI with Tailwind CSS
- ⚛️ React with Vite for fast development
- 🔒 Protected routes and middleware
- 📊 MongoDB for data persistence

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security headers
- CORS configuration
- Express Rate Limiting
- Morgan for HTTP logging

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios for API calls
- Context API for state management

## Project Structure

```
own-ten/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/
│   │   └── User.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── health.routes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/own-ten
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Health Check
- `GET /api/health` - Server health check

## User Roles

- **OWNER**: Property owners who can manage properties and disputes
- **TENANT**: Tenants who can report issues and participate in disputes
- **ADMIN**: Administrators with full system access

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- CORS configuration
- Security headers with Helmet
- Rate limiting
- Input validation with express-validator

## Development

### Backend Development
- Uses nodemon for auto-restart during development
- Morgan for HTTP request logging
- Centralized error handling
- Request logging middleware

### Frontend Development
- Hot Module Replacement (HMR) with Vite
- Tailwind CSS for styling
- Error boundary for error handling
- Protected routes with authentication check

## Production Build

### Backend
```bash
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

