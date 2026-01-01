using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Repositories;

namespace VendorPay.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> CreateManagerAsync(CreateManagerDto dto);
}

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IJwtService _jwtService;

    public AuthService(IRepository<User> userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Public registration - always creates User role regardless of input.
    /// </summary>
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if user already exists
        var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Username == registerDto.Username);
        if (existingUser != null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Username already exists"
            };
        }

        // Hash the password
        var passwordHash = HashPassword(registerDto.Password);

        // Create new user - ALWAYS User role (enforced by backend)
        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = passwordHash,
            Role = UserRole.User, // Hardcoded - no role from frontend
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Registration successful",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString()
            }
        };
    }

    /// <summary>
    /// Admin-only: Create a Manager account.
    /// </summary>
    public async Task<AuthResponseDto> CreateManagerAsync(CreateManagerDto dto)
    {
        // Check if user already exists
        var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (existingUser != null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Username already exists"
            };
        }

        // Hash the password
        var passwordHash = HashPassword(dto.Password);

        // Create Manager user
        var user = new User
        {
            Username = dto.Username,
            PasswordHash = passwordHash,
            Role = UserRole.Management,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return new AuthResponseDto
        {
            Success = true,
            Message = "Manager account created successfully",
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString()
            }
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Find user by username
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
        if (user == null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid username or password"
            };
        }

        // Verify password
        if (!VerifyPassword(loginDto.Password, user.PasswordHash))
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid username or password"
            };
        }

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString()
            }
        };
    }

    // Password hashing using BCrypt
    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}
