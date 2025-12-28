# MongoDB Setup Guide for ExpenseFlow Backend

## Current Issue
The backend is trying to connect to MongoDB at `localhost:27017`, but MongoDB is not running.

## Solution Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Sign up for MongoDB Atlas** (Free tier available)
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create a Cluster**
   - Choose the free M0 tier
   - Select a cloud provider and region
   - Wait for cluster creation (2-3 minutes)

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

6. **Create `.env` file in backend directory**
   ```env
   MongoDb__ConnectionString=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MongoDb__DatabaseName=expenseflow
   ```
   
   **Important:** Replace `username` and `password` with your actual MongoDB Atlas credentials!

### Option 2: Local MongoDB Installation (Windows)

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows, MSI package
   - Download and run the installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Use default settings (port 27017)

3. **Verify Installation**
   - MongoDB should start automatically as a Windows service
   - Check if it's running: Open Services (services.msc) and look for "MongoDB"

4. **Test Connection**
   - The backend will automatically connect when you restart it
   - Or test manually: `mongosh` in command prompt

### Option 3: Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After Setup

1. **Restart your backend server**
   - The connection will be tested automatically on startup
   - Look for: `"Successfully connected to MongoDB database: expenseflow"`

2. **Verify Connection**
   - Visit: http://localhost:5000/api/health
   - Should show: `"mongodb": { "connected": true }`

## Troubleshooting

### Connection Refused Error
- **MongoDB Atlas**: Check IP whitelist, verify credentials
- **Local MongoDB**: Ensure MongoDB service is running
- **Docker**: Check if container is running: `docker ps`

### Authentication Failed
- Verify username and password in connection string
- For Atlas: Check database user permissions

### Timeout Error
- Check firewall settings
- Verify network connectivity
- For Atlas: Ensure IP is whitelisted

## Current Configuration

The backend is configured to use:
- **Connection String**: `mongodb://localhost:27017` (from `appsettings.json`)
- **Database Name**: `expenseflow`

You can override these by creating a `.env` file in the `backend` directory.

