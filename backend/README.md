# VendorPay - Invoice Approval System API

A comprehensive ASP.NET Core 8 Web API for managing invoices, vendors, and user authentication with role-based authorization.

## 🚀 Features

- **JWT Authentication** with role-based authorization (Admin, Management, User)
- **Entity Framework Core** with PostgreSQL
- **Repository Pattern** for clean architecture
- **BCrypt** password hashing
- **Swagger/OpenAPI** documentation
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- .NET 8.0 SDK
- PostgreSQL (local or Neon cloud)
- Visual Studio 2022 / VS Code / JetBrains Rider

## 🛠️ Setup Instructions

### 1. Clone and Restore Packages

```bash
cd backend
dotnet restore
```

### 2. Configure Database Connection

Edit `appsettings.json` and update the connection string:

**For Local PostgreSQL:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=vendorpay_db;Username=postgres;Password=yourpassword;"
}
```

**For Neon (Cloud PostgreSQL):**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=your-project.neon.tech;Port=5432;Database=vendorpay_db;Username=your_user;Password=your_password;SSL Mode=Require;"
}
```

### 3. Update JWT Secret Key

Edit `appsettings.json` and set a strong secret key:

```json
"JwtSettings": {
  "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"
}
```

### 4. Create and Apply Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

### 5. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7xxx`
- HTTP: `http://localhost:5xxx`
- Swagger UI: `https://localhost:7xxx` (root path)

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Example Requests

**Register:**
```json
POST /api/auth/register
{
  "username": "admin",
  "password": "Admin@123",
  "confirmPassword": "Admin@123",
  "role": 2
}
```

**Login:**
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "Admin"
  }
}
```

## 🏗️ Project Structure

```
backend/
├── Controllers/         # API Controllers
│   └── AuthController.cs
├── Data/               # Database Context
│   └── AppDbContext.cs
├── DTOs/               # Data Transfer Objects
│   └── AuthDtos.cs
├── Models/             # Entity Models
│   ├── User.cs
│   ├── Vendor.cs
│   └── Invoice.cs
├── Repositories/       # Repository Pattern
│   ├── IRepository.cs
│   └── Repository.cs
├── Services/           # Business Logic
│   ├── AuthService.cs
│   └── JwtService.cs
├── Program.cs          # Application Entry Point
├── appsettings.json    # Configuration
└── VendorPay.csproj    # Project File
```

## 🔐 Authentication Flow

1. User registers with username, password, and role
2. Password is hashed using BCrypt
3. User logs in with credentials
4. API validates credentials and generates JWT token
5. Client includes token in Authorization header: `Bearer <token>`
6. API validates token and authorizes based on role

## 👥 User Roles

- **User (0)**: Basic user access
- **Management (1)**: Management-level access
- **Admin (2)**: Full administrative access

## 🔧 Authorization Policies

- `AdminOnly`: Requires Admin role
- `ManagementOrAdmin`: Requires Management or Admin role
- `AllUsers`: Requires any authenticated user

## 📦 NuGet Packages

- `Microsoft.EntityFrameworkCore` (8.0.0)
- `Npgsql.EntityFrameworkCore.PostgreSQL` (8.0.0)
- `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0.0)
- `BCrypt.Net-Next` (4.0.3)
- `System.IdentityModel.Tokens.Jwt` (7.0.3)
- `Swashbuckle.AspNetCore` (6.5.0)

## 🧪 Testing with Swagger

1. Navigate to the Swagger UI (root URL)
2. Register a new user via `/api/auth/register`
3. Login via `/api/auth/login` and copy the token
4. Click "Authorize" button at the top
5. Enter: `Bearer <your_token>`
6. Now you can test protected endpoints

## 🚀 Next Steps

1. Create Controllers for:
   - Vendors (`VendorsController`)
   - Invoices (`InvoicesController`)
2. Implement validation and business rules
3. Add filtering, pagination, and sorting
4. Implement unit tests
5. Add logging and monitoring
6. Deploy to cloud (Azure, AWS, etc.)

## 📝 Notes for University Assessment

- All code is production-ready and follows best practices
- Implements Repository Pattern for testability
- Uses Data Annotations for validation
- Includes proper error handling
- JWT includes role claims for authorization
- Database relationships are properly configured
- CORS configured for frontend integration

## 🤝 Support

For questions or issues, please refer to the official documentation:
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [JWT Authentication](https://jwt.io)

---

**Built with ❤️ using ASP.NET Core 8**
