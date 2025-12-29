# Quick Setup Instructions

## 🚀 First Time Setup

1. **Install Dependencies**
   ```bash
   dotnet restore
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Configure Database**
   
   **Option A: Using Neon (Cloud PostgreSQL)**
   - Get your connection string from [Neon Console](https://console.neon.tech)
   - Edit `.env` and paste your Neon connection string:
     ```env
     DATABASE_URL=Host=your-project.neon.tech;Port=5432;Database=vendorpay_db;Username=your_user;Password=your_password;SSL Mode=Require;Trust Server Certificate=true
     ```
   
   **Option B: Using Local PostgreSQL**
   - Leave `.env` empty to use the default from `appsettings.json`
   - Or set a local connection in `.env`:
     ```env
     DATABASE_URL=Host=localhost;Port=5432;Database=vendorpay_db;Username=postgres;Password=yourpassword
     ```

4. **Generate JWT Secret**
   ```bash
   # Using OpenSSL (cross-platform)
   openssl rand -base64 48
   ```
   - Copy the output
   - Edit `appsettings.json`
   - Replace the `JwtSettings:SecretKey` value with your generated secret

5. **Apply Database Migrations**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

6. **Run the Application**
   ```bash
   dotnet run
   ```

7. **Test with Swagger**
   - Open browser to: `https://localhost:7xxx`
   - Try the authentication endpoints

## 📝 Configuration Summary

**Environment Variables (.env)**:
- `DATABASE_URL` - Neon PostgreSQL connection string (optional, falls back to appsettings.json)

**appsettings.json**:
- `JwtSettings:SecretKey` - **MUST change to a secure 32+ character secret**
- `JwtSettings:Issuer` - Token issuer (default: VendorPayAPI)
- `JwtSettings:Audience` - Token audience (default: VendorPayClient)
- `ConnectionStrings:DefaultConnection` - Fallback database connection

## 🔒 Security Reminders

- ✅ `.env` is in `.gitignore` - never commit it!
- ✅ Change JWT secret in `appsettings.json` before deploying
- ✅ Use strong database passwords
- ✅ For production, use environment variables or Azure Key Vault

## 📚 Full Documentation

- Setup: [README.md](README.md)
- API Endpoints: [API_GUIDE.md](API_GUIDE.md)
- Security: [SECURITY_CONFIG.md](SECURITY_CONFIG.md)
