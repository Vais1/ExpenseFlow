# Frontend-Backend Integration Guide

## Overview

The frontend is now fully connected to the backend API with complete authentication and expense management functionality.

## Setup Instructions

### 1. Backend Setup

1. **Configure MongoDB**:
   - Create `.env` file in `backend/` directory
   - Copy from `.env.example` and fill in your MongoDB Atlas connection string

2. **Configure JWT**:
   - Update JWT key in `.env` file (use a secure random string)

3. **Start Backend**:
   ```bash
   cd backend
   dotnet run
   ```
   Backend runs on `http://localhost:5000` (or check `Properties/launchSettings.json`)

### 2. Frontend Setup

1. **Configure API URL**:
   - Create `.env.local` file in `frontend/` directory
   - Add: `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Or update `lib/api/config.ts` directly

2. **Install Dependencies** (if not already installed):
   ```bash
   cd frontend
   npm install
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## Features Implemented

### Authentication
- ✅ Login page (`/login`)
- ✅ Register page (`/register`)
- ✅ JWT token storage in localStorage
- ✅ Automatic token injection in API requests
- ✅ Protected routes with authentication checks
- ✅ Auto-redirect to login on 401 errors

### Expense Management
- ✅ Submit new expenses (`POST /api/expenses`)
- ✅ View user's expenses (`GET /api/expenses/my-history`)
- ✅ View pending approvals - Manager only (`GET /api/expenses/pending`)
- ✅ Update expense status - Manager only (`PATCH /api/expenses/{id}/status`)

### UI Components
- ✅ Expense form with validation
- ✅ Expenses table with status badges
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback
- ✅ Sidebar navigation with role-based links

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Expenses (Protected - Requires JWT)
- `POST /api/expenses` - Submit new expense
- `GET /api/expenses/my-history` - Get user's expenses
- `GET /api/expenses/pending` - Get pending approvals (Manager only)
- `PATCH /api/expenses/{id}/status` - Update expense status (Manager only)

## Testing the Integration

1. **Register a new user**:
   - Go to `http://localhost:3000/register`
   - Fill in email, password, and full name
   - You'll be redirected to dashboard

2. **Submit an expense**:
   - Go to `http://localhost:3000/dashboard/expenses`
   - Click "New Claim"
   - Fill in the form and submit
   - Expense appears in the table

3. **Test as Manager**:
   - Register a user with role "Manager" (or update in database)
   - Login and navigate to "Approvals" in sidebar
   - View and approve/reject pending expenses

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured in `Program.cs`
- Check that frontend URL matches CORS allowed origins

### 401 Unauthorized Errors
- Check that JWT token is being stored in localStorage
- Verify token is being sent in Authorization header
- Check backend JWT configuration matches

### API Connection Errors
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend CORS allows frontend origin

### MongoDB Connection Errors
- Verify MongoDB connection string in `.env`
- Check MongoDB Atlas IP whitelist (if using Atlas)
- Ensure database name is correct

## File Structure

```
frontend/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx        # Register page
│   ├── dashboard/page.tsx       # Dashboard page
│   └── (dashboard)/
│       └── expenses/page.tsx    # Expenses page
├── components/
│   ├── expenses/
│   │   ├── create-expense-form.tsx
│   │   └── expenses-table.tsx
│   └── layout/
│       └── sidebar.tsx
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   ├── api/
│   │   ├── config.ts            # API configuration
│   │   ├── client.ts            # API client functions
│   │   ├── auth.ts              # Auth API calls
│   │   └── expenses.ts          # Expense API calls
│   └── hooks/
│       └── use-expenses.ts      # React Query hooks
└── providers/
    └── QueryProvider.tsx        # React Query provider
```

## Next Steps

- Add expense approval/rejection UI for managers
- Add expense detail view
- Add filtering and sorting to expenses table
- Add user profile page
- Add logout functionality to sidebar

