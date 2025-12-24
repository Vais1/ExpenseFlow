# Starting the Backend Server

## Quick Start

1. **Make sure you have a `.env` file** in the `backend` directory with your MongoDB connection string:
   ```env
   MongoDb__ConnectionString=mongodb+srv://awasmaan:22116024@expenseflow1.ksmwkku.mongodb.net/?appName=Expenseflow1
   MongoDb__DatabaseName=expenseflow
   Jwt__Key=YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm
   Jwt__Issuer=ExpenseFlow
   Jwt__Audience=ExpenseFlowUsers
   Jwt__ExpirationMinutes=60
   ```

2. **Start the backend server**:
   ```powershell
   cd backend
   dotnet run
   ```

   Or use the HTTP profile:
   ```powershell
   dotnet run --launch-profile http
   ```

3. **The backend will start on**: `http://localhost:5000`

4. **Verify it's running** by visiting:
   - Swagger UI: `http://localhost:5000/swagger`
   - Health check: `http://localhost:5000/api/auth/register` (should return 400 Bad Request if working)

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can:
- Kill the process using the port:
  ```powershell
  netstat -ano | findstr :5000
  # Then kill the process ID shown
  ```
- Or change the port in `Properties/launchSettings.json`

### MongoDB Connection Issues
- Make sure your MongoDB Atlas connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Verify the database name matches

### CORS Errors
- The backend is configured to allow requests from `http://localhost:3000` and `http://localhost:3001`
- Make sure your frontend is running on one of these ports

