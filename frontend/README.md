1. Backend Integration
Step 1.1: Install Dependencies
In your new backend project directory, install the required packages:

bash
npm install express mongoose cors dotenv helmet bcryptjs jsonwebtoken express-validator express-mongo-sanitize express-rate-limit nodemailer google-auth-library axios
Step 1.2: Copy Files
Copy the entire auth folder from the source project (backend/auth) to your new project's backend directory.

Source: backend/auth/
Destination: your-new-project/backend/auth/
Ensure the folder contains:

config.js
middleware.js
models.js
routes.js
utils.js
Step 1.3: Configure Environment Variables
Create or update your .env file in the backend root with the following keys:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_new_db_name
JWT_SECRET=your_super_secret_random_string
JWT_EXPIRE=7d

# Email Configuration (for OTPs)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Google reCAPTCHA (Backend Secret)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
Step 1.4: Mount Routes in index.js
In your main server file (e.g., index.js or server.js), import and use the auth routes:

javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// === INTEGRATE AUTH ROUTES HERE ===
const authRoutes = require('./auth/routes');
app.use('/auth', authRoutes);
// ==================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
2. Frontend Integration
Step 2.1: Install Dependencies
In your new frontend project directory, install the required packages:

bash
npm install axios lucide-react @react-oauth/google
(Note: Ensure you also have tailwindcss installed and configured as the UI relies on it.)

Step 2.2: Copy Files
Copy the auth folder from the source project (frontend/src/auth) to your new project's src directory.

Source: frontend/src/auth/
Destination: your-new-project/src/auth/
Ensure the folder contains:

AuthContext.jsx
AuthUI.jsx
authService.js
Step 2.3: Configure Environment Variables
Create or update your .env file in the frontend root:

env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
Step 2.4: Integrate into App.js
Wrap your application with the AuthProvider and use the AuthUI component.

javascript
import React from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthUI from './auth/AuthUI';

// Example wrapper component to handle auth state
const MainApp = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <AuthUI onSuccess={(user) => console.log('Logged in:', user)} />;
  }

  return (
    <div className="p-10">
      <h1>Welcome, {user.username}!</h1>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    // 1. Wrap everything in AuthProvider
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
3. How to Get Credentials
Google OAuth (Client ID & Secret)
Go to the Google Cloud Console.
Create a new project.
Navigate to APIs & Services > Credentials.
Click Create Credentials > OAuth client ID.
Select Web application.
Add Authorized JavaScript origins: http://localhost:3000 (and your production URL).
Add Authorized redirect URIs: http://localhost:3000 (and your production URL).
Copy the Client ID and Client Secret.
Google reCAPTCHA v3
Go to the Google reCAPTCHA Admin Console.
Register a new site.
Select reCAPTCHA v3.
Add your domains (localhost for development).
Copy the Site Key (Frontend & Backend) and Secret Key (Backend only).
Email (Gmail App Password)
Go to your Google Account settings.
Enable 2-Step Verification.
Search for App Passwords.
Create a new app password (name it "Nodemailer" or similar).
Use this 16-character password in EMAIL_PASSWORD.
Summary Checklist
 Backend: Installed npm packages.
 Backend: Copied auth/ folder.
 Backend: Updated .env with DB, Email, Google, and JWT keys.
 Backend: Mounted routes in index.js.
 Frontend: Installed npm packages.
 Frontend: Copied src/auth/ folder.
 Frontend: Updated .env with API URL and Google/Recaptcha keys.
 Frontend: Wrapped App in AuthProvider.