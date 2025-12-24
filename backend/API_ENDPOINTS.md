# ExpenseFlow API Endpoints

## Base URL
- **Development**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "role": "Employee" // Optional: "Employee", "Manager", or "Admin"
  }
  ```
- **Response**: `201 Created` with JWT token

### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with JWT token

## Expense Endpoints (Require Authentication)

### Submit Expense
- **POST** `/api/expenses`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": 100.50,
    "category": "Travel",
    "description": "Flight ticket",
    "dateIncurred": "2024-12-24T00:00:00Z"
  }
  ```

### Get My Expenses
- **GET** `/api/expenses/my-history`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of expense objects

### Get Pending Approvals (Manager Only)
- **GET** `/api/expenses/pending`
- **Headers**: `Authorization: Bearer <token>`
- **Role Required**: Manager or Admin
- **Response**: Array of pending expense objects

### Update Expense Status (Manager Only)
- **PATCH** `/api/expenses/{id}/status`
- **Headers**: `Authorization: Bearer <token>`
- **Role Required**: Manager or Admin
- **Body**:
  ```json
  {
    "status": "Approved", // or "Rejected"
    "reason": "Approved for reimbursement" // Required if Rejected
  }
  ```

### Update Expense (Employee Only, Pending Only)
- **PUT** `/api/expenses/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as Submit Expense

### Withdraw Expense (Employee Only, Pending Only)
- **PATCH** `/api/expenses/{id}/withdraw`
- **Headers**: `Authorization: Bearer <token>`

## Health Check
- **GET** `/api/health`
- **Response**: `200 OK` with service status

## Testing the API

1. **Using Swagger UI**: Visit `http://localhost:5000/swagger`
2. **Using curl**:
   ```powershell
   # Register
   curl http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test123","fullName":"Test User"}'
   
   # Login
   curl http://localhost:5000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test123"}'
   ```

3. **Using Postman or Thunder Client**: Import the endpoints and test with the Swagger JSON

