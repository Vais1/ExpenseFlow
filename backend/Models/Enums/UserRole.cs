namespace ExpenseFlow.Models.Enums;

/// <summary>
/// User role enumeration for the ExpenseFlow system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Employee role - can submit and view own expenses
    /// </summary>
    Employee = 0,

    /// <summary>
    /// Manager role - can approve/reject expenses
    /// </summary>
    Manager = 1,

    /// <summary>
    /// Administrator role - full system access
    /// </summary>
    Admin = 2
}

