# VendorPay - Security Configuration Guide

## 🔒 Secure Configuration Management

This guide explains how to securely manage sensitive configuration data like database credentials and JWT secrets without hardcoding them in your source code.

---

## 📋 Quick Start

### 1. Install DotNetEnv Package

```bash
cd backend
dotnet add package DotNetEnv
```

**Package Added**: `DotNetEnv` version 3.0.0 (already added to `VendorPay.csproj`)

### 2. Create Your .env File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# Use your favorite editor (VS Code, notepad, vim, etc.)
```

### 3. Fill in Your Secrets

Edit `.env` and replace placeholder values:

```env
# Example .env content
DATABASE_URL=Host=localhost;Port=5432;Database=vendorpay_db;Username=postgres;Password=your_secure_password
JWT_SECRET=your_actual_32_character_or_longer_secret_key_here_abcdefgh123456
```

### 4. Run Your Application

```bash
dotnet run
```

The application will automatically load variables from `.env` in development mode.

---

## 🗝️ Generating Strong JWT Secret

### Method 1: Using OpenSSL (Recommended)

```bash
# Generate a secure 64-character base64 string
openssl rand -base64 48
```

**Output Example**: `K8vJ9mN2pQ3rS4tU5vW6xY7zA8bC9dE0fG1hI2jK3lM4nO5pQ6rS7tU8vW9xY0zA==`

### Method 2: Using PowerShell (Windows)

```powershell
# Generate a secure random string
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

### Method 3: Using .NET User Secrets (Alternative)

```bash
# Initialize user secrets
dotnet user-secrets init

# Set JWT secret
dotnet user-secrets set "JwtSettings:SecretKey" "$(openssl rand -base64 48)"
```

### Method 4: Online Generator

Visit: [https://www.grc.com/passwords.htm](https://www.grc.com/passwords.htm)
- Use the "63 random printable ASCII characters" option
- **Never** use generated passwords from untrusted sources for production!

---

## 🗄️ Database Connection Strings

### Format for Neon PostgreSQL (Cloud)

```env
DATABASE_URL=Host=your-project-name.neon.tech;Port=5432;Database=vendorpay_db;Username=your_username;Password=your_password;SSL Mode=Require;Trust Server Certificate=true
```

**Required Parameters**:
- `Host`: Your Neon hostname (e.g., `ep-cool-darkness-123456.us-east-2.aws.neon.tech`)
- `Port`: Always `5432` for PostgreSQL
- `Database`: Your database name
- `Username`: Your Neon database user
- `Password`: Your database password
- `SSL Mode`: **Must be `Require`** for Neon
- `Trust Server Certificate`: Set to `true` for Neon

### Format for Local PostgreSQL

```env
DATABASE_URL=Host=localhost;Port=5432;Database=vendorpay_db;Username=postgres;Password=your_password
```

### Getting Your Neon Connection String

1. Log in to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard** or **Connection Details**
4. Copy the connection string
5. Convert from URL format to ADO.NET format if needed:

**URL Format** (from Neon):
```
postgres://user:password@host/database?sslmode=require
```

**ADO.NET Format** (for .NET):
```
Host=host;Database=database;Username=user;Password=password;SSL Mode=Require;Trust Server Certificate=true
```

---

## 🔧 How It Works in Program.cs

### Environment Variable Loading (Startup)

```csharp
// Load .env file in development
if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        Console.WriteLine("✓ Loaded environment variables from .env file");
    }
}
```

### Database Connection (Priority Order)

```csharp
// 1. Try DATABASE_URL from environment
// 2. Try NEON_DATABASE_URL from environment
// 3. Fall back to appsettings.json
// 4. Throw error if none found
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                       ?? Environment.GetEnvironmentVariable("NEON_DATABASE_URL")
                       ?? builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("Database connection not found");
```

### JWT Configuration (Priority Order)

```csharp
// Same priority: Environment > appsettings.json
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? builder.Configuration["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JWT Secret not found");

// Validate secret length
if (jwtSecret.Length < 32)
{
    throw new InvalidOperationException("JWT Secret must be at least 32 characters");
}
```

---

## 🚫 What NOT to Commit

### .gitignore Rules (Already Configured)

```gitignore
# NEVER commit these files!
.env
.env.local
.env.*.local
*.env

# Don't commit development settings
appsettings.Development.json

# Don't commit user secrets
secrets.json
```

### Files You SHOULD Commit

✅ `.env.example` - Template with placeholder values
✅ `appsettings.json` - **WITHOUT** sensitive data
✅ `.gitignore` - Protection rules

### Files You MUST NOT Commit

❌ `.env` - Contains actual secrets
❌ `appsettings.Development.json` - May contain local secrets
❌ `secrets.json` - User secrets file

---

## 🌍 Deployment (Production)

### Option 1: Environment Variables (Recommended)

Set environment variables in your hosting platform:

**Azure App Service**:
```bash
az webapp config appsettings set --name myapp --resource-group mygroup \
  --settings DATABASE_URL="Host=..." JWT_SECRET="..."
```

**Docker**:
```bash
docker run -e DATABASE_URL="Host=..." -e JWT_SECRET="..." myapp
```

**Heroku**:
```bash
heroku config:set DATABASE_URL="Host=..." JWT_SECRET="..."
```

### Option 2: Azure Key Vault (Enterprise)

```csharp
// In Program.cs
if (builder.Environment.IsProduction())
{
    var keyVaultUri = new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/");
    builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
}
```

### Option 3: AWS Secrets Manager

```csharp
// Add package: Amazon.Extensions.Configuration.SystemsManager
builder.Configuration.AddSystemsManager("/vendorpay/");
```

---

## ✅ Security Checklist

Before submitting or deploying:

- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] `appsettings.json` contains NO sensitive data
- [ ] JWT secret is at least 32 characters
- [ ] Database password is strong (12+ characters, mixed case, numbers, symbols)
- [ ] Production uses environment variables or key vault
- [ ] SSL/TLS enabled for database (Neon requires `SSL Mode=Require`)
- [ ] Application validates configuration on startup
- [ ] No hardcoded credentials in source code
- [ ] `.gitignore` is properly configured

