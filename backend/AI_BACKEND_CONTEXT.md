# Backend Context for AI

## Technology Stack
- **Framework**: ASP.NET Core 8 Web API
- **Language**: C# 12
- **Database**: PostgreSQL (via EF Core 8)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer (HS256)
- **Documentation**: Swagger/OpenAPI (`/swagger`)

## Architecture
- **Pattern**: Controller-Service-Repository
- **DI Container**: Standard .NET `IServiceCollection`
- **Configuration**: `appsettings.json` + `.env` (using DotNetEnv)

## Authentication & Authorization
- **Roles**:
  - `0`: User (Standard access)
  - `1`: Management (Can approve invoices)
  - `2`: Admin (Full access, manages vendors)
- **JWT Claims**: `sub` (UserId), `unique_name` (Username), `role` (RoleName)

## REST API Endpoints

### Auth (`/api/auth`)
- `POST /register`: Create account `{ username, password, role }`
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "john.doe", "role": "User" }
  }
  ```
- `POST /login`: Get JWT token `{ username, password }`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "john.doe", "role": "User" }
  }
  ```
- `GET /me`: Validate token & get user info
  ```json
  {
    "userId": "1",
    "username": "john.doe",
    "role": "User",
    "message": "Authentication successful"
  }
  ```

### Vendors (`/api/vendor`)
- `GET /`: List all vendors (Auth required)
  ```json
  [
    {
      "id": 1,
      "name": "Acme Corp",
      "category": "Office Supplies",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- `GET /{id}`: Get vendor specifics (Auth required) (Same object as list item)
- `POST /`: Create vendor (Admin only) `{ name, category }`
  ```json
  {
    "id": 2,
    "name": "Tech Supplies",
    "category": "IT",
    "createdAt": "2024-01-02T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
  ```
- `PUT /{id}`: Update vendor (Admin only) (Returns updated object)
- `DELETE /{id}`: Archive vendor (Admin only) (204 No Content)

### Invoices (`/api/invoice`)
- `GET /`: List invoices (User: Own / Mgmt/Admin: All)
  ```json
  [
    {
      "id": 1,
      "amount": 1500.50,
      "status": "Pending",
      "description": "Office equipment",
      "vendorId": 1,
      "userId": 2,
      "vendorName": "Acme Corp",
      "vendorCategory": "Office Supplies",
      "username": "john.doe",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
  ```
- `GET /{id}`: Get specific invoice (Same object as list item)
- `POST /`: Submit invoice `{ amount, description, vendorId }` (Auto-status: Pending)
  ```json
  {
    "id": 2,
    "amount": 500.00,
    "status": "Pending",
    "description": "Mouse & Keyboard",
    "vendorId": 1,
    "userId": 2,
    "vendorName": "Acme Corp",
    "vendorCategory": "Office Supplies",
    "username": "john.doe",
    "createdAt": "2024-01-16T10:30:00Z",
    "updatedAt": "2024-01-16T10:30:00Z"
  }
  ```
- `PATCH /{id}/status`: Approve/Reject `{ status }` (Mgmt/Admin only)
  - `status`: `0=Pending`, `1=Approved`, `2=Rejected`
  ```json
  {
    "id": 1,
    "status": "Approved",
    "amount": 1500.50,
    ...
  }
  ```
- `DELETE /{id}`: Delete invoice (204 No Content)

### System (`/api/health`)
- `GET /`: API liveness check
  ```json
  { "status": "Healthy" }
  ```
- `GET /ready`: Database connectivity check
  ```json
  { "status": "Ready" }
  ```

## Frontend Integration Guidelines (Next.js/TypeScript)

### 1. Type Safety
- **Strict Mode**: Ensure `strict: true` is enabled in `tsconfig.json`.
- **DTO Matching**: Frontend types MUST strictly match backend DTOs.
- **Zod Validation**: Use **Zod** schemas to validate API responses at runtime.
  ```typescript
  // Example: types/vendor.ts
  import { z } from "zod";

  export const VendorSchema = z.object({
    id: z.number(),
    name: z.string(),
    category: z.string(),
    createdAt: z.string().datetime(), // ISO 8601
  });
  
  export type Vendor = z.infer<typeof VendorSchema>;
  ```

### 2. Data Fetching (TanStack Query)
- **Pattern**: Use TanStack Query (React Query) for all server state.
- **Keys**: Use **Query Key Factories** to prevent key collisions.
  ```typescript
  export const vendorKeys = {
    all: ["vendors"] as const,
    detail: (id: number) => [...vendorKeys.all, id] as const,
  };
  ```
- **Mutations**: Always invalidate relevant query keys on success.
  ```typescript
  // hooks/useCreateInvoice.ts
  return useMutation({
    mutationFn: (data: InvoiceCreateDto) => api.post("/invoice", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
  ```

### 3. API Communication
- **Client vs Server**:
  - Prefer **Server Actions** for form submissions where possible (Next.js 14+).
  - Use **Client Components** + React Query for interactive data dashboards.
- **Environment**: Access API URL via type-safe env variables (e.g., `process.env.NEXT_PUBLIC_API_URL`).
- **Auth Token**: Pass JWT in `Authorization: Bearer <token>` header for all protected requests.

### 4. Component Architecture
- **Structure**: `components/ui` (Shadcn/generic), `components/features/{feature}` (Domain specific).
- **Props**: Use TS interfaces for props, extending `HTMLAttributes` appropriately.
