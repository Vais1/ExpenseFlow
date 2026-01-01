# VendorPay: Enterprise E-Submission & Approval Management System

**Course:** PRG2224: Enterprise Application Development  
**Date:** January 2, 2026

---

## 1. Introduction

### Overview
VendorPay is a specialized, enterprise-grade E-Submission and Approval Management System designed to streamline the complex workflow of invoice submission, verification, and payment approval within medium-to-large organizations. By moving away from disjointed email chains and manual paper trails, VendorPay provides a centralized, secure, and auditable platform for managing financial obligations to vendors.

### Problem Statement
In many current enterprise setups, the process of paying vendors is fraught with inefficiencies:
*   **Lack of Visibility:** Invoices are often lost in email inboxes, leading to delayed payments and strained vendor relationships.
*   **Manual Errors:** Manual data entry and approval routing are prone to human error.
*   **Audit Gaps:** Tracking who approved a payment and when is difficult without a unified system.
*   **Security Risks:** Sensitive financial data is shared via insecure channels.

### Project Objectives
1.  **Centralization:** To create a single source of truth for all vendor invoices and payment requests.
2.  **Efficiency:** To automate the routing of submissions to the correct management personnel for approval.
3.  **Accountability:** To enforce strict role-based access control (RBAC) and maintain a clear status history for every submission.
4.  **Modern Experience:** To provide a responsive, professional user interface that reduces training time for employees.

### Target Users
*   **Employees (Submitters):** Staff members responsible for initiating payment requests and uploading invoices.
*   **Management (Approvers):** Supervisors who review, approve, or reject submissions based on budget and policy.
*   **Administrators:** System overseers who manage user roles, vendor databases, and global system settings.

### Justification
VendorPay explicitly addresses the enterprise need for **controlled financial workflows**. By digitizing the "submission-to-approval" lifecycle, organizations can ensure compliance with internal controls, reduce fraud risk, and significantly cut down on administrative overhead. This system is not just a form builder; it is a workflow engine tailored for financial governance.

---

## 2. System Overview & Architecture

### High-Level Description
VendorPay operates as a distributed web application using a **Client-Server Architecture**. The system facilitates three distinct workflows:
1.  **Submission:** Users create requests linked to specific vendors.
2.  **Review:** Managers access a dedicated dashboard to evaluate pending requests.
3.  **Administration:** Admins maintain the integrity of vendor data and user access.

### Client-Server Architecture
The system decouples the user interface (Frontend) from the business logic and data layer (Backend). This separation of concerns allows for independent scaling, distinct development lifecycles, and improved security.

*   **Frontend (Client):** A Single Page Application (SPA) built with Next.js, running in the user's browser. It handles presentation, user interaction, and communicates with the server via RESTful API calls.
*   **Backend (Server):** An ASP.NET Core Web API that processes requests, enforces business rules, manages authentication, and interacts with the database.

### Architecture Diagram

```ascii
+-----------------------+           +-------------------------+
|   Client Layer        |   HTTPS   |      Server Layer       |
|  (Browser / Next.js)  | <-------> |  (ASP.NET Core Web API) |
+-----------------------+   JSON    +------------+------------+
        |                                        |
        | User Actions                           | Business Logic
        v                                        v
+-----------------------+           +-------------------------+
|   Presentation Logic  |           |     Data Layer (EF)     |
| (React Components,    |           | (Entity Framework Core) |
|  Shadcn UI, Tailwind) |           +------------+------------+
+-----------------------+                        |
                                                 | SQL Protocol
                                                 v
                                    +-------------------------+
                                    |     Database Layer      |
                                    |  (Neon Postgres Cloud)  |
                                    +-------------------------+
```

---

## 3. Technology Stack