---

## 🧪 Testing Your Configuration

### Verify Environment Loading

```bash
# Run the application
dotnet run

# Look for this message in console:
# ✓ Loaded environment variables from .env file
```

### Test Database Connection

```bash
# The app will fail to start if connection string is invalid
# Check console output for connection errors
```

### Verify JWT Secret

```bash
# Try to register/login via Swagger
# If JWT secret is too short, you'll get an error on startup
```

---

## 📚 Additional Resources

- [DotNetEnv Package](https://github.com/tonerdo/dotnet-env)
- [.NET Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)
- [Neon Documentation](https://neon.tech/docs/connect/connect-from-any-app)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/)

---

## 🎓 For University Assessment

**Security Best Practices Demonstrated**:

1. ✅ **Separation of Secrets**: Sensitive data separated from code
2. ✅ **Environment-Based Configuration**: Different configs for dev/prod
3. ✅ **Secure Defaults**: Application fails safely if secrets missing
4. ✅ **Strong Cryptography**: Validated JWT key length
5. ✅ **Version Control Safety**: `.gitignore` prevents accidental commits
6. ✅ **Documentation**: Clear setup instructions for teammates
7. ✅ **Industry Standard**: Using DotNetEnv (like Node.js's dotenv)

**Explain to Assessor**:
> "We use environment variables for sensitive configuration to prevent secrets from being committed to version control. The application loads from `.env` in development and system environment variables in production, with built-in validation to ensure security requirements are met."

---

## ⚠️ Important Notes

1. **Never commit `.env`**: This file contains real secrets
2. **Use .env.example**: Only commit the template
3. **Strong secrets**: Use cryptographically secure random strings  
4. **Rotate secrets**: Change JWT secret and database passwords regularly
5. **Production**: Use cloud provider secret management services
6. **Team collaboration**: Share `.env.example`, teammates create their own `.env`

---

**Your secrets are now safe!** 🔒✨
