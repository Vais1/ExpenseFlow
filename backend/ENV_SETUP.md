# Environment Variables Setup

This project uses `.env` files for configuration. The `.env` file is ignored by git for security.

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:

```env
# MongoDB Configuration
MongoDb__ConnectionString=mongodb://localhost:27017
MongoDb__DatabaseName=expenseflow

# JWT Configuration
Jwt__Key=YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm
Jwt__Issuer=ExpenseFlow
Jwt__Audience=ExpenseFlowUsers
Jwt__ExpirationMinutes=60
```

## MongoDB Connection String Examples

### Local MongoDB (Default)
```env
MongoDb__ConnectionString=mongodb://localhost:27017
```

### MongoDB with Authentication
```env
MongoDb__ConnectionString=mongodb://username:password@localhost:27017
```

### MongoDB Atlas (Cloud)
```env
MongoDb__ConnectionString=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### MongoDB with Specific Database in Connection String
```env
MongoDb__ConnectionString=mongodb://localhost:27017/expenseflow
```

## Environment Variable Naming Convention

ASP.NET Core uses double underscores (`__`) to represent nested configuration:
- `MongoDb__ConnectionString` maps to `MongoDb:ConnectionString` in JSON
- `Jwt__Key` maps to `Jwt:Key` in JSON

## Important Notes

- **Never commit `.env` file** - It contains sensitive information
- The `.env.example` file is safe to commit as it contains only placeholder values
- Environment variables override values in `appsettings.json`
- For production, use environment variables or Azure Key Vault / AWS Secrets Manager

## Alternative: Using Environment Variables Directly

Instead of using `.env` file, you can set environment variables directly:

### Windows (PowerShell)
```powershell
$env:MongoDb__ConnectionString="mongodb://localhost:27017"
$env:MongoDb__DatabaseName="expenseflow"
$env:Jwt__Key="YourSecretKeyHere"
```

### Windows (Command Prompt)
```cmd
set MongoDb__ConnectionString=mongodb://localhost:27017
set MongoDb__DatabaseName=expenseflow
set Jwt__Key=YourSecretKeyHere
```

### Linux/macOS
```bash
export MongoDb__ConnectionString="mongodb://localhost:27017"
export MongoDb__DatabaseName="expenseflow"
export Jwt__Key="YourSecretKeyHere"
```

### Docker
```yaml
environment:
  - MongoDb__ConnectionString=mongodb://mongo:27017
  - MongoDb__DatabaseName=expenseflow
  - Jwt__Key=YourSecretKeyHere
```