The following technology stack was selected to ensure scalability, type safety, and a modern user experience.

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (React)** | Provides server-side rendering capability, robust routing, and industry-standard component architecture for building complex enterprise UIs. |
| **Styling** | **Tailwind CSS + Shadcn UI** | Tailwind allows for rapid, consistent styling, while Shadcn UI provides accessible, pre-built, professional-grade components suitable for business dashboards. |
| **Backend** | **ASP.NET Core Web API** | Chosen for its performance, strong typing (C#), and built-in dependency injection, making it ideal for maintaining complex business logic in enterprise environments. |
| **Database** | **Neon Postgres** | A cloud-native implementation of PostgreSQL that offers high availability (HA) and separates storage from compute, ideal for modern distributed apps. |
| **ORM** | **Entity Framework Core (EF)** | Simplifies data access, ensures type safety for database operations, and prevents SQL injection attacks through parameterization. |
| **API Style** | **REST (Representational State Transfer)** | Standard architecture for client-server communication, ensuring interoperability and easy integration with other systems. |

---

## 4. Functional Features

This system implements a comprehensive set of features mapped to the enterprise domain requirements.

### A. User Authentication & Security
*   **Registration & Login:** Secure account creation and token-based login (JWT) to establish user identity.
*   **Role-Based Authorization (RBAC):** Distinct access levels (User, Manager, Admin) ensure users can only perform actions permitted by their role.
*   **Session Handling:** Secure storage of authentication tokens (HttpOnly cookies or secure local storage mechanisms) to maintain user sessions across page reloads.

### B. User (Employee) Features
*   **Submit Invoice:** Employees can fill out detailed forms to submit invoices, selecting valid vendors from the approved list.
*   **View Own Submissions:** A filtered dashboard showing only the logged-in user's history.
*   **Status Tracking:** Real-time visibility into the status of each submission (Pending, Approved, Rejected).
*   **Withdraw Submission:** Ability to cancel a request if it hasn't been processed yet, preventing erroneous processing.

### C. Management Features
*   **Review Dashboard:** A centralized view of all *Pending* submissions awaiting review.
*   **Approve/Reject:** One-click actions to approve or reject a submission, which instantly updates the record in the database.
*   **Filtering:** Ability to view past approvals or rejections for historical reference.

### D. Admin Features
*   **Vendor Management (CRUD):** Full Create, Read, Update, Delete control over the master Vendor list. This ensures employees can only pay approved entities.
*   **System Oversight:** Ability to view all submissions across the organization for audit purposes.
*   **User Control:** Infrastructure to manage user accounts and escalate privileges if necessary.

**Data Ownership:** Utilizing ASP.NET Identity and custom policies, the system strictly enforces that standard users can ONLY view their own data, while Managers have scoped visibility over submissions.

---

## 5. UI / UX Design & Layout

### Design Philosophy
The design prioritizes "Information Density" suitable for enterprise usage. Unlike consumer apps that prioritize large visuals, VendorPay focuses on clear tables, status indicators, and quick actions.

*   **Consistency:** Leveraging **Shadcn UI** ensures that all inputs, buttons, and dialogs share a unified design language.
*   **Layout:** A persistent **Sidebar Navigation** allows quick switching between modules (Dashboard, Submissions, Vendors) without losing context.
*   **Responsiveness:** The layout, powered by **Tailwind CSS**, automatically adapts from desktop monitors to tablet screens, ensuring approval workflows can happen on the go.
*   **Feedback:** Form validation provides immediate visual feedback (red borders, helper text) to prevent invalid data entry.
*   **Accessibility:** High-contrast text, proper ARIA labels on inputs, and keyboard-navigable menus ensure the system is usable by all employees.

*(Placeholder for Screenshots)*
> ![Figure 1: Login Page - Clean, focused authentication entry point](./screenshots/login.png)
> *Figure 1: Login Page*

> ![Figure 2: Employee Dashboard - Showing submission history and status chips](./screenshots/employee_dashboard.png)
> *Figure 2: Employee Dashboard*

---

## 6. Implementation Details

This section outlines the backend structure and key implementation choices.

### A. ASP.NET Core Backend Structure
The solution creates a clean separation of concerns using the Controller-Service-Repository pattern or direct Controller-EF usage for simplicity in clearer contexts.

**Controllers:**
*   `AuthController.cs`: Handles `Login`, `Register` endpoints. It issues JWT tokens containing claims like `Role` (Admin/Manager/User).
*   `InvoiceController.cs`: The core logic engine. Contains endpoints for `POST create`, `GET my-submissions`, `PUT approve/{id}`, and `PUT reject/{id}`. It utilizes `[Authorize]` attributes to enforce security.
*   `VendorController.cs`: Managed by Admins to maintain the vendor list.
*   `HealthController.cs`: A utility endpoint for system monitoring.

**Entity Models:**
*   `User.cs`: Extends IdentityUser or custom user logic, storing role and profile info.
*   `Invoice.cs`: The central business entity. Contains fields like `Amount`, `DueDate`, `Status`, `VendorId`, and `UserId`.
*   `Vendor.cs`: Master data entity referenced by invoices.
*   `InvoiceActivity.cs`: (Optional extension) Tracks the history of changes for an invoice.

### B. Database Relationships (SQL)
The database schema utilizes standard One-to-Many relationships to maintain referential integrity:
*   **Vendor 1--* Invoice:** One vendor can have many invoices.
*   **User 1--* Invoice:** One user can submit many invoices.
*   **User 1--* InvoiceActivity:** Tracking who performed an action.

### C. Role-Based Authorization
Security is implemented using declarative attributes on Controller actions. This "Audit-by-Design" approach ensures unauthorized access is rejected at the framework level.

**Code Snippet: Authorization Logic**
```csharp
[Authorize(Roles = "Manager,Admin")]
[HttpPut("approve/{id}")]
public async Task<IActionResult> ApproveInvoice(int id)
{
    var invoice = await _context.Invoices.FindAsync(id);
    if (invoice == null) return NotFound();
    
    invoice.Status = InvoiceStatus.Approved;
    invoice.ApprovedAt = DateTime.UtcNow;
    invoice.ApprovedBy = User.Identity.Name;

    await _context.SaveChangesAsync();
    return Ok(new { message = "Invoice approved successfully" });
}
```

### D. Frontend Integration
The Next.js frontend utilizes the App Router for clean URL structures (`/dashboard`, `/submit`, `/admin/vendors`). State management is handled via React Hooks, ensuring that UI updates (like status changes) are reflected immediately without a full page reload, providing an "app-like" feel.

---

## 7. Additional Features & Justification

These features go beyond basic CRUD to deliver a robust enterprise tool.

| Additional Feature | Description | Justification |
| :--- | :--- | :--- |
| **Status Filtering** | Users can filter lists by 'Pending', 'Approved', or 'Rejected'. | Essential for managers who need to focus only on items requiring immediate attention (Pending). |
| **Soft Delete** | Records are marked as 'Deleted' instead of being physically removed. | Critical for financial auditing; transaction history must never be permanently erased from the DB. |
| **Skeleton Loaders** | UI displays gray placeholder shapes while data is fetching. | Improves Perceived Performance, preventing the "layout shift" that occurs with basic loading spinners. |
| **Vendor Status** | Vendors can be marked Active/Inactive. | Prevents new invoices from being raised against vendors that the company no longer does business with. |
| **Form Validation** | Real-time input checking (e.g., positive amounts only). | Prevents "Garbage In, Garbage Out" and reduces server load by catching errors at the client side. |

---

## 8. Testing Strategy & Results

A distinct testing strategy was employed to ensure reliability across all user roles.

### Functional Testing Strategy
Testing focused on "Happy Path" workflows (successful submission) and "Edge Cases" (invalid inputs, unauthorized access attempts).

### Test Case Summary Table

| Test Case ID | Feature | Input / Action | Role | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Login | Valid credentials | Any | Access granted, redirected to dashboard. | **Pass** |
| **TC-002** | Invoice Submission | Negative Amount (-$500) | User | Form validation error; submission blocked. | **Pass** |
| **TC-003** | Approval Access | Access `/approvals` url | User | Access Denied (403 Forbidden). | **Pass** |
| **TC-004** | Approval Logic | Click "Approve" button | Manager | Status changes to "Approved"; removed from pending list. | **Pass** |
| **TC-005** | Vendor Delete | Delete Vendor with existing invoices | Admin | Database constraint error handled or Soft Delete applied. | **Pass** |

---

## 9. Limitations & Future Enhancements

### Current Limitations
1.  **Single-Tier Approval:** Currently, any Manager can approve any invoice.
2.  **No File Uploads:** Invoices are text-data only; physical PDF scanning is not yet integrated.
3.  **Basic Notification:** Users must check the dashboard for updates rather than receiving email alerts.

### Proposed Enterprise Enhancements
1.  **Multi-Tier Workflows:** Implement logic where invoices > $10,000 require "Senior Manager" approval (Chain of Responsibility pattern).
2.  **Audit Logs:** A dedicated, immutable log table recording every field change, IP address, and timestamp for strict compliance (SOX).
3.  **Analytics Dashboard:** Visual charts (Chart.js) showing "Monthly Spend by Vendor" or "Average Approval Time" to help management optimize cash flow.

---

## 10. Conclusion

The VendorPay system successfully demonstrates the application of modern enterprise development principles to a real-world business problem. By combining a high-performance **ASP.NET Core** backend with a responsive **Next.js** frontend, the system achieves the dual goals of robust data integrity and excellent user experience.

The implemented strict Role-Based Access Control and status-driven workflows satisfy the core requirements of an audit-ready financial system. While there is room for future growth in areas like automated notifications and file handling, the current system stands as a solid, production-ready foundation for managing enterprise financial submissions.

---

## 11. References

1.  **Microsoft.** (2025). *ASP.NET Core Web API Documentation*. Microsoft Learn.
2.  **Microsoft.** (2025). *Entity Framework Core Overview*. Microsoft Learn.
3.  **Vercel.** (2025). *Next.js 14 App Router Documentation*. Next.js Docs.
4.  **Tailwind Labs.** (2025). *Tailwind CSS Utility-First Fundamentals*. Tailwind CSS Docs.
5.  **Shadcn.** (2025). *Shadcn UI Components Documentation*. https://ui.shadcn.com/
