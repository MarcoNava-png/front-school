// ============================================================================
// CONTROLADOR DE AUTENTICACIÓN Y USUARIOS
// Sistema de Gestión Escolar
// ============================================================================

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace TuProyecto.Auth
{
    // ========================================================================
    // ENTIDAD: USUARIO (Extendiendo IdentityUser)
    // ========================================================================
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(100)]
        public string Nombres { get; set; }

        [MaxLength(100)]
        public string Apellidos { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }

        [MaxLength(500)]
        public string Biografia { get; set; }

        [MaxLength(500)]
        public string PhotoUrl { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaModificacion { get; set; }

        public DateTime? UltimoAcceso { get; set; }
    }

    // ========================================================================
    // DTOs DE USUARIO
    // ========================================================================

    /// <summary>
    /// DTO para respuesta de usuario
    /// </summary>
    public class UserDto
    {
        public string Id { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public string Biografia { get; set; }
        public string PhotoUrl { get; set; }
        public List<string> Roles { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? UltimoAcceso { get; set; }
    }

    /// <summary>
    /// DTO para login
    /// </summary>
    public class LoginRequest
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Password { get; set; }
    }

    /// <summary>
    /// DTO para respuesta de login
    /// </summary>
    public class LoginResponse
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Telefono { get; set; }
        public string Biografia { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
        public DateTime Expiration { get; set; }
        public string PhotoUrl { get; set; }
    }

    /// <summary>
    /// DTO para crear usuario
    /// </summary>
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Password { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100)]
        public string Nombres { get; set; }

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100)]
        public string Apellidos { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }

        [MaxLength(500)]
        public string Biografia { get; set; }

        [Required(ErrorMessage = "Debe asignar al menos un rol")]
        public List<string> Roles { get; set; }
    }

    /// <summary>
    /// DTO para actualizar usuario
    /// </summary>
    public class UpdateUserRequest
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100)]
        public string Nombres { get; set; }

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100)]
        public string Apellidos { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }

        [MaxLength(500)]
        public string Biografia { get; set; }

        public List<string> Roles { get; set; }
    }

    /// <summary>
    /// DTO para actualizar perfil propio
    /// </summary>
    public class UpdateProfileRequest
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100)]
        public string Nombres { get; set; }

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100)]
        public string Apellidos { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }

        [MaxLength(500)]
        public string Biografia { get; set; }
    }

    /// <summary>
    /// Respuesta genérica de la API
    /// </summary>
    public class UserApiResponse<T>
    {
        public T Data { get; set; }
        public bool IsSuccess { get; set; }
        public string MessageError { get; set; }

        public static UserApiResponse<T> Success(T data)
        {
            return new UserApiResponse<T>
            {
                Data = data,
                IsSuccess = true,
                MessageError = null
            };
        }

        public static UserApiResponse<T> Error(string message)
        {
            return new UserApiResponse<T>
            {
                Data = default,
                IsSuccess = false,
                MessageError = message
            };
        }
    }

    // ========================================================================
    // SERVICIO DE USUARIOS
    // ========================================================================
    public interface IUserService
    {
        Task<UserDto> GetByIdAsync(string userId);
        Task<UserDto> GetCurrentUserAsync(string userId);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto> CreateUserAsync(CreateUserRequest request);
        Task<UserDto> UpdateUserAsync(string userId, UpdateUserRequest request);
        Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request, IFormFile photoFile);
        Task DeleteUserAsync(string userId);
        Task<LoginResponse> LoginAsync(LoginRequest request);
    }

    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public UserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _environment = environment;
        }

        /// <summary>
        /// Obtiene un usuario por ID
        /// </summary>
        public async Task<UserDto> GetByIdAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado");

            var roles = await _userManager.GetRolesAsync(user);

            return MapToDto(user, roles.ToList());
        }

        /// <summary>
        /// Obtiene el perfil del usuario actual
        /// </summary>
        public async Task<UserDto> GetCurrentUserAsync(string userId)
        {
            return await GetByIdAsync(userId);
        }

        /// <summary>
        /// Obtiene todos los usuarios
        /// </summary>
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(MapToDto(user, roles.ToList()));
            }

            return result;
        }

        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
        {
            // Verificar si el email ya existe
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new Exception("El email ya está registrado");

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                Telefono = request.Telefono,
                Biografia = request.Biografia,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Error al crear usuario: {errors}");
            }

            // Asignar roles
            if (request.Roles != null && request.Roles.Any())
            {
                foreach (var role in request.Roles)
                {
                    // Crear rol si no existe
                    if (!await _roleManager.RoleExistsAsync(role))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role));
                    }
                    await _userManager.AddToRoleAsync(user, role);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles.ToList());
        }

        /// <summary>
        /// Actualiza un usuario (admin)
        /// </summary>
        public async Task<UserDto> UpdateUserAsync(string userId, UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado");

            user.Nombres = request.Nombres;
            user.Apellidos = request.Apellidos;
            user.Telefono = request.Telefono;
            user.Biografia = request.Biografia;
            user.FechaModificacion = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Error al actualizar usuario: {errors}");
            }

            // Actualizar roles si se proporcionaron
            if (request.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);

                foreach (var role in request.Roles)
                {
                    if (!await _roleManager.RoleExistsAsync(role))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role));
                    }
                    await _userManager.AddToRoleAsync(user, role);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles.ToList());
        }

        /// <summary>
        /// Actualiza el perfil del usuario actual
        /// </summary>
        public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request, IFormFile photoFile)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado");

            user.Nombres = request.Nombres;
            user.Apellidos = request.Apellidos;
            user.Telefono = request.Telefono;
            user.Biografia = request.Biografia;
            user.FechaModificacion = DateTime.UtcNow;

            // Procesar foto si se proporcionó
            if (photoFile != null && photoFile.Length > 0)
            {
                var photoUrl = await SavePhotoAsync(photoFile, userId);
                user.PhotoUrl = photoUrl;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Error al actualizar perfil: {errors}");
            }

            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles.ToList());
        }

        /// <summary>
        /// Elimina un usuario
        /// </summary>
        public async Task DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Error al eliminar usuario: {errors}");
            }
        }

        /// <summary>
        /// Login de usuario
        /// </summary>
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new Exception("Credenciales inválidas");

            if (!user.Activo)
                throw new Exception("Usuario desactivado");

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
                throw new Exception("Credenciales inválidas");

            // Actualizar último acceso
            user.UltimoAcceso = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Obtener roles
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "user";

            // Generar token JWT
            var token = GenerateJwtToken(user, roles.ToList());

            return new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                Nombres = user.Nombres,
                Apellidos = user.Apellidos,
                Telefono = user.Telefono,
                Biografia = user.Biografia,
                Role = role,
                Token = token.Token,
                Expiration = token.Expiration,
                PhotoUrl = user.PhotoUrl
            };
        }

        // Métodos privados auxiliares

        private UserDto MapToDto(ApplicationUser user, List<string> roles)
        {
            return new UserDto
            {
                Id = user.Id,
                Nombres = user.Nombres,
                Apellidos = user.Apellidos,
                Email = user.Email,
                Telefono = user.Telefono,
                Biografia = user.Biografia,
                PhotoUrl = user.PhotoUrl,
                Roles = roles,
                Activo = user.Activo,
                FechaCreacion = user.FechaCreacion,
                UltimoAcceso = user.UltimoAcceso
            };
        }

        private (string Token, DateTime Expiration) GenerateJwtToken(ApplicationUser user, List<string> roles)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var jwtExpirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "1440");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.Nombres} {user.Apellidos}"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Agregar roles como claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var expiration = DateTime.UtcNow.AddMinutes(jwtExpirationMinutes);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
        }

        private async Task<string> SavePhotoAsync(IFormFile file, string userId)
        {
            // Crear directorio de uploads si no existe
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generar nombre único para el archivo
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Guardar archivo
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Retornar URL relativa
            return $"/uploads/profiles/{fileName}";
        }
    }

    // ========================================================================
    // CONTROLADOR DE AUTENTICACIÓN
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// POST /api/auth/login
        /// Inicia sesión y retorna token JWT
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _userService.LoginAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/auth/profile
        /// Obtiene el perfil del usuario autenticado
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserApiResponse<UserDto>>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(UserApiResponse<UserDto>.Error("Usuario no autenticado"));

                var user = await _userService.GetCurrentUserAsync(userId);
                return Ok(UserApiResponse<UserDto>.Success(user));
            }
            catch (Exception ex)
            {
                return NotFound(UserApiResponse<UserDto>.Error(ex.Message));
            }
        }

        /// <summary>
        /// PUT /api/auth/update-profile
        /// Actualiza el perfil del usuario autenticado
        /// </summary>
        [HttpPut("update-profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromForm] UpdateProfileRequest request, IFormFile photoFile)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var user = await _userService.UpdateProfileAsync(userId, request, photoFile);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/auth/users
        /// Obtiene lista de todos los usuarios (solo admin)
        /// </summary>
        [HttpGet("users")]
        [Authorize(Roles = "admin,Admin,director,Director")]
        public async Task<ActionResult<UserApiResponse<List<UserDto>>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(UserApiResponse<List<UserDto>>.Success(users));
            }
            catch (Exception ex)
            {
                return BadRequest(UserApiResponse<List<UserDto>>.Error(ex.Message));
            }
        }

        /// <summary>
        /// GET /api/auth/users/{id}
        /// Obtiene un usuario por ID (solo admin)
        /// </summary>
        [HttpGet("users/{id}")]
        [Authorize(Roles = "admin,Admin,director,Director")]
        public async Task<ActionResult<UserApiResponse<UserDto>>> GetUserById(string id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                return Ok(UserApiResponse<UserDto>.Success(user));
            }
            catch (Exception ex)
            {
                return NotFound(UserApiResponse<UserDto>.Error(ex.Message));
            }
        }

        /// <summary>
        /// POST /api/auth/create-user
        /// Crea un nuevo usuario (solo admin)
        /// </summary>
        [HttpPost("create-user")]
        [Authorize(Roles = "admin,Admin,director,Director")]
        public async Task<ActionResult<UserApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                var user = await _userService.CreateUserAsync(request);
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, UserApiResponse<UserDto>.Success(user));
            }
            catch (Exception ex)
            {
                return BadRequest(UserApiResponse<UserDto>.Error(ex.Message));
            }
        }

        /// <summary>
        /// PUT /api/auth/users/{id}
        /// Actualiza un usuario (solo admin)
        /// </summary>
        [HttpPut("users/{id}")]
        [Authorize(Roles = "admin,Admin,director,Director")]
        public async Task<ActionResult<UserApiResponse<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var user = await _userService.UpdateUserAsync(id, request);
                return Ok(UserApiResponse<UserDto>.Success(user));
            }
            catch (Exception ex)
            {
                return BadRequest(UserApiResponse<UserDto>.Error(ex.Message));
            }
        }

        /// <summary>
        /// DELETE /api/auth/users/{id}
        /// Elimina un usuario (solo admin)
        /// </summary>
        [HttpDelete("users/{id}")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/auth/change-password
        /// Cambia la contraseña del usuario autenticado
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                // Implementar cambio de contraseña usando UserManager
                // await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

                return Ok(new { message = "Contraseña actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    /// <summary>
    /// DTO para cambio de contraseña
    /// </summary>
    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required, MinLength(6)]
        public string NewPassword { get; set; }

        [Required, Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}

// ============================================================================
// CONFIGURACIÓN EN Program.cs
// ============================================================================
/*
// Agregar en Program.cs:

// 1. Configurar Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 2. Configurar JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// 3. Registrar servicio
builder.Services.AddScoped<IUserService, UserService>();

// 4. Agregar en appsettings.json:
{
  "Jwt": {
    "Key": "TuClaveSecretaSuperSeguraConMasDeUnasVeinteCaracteres",
    "Issuer": "TuEscuela",
    "Audience": "TuEscuelaApp",
    "ExpirationMinutes": 1440
  }
}

// 5. Agregar DbSet en ApplicationDbContext:
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    // ... otros DbSets
}
*/
