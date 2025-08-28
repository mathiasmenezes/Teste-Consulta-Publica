# Setup Guide for Prisma/SQLite Migration

This guide will help you set up the Form Builder PWA with the new Prisma/SQLite backend.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**

## Step 1: Install Dependencies

### Frontend
```bash
npm install
```

### Backend
```bash
cd backend
npm install
cd ..
```

## Step 2: Database Setup

1. **Configure the database connection**
   - Edit `backend/config.env`
   - The `DATABASE_URL` is already configured for SQLite:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. **Generate Prisma client and push schema**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

4. **Seed the database with demo data**
   ```bash
   npm run db:seed
   cd ..
   ```

## Step 3: Start the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Step 4: Verify Installation

1. Open `http://localhost:3000` in your browser
2. Login with the demo admin account:
   - Email: `admin@example.com`
   - Password: `admin123`

## Troubleshooting

### Database Connection Issues
- Verify your connection string in `backend/config.env`
- Check that the database file exists and is accessible

### Port Conflicts
- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- If ports are in use, update the PORT in `backend/config.env`

### CORS Issues
- The backend is configured to accept requests from `http://localhost:3000`
- If you change the frontend port, update `CORS_ORIGIN` in `backend/config.env`

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/social-login` - Social login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/validate-reset-token/:token` - Validate reset token

### Forms
- `GET /api/forms` - Get all forms (admin only)
- `GET /api/forms/active` - Get active forms
- `GET /api/forms/:id` - Get form by ID
- `POST /api/forms` - Create form (admin only)
- `PUT /api/forms/:id` - Update form (admin only)
- `DELETE /api/forms/:id` - Delete form (admin only)
- `POST /api/forms/:id/responses` - Submit form response
- `GET /api/forms/:id/responses` - Get form responses (admin only)
- `GET /api/forms/user/responses` - Get user's responses
- `GET /api/forms/stats/overview` - Get statistics (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Environment Variables

### Backend (`backend/config.env`)
```
DATABASE_URL="postgresql://username:password@localhost:5432/formbuilder?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
FACEBOOK_APP_ID="your-facebook-app-id"
```

### Frontend
The frontend will automatically connect to `http://localhost:5000/api` for the backend API.
