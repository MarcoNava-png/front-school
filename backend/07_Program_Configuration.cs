// ============================================================================
// CONFIGURACIÓN Y REGISTRO DE SERVICIOS
// Ubicación: Program.cs o Startup.cs (dependiendo de tu versión de .NET)
// ============================================================================

using Microsoft.EntityFrameworkCore;
using TuProyecto.Data;
using TuProyecto.Services;

// ============================================================================
// PARA .NET 6+ (Program.cs con top-level statements)
// ============================================================================

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Registrar servicios del sistema de colegiaturas
builder.Services.AddScoped<IReciboService, ReciboService>();
builder.Services.AddScoped<IPlantillaCobroService, PlantillaCobroService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IBecaService, BecaService>();

// 3. Agregar controllers
builder.Services.AddControllers();

// 4. Configurar Swagger (opcional pero recomendado)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Sistema de Colegiaturas API",
        Version = "v1",
        Description = "API para el manejo de plantillas de cobro, recibos, pagos y becas"
    });

    // Agregar soporte para JWT (si lo usas)
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

// 5. Configurar CORS (para permitir peticiones desde el frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001") // URLs del frontend Next.js
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 6. Configurar autenticación JWT (si la usas)
/*
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
*/

var app = builder.Build();

// 7. Configurar pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema de Colegiaturas API v1");
        c.RoutePrefix = "swagger"; // Acceder en: http://localhost:5000/swagger
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication(); // Descomentar si usas autenticación
app.UseAuthorization();
app.MapControllers();

app.Run();


// ============================================================================
// PARA .NET 5 o anteriores (Startup.cs)
// ============================================================================
/*
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        // 1. DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

        // 2. Registrar servicios
        services.AddScoped<IReciboService, ReciboService>();
        services.AddScoped<IPlantillaCobroService, PlantillaCobroService>();
        services.AddScoped<IPagoService, PagoService>();
        services.AddScoped<IBecaService, BecaService>();

        // 3. Controllers
        services.AddControllers();

        // 4. Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Sistema de Colegiaturas API",
                Version = "v1"
            });
        });

        // 5. CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
        }

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseCors("AllowFrontend");
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
*/


// ============================================================================
// CONFIGURACIÓN DEL DbContext (Data/ApplicationDbContext.cs)
// ============================================================================
/*
using Microsoft.EntityFrameworkCore;
using TuProyecto.Models;

namespace TuProyecto.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets del sistema de colegiaturas
        public DbSet<ConceptoPago> ConceptosPago { get; set; }
        public DbSet<PlantillaCobro> PlantillasCobro { get; set; }
        public DbSet<PlantillaCobroDetalle> PlantillasCobroDetalles { get; set; }
        public DbSet<Recibo> Recibos { get; set; }
        public DbSet<ReciboDetalle> RecibosDetalles { get; set; }
        public DbSet<MedioPago> MediosPago { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<PagoAplicado> PagosAplicados { get; set; }
        public DbSet<BecaEstudiante> BecasEstudiantes { get; set; }
        public DbSet<CorteCaja> CortesCaja { get; set; }

        // DbSets existentes
        public DbSet<Estudiante> Estudiantes { get; set; }
        public DbSet<PlanEstudios> PlanesEstudio { get; set; }
        public DbSet<PeriodoAcademico> PeriodoAcademico { get; set; }
        public DbSet<Grupo> Grupos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales si son necesarias
            modelBuilder.Entity<PlantillaCobro>()
                .HasMany(p => p.Detalles)
                .WithOne(d => d.PlantillaCobro)
                .HasForeignKey(d => d.IdPlantillaCobro)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Recibo>()
                .HasMany(r => r.Detalles)
                .WithOne(d => d.Recibo)
                .HasForeignKey(d => d.IdRecibo)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pago>()
                .HasMany(p => p.PagosAplicados)
                .WithOne(pa => pa.Pago)
                .HasForeignKey(pa => pa.IdPago);

            modelBuilder.Entity<Recibo>()
                .HasMany(r => r.PagosAplicados)
                .WithOne(pa => pa.Recibo)
                .HasForeignKey(pa => pa.IdRecibo);
        }
    }
}
*/


// ============================================================================
// ARCHIVO appsettings.json
// ============================================================================
/*
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TuBaseDatos;User Id=tu_usuario;Password=tu_password;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Jwt": {
    "Key": "tu-clave-secreta-super-segura-de-al-menos-32-caracteres",
    "Issuer": "TuProyecto",
    "Audience": "TuProyecto",
    "ExpireMinutes": 60
  }
}
*/


// ============================================================================
// DEPENDENCIAS NECESARIAS (NuGet Packages)
// ============================================================================
/*
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.Data.SqlClient
*/


// ============================================================================
// COMANDOS ÚTILES DE ENTITY FRAMEWORK
// ============================================================================
/*
# Si usas Code-First con Migrations (opcional):
dotnet ef migrations add InitialCreate
dotnet ef database update

# Si usas Database-First (recomendado ya que tienes los scripts SQL):
# Solo ejecuta los scripts SQL directamente en tu base de datos
*/


// ============================================================================
// INTEGRACIÓN CON INSCRIPCIONES (Muy importante)
// ============================================================================
/*
// En tu servicio o controller de inscripciones existente,
// agrega la lógica para generar recibos automáticamente:

public class InscripcionService
{
    private readonly ApplicationDbContext _context;
    private readonly IReciboService _reciboService;
    private readonly IPlantillaCobroService _plantillaService;

    public async Task InscribirEstudianteAGrupo(int idEstudiante, int idGrupo)
    {
        // 1. Inscribir al estudiante (tu lógica existente)
        var inscripcion = new Inscripcion
        {
            IdEstudiante = idEstudiante,
            IdGrupo = idGrupo,
            FechaInscripcion = DateTime.Now
        };
        _context.Inscripciones.Add(inscripcion);
        await _context.SaveChangesAsync();

        // 2. Obtener información del grupo
        var grupo = await _context.Grupos
            .Include(g => g.PlanEstudios)
            .FirstOrDefaultAsync(g => g.IdGrupo == idGrupo);

        if (grupo == null)
            throw new Exception("Grupo no encontrado");

        // 3. Buscar plantilla activa
        try
        {
            var plantilla = await _plantillaService.BuscarPlantillaActiva(new BuscarPlantillaActivaQuery
            {
                IdPlanEstudios = grupo.IdPlanEstudios,
                NumeroCuatrimestre = grupo.NumeroCuatrimestre,
                IdPeriodoAcademico = grupo.IdPeriodoAcademico,
                IdTurno = grupo.IdTurno
            });

            // 4. Generar recibos automáticamente
            await _reciboService.GenerarRecibosDesdePlantilla(
                new GenerarRecibosDesdePlantillaDto
                {
                    IdEstudiante = idEstudiante,
                    IdGrupo = idGrupo,
                    IdPlantillaCobro = plantilla.IdPlantillaCobro,
                    FechaInicio = grupo.FechaInicio ?? DateTime.Now
                },
                1 // ID de usuario
            );
        }
        catch (Exception ex)
        {
            // Loggear la excepción pero no fallar la inscripción
            Console.WriteLine($"No se pudieron generar recibos: {ex.Message}");
            // O lanzar la excepción si quieres que la inscripción falle:
            // throw new Exception($"Inscripción exitosa pero no se generaron recibos: {ex.Message}");
        }
    }
}
*/
