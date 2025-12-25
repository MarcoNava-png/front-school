// ============================================================================
// CONTROLLERS - Sistema de Colegiaturas
// Ubicación sugerida: Controllers/
// ============================================================================

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuProyecto.Services;
using TuProyecto.DTOs;

namespace TuProyecto.Controllers
{
    // ========================================================================
    // CONTROLLER: CONCEPTOS DE PAGO
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Descomentar cuando tengas autenticación
    public class ConceptosPagoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConceptosPagoController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/ConceptosPago
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ConceptoPagoDto>>> Get()
        {
            var conceptos = await _context.ConceptosPago
                .Where(c => c.EsActivo)
                .OrderBy(c => c.Orden)
                .Select(c => new ConceptoPagoDto
                {
                    IdConceptoPago = c.IdConceptoPago,
                    Clave = c.Clave,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    EsActivo = c.EsActivo
                })
                .ToListAsync();

            return Ok(conceptos);
        }

        /// <summary>
        /// POST /api/ConceptosPago
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ConceptoPagoDto>> Create([FromBody] CreateConceptoPagoDto dto)
        {
            var concepto = new ConceptoPago
            {
                Clave = dto.Clave,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                EsActivo = true,
                FechaCreacion = DateTime.Now
            };

            _context.ConceptosPago.Add(concepto);
            await _context.SaveChangesAsync();

            return Ok(new ConceptoPagoDto
            {
                IdConceptoPago = concepto.IdConceptoPago,
                Clave = concepto.Clave,
                Nombre = concepto.Nombre,
                Descripcion = concepto.Descripcion,
                EsActivo = concepto.EsActivo
            });
        }
    }

    // ========================================================================
    // CONTROLLER: PLANTILLAS DE COBRO
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlantillasCobroController : ControllerBase
    {
        private readonly IPlantillaCobroService _service;

        public PlantillasCobroController(IPlantillaCobroService service)
        {
            _service = service;
        }

        /// <summary>
        /// GET /api/PlantillasCobro
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<PlantillaCobroDto>>> Get(
            [FromQuery] int? idPlanEstudios,
            [FromQuery] int? numeroCuatrimestre,
            [FromQuery] bool soloActivas = false)
        {
            try
            {
                var plantillas = await _service.ListarPlantillas(idPlanEstudios, numeroCuatrimestre, soloActivas);
                return Ok(plantillas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/PlantillasCobro/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PlantillaCobroDto>> GetById(int id)
        {
            try
            {
                var plantilla = await _service.ObtenerPlantillaPorId(id);
                return Ok(plantilla);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/PlantillasCobro/buscar-activa
        /// </summary>
        [HttpGet("buscar-activa")]
        public async Task<ActionResult<PlantillaCobroDto>> BuscarActiva([FromQuery] BuscarPlantillaActivaQuery query)
        {
            try
            {
                var plantilla = await _service.BuscarPlantillaActiva(query);
                return Ok(plantilla);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/PlantillasCobro
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PlantillaCobroDto>> Create([FromBody] CreatePlantillaCobroDto dto)
        {
            try
            {
                var idUsuario = GetUserId(); // Implementar método para obtener ID del usuario autenticado
                var plantilla = await _service.CrearPlantilla(dto, idUsuario);
                return CreatedAtAction(nameof(GetById), new { id = plantilla.IdPlantillaCobro }, plantilla);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/PlantillasCobro/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<PlantillaCobroDto>> Update(int id, [FromBody] UpdatePlantillaCobroDto dto)
        {
            try
            {
                dto.IdPlantillaCobro = id;
                var idUsuario = GetUserId();
                var plantilla = await _service.ActualizarPlantilla(dto, idUsuario);
                return Ok(plantilla);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/PlantillasCobro/{id}/cambiar-estado
        /// </summary>
        [HttpPost("{id}/cambiar-estado")]
        public async Task<ActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
        {
            try
            {
                await _service.CambiarEstado(id, dto.EsActiva);
                return Ok(new { message = "Estado actualizado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/PlantillasCobro/{id}/duplicar
        /// </summary>
        [HttpPost("{id}/duplicar")]
        public async Task<ActionResult<PlantillaCobroDto>> Duplicar(int id, [FromBody] DuplicarPlantillaDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var plantilla = await _service.DuplicarPlantilla(
                    id,
                    dto.NombreNuevaPlantilla,
                    dto.NumeroCuatrimestre,
                    dto.IdPeriodoAcademico,
                    idUsuario
                );
                return Ok(plantilla);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/PlantillasCobro/vista-previa
        /// </summary>
        [HttpPost("vista-previa")]
        public async Task<ActionResult<List<VistaPreviaReciboDto>>> VistaPrevia([FromBody] VistaPreviaRequest request)
        {
            try
            {
                var vistas = await _service.GenerarVistaPrevia(request.Plantilla, request.FechaInicio);
                return Ok(vistas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId()
        {
            // TODO: Implementar obtención del ID de usuario desde el token JWT
            // var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            // return int.Parse(userIdClaim.Value);
            return 1; // Temporal
        }
    }

    // ========================================================================
    // CONTROLLER: RECIBOS
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecibosController : ControllerBase
    {
        private readonly IReciboService _service;

        public RecibosController(IReciboService service)
        {
            _service = service;
        }

        /// <summary>
        /// GET /api/Recibos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ReciboDto>>> Get([FromQuery] BuscarRecibosQuery query)
        {
            try
            {
                var recibos = await _service.ListarRecibos(query);
                return Ok(recibos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/Recibos/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ReciboDto>> GetById(int id)
        {
            try
            {
                var recibo = await _service.ObtenerReciboPorId(id);
                return Ok(recibo);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/Recibos/buscar-por-folio/{folio}
        /// </summary>
        [HttpGet("buscar-por-folio/{folio}")]
        public async Task<ActionResult<ReciboDto>> GetByFolio(string folio)
        {
            try
            {
                var recibo = await _service.ObtenerReciboPorFolio(folio);
                return Ok(recibo);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Recibos/generar-desde-plantilla
        /// </summary>
        [HttpPost("generar-desde-plantilla")]
        public async Task<ActionResult<RecibosGeneradosDto>> GenerarDesdePlantilla([FromBody] GenerarRecibosDesdePlantillaDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var resultado = await _service.GenerarRecibosDesdePlantilla(dto, idUsuario);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Recibos/{id}/cancelar
        /// </summary>
        [HttpPost("{id}/cancelar")]
        public async Task<ActionResult> Cancelar(int id, [FromBody] CancelarReciboDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                await _service.CancelarRecibo(id, dto.Motivo, idUsuario);
                return Ok(new { message = "Recibo cancelado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Recibos/recalcular
        /// </summary>
        [HttpPost("recalcular")]
        public async Task<ActionResult> Recalcular([FromBody] RecalcularRecibosDto dto)
        {
            try
            {
                await _service.RecalcularRecibos(dto.IdEstudiante, dto.IdPeriodoAcademico);
                return Ok(new { message = "Recibos recalculados" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId() => 1; // Temporal
    }

    // ========================================================================
    // CONTROLLER: CAJA
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CajaController : ControllerBase
    {
        private readonly IPagoService _service;

        public CajaController(IPagoService service)
        {
            _service = service;
        }

        /// <summary>
        /// GET /api/Caja/recibos-pendientes?criterio={matricula|nombre|folio}
        /// </summary>
        [HttpGet("recibos-pendientes")]
        public async Task<ActionResult<RecibosParaCobroDto>> GetRecibosPendientes([FromQuery] string criterio)
        {
            try
            {
                var resultado = await _service.BuscarRecibosParaCobro(criterio);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Caja/pago
        /// </summary>
        [HttpPost("pago")]
        public async Task<ActionResult<PagoRegistradoDto>> RegistrarPago([FromBody] RegistrarPagoCajaDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var resultado = await _service.RegistrarPagoCaja(dto, idUsuario);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/Caja/corte/resumen
        /// </summary>
        [HttpGet("corte/resumen")]
        public async Task<ActionResult<ResumenCorteCajaDto>> GetResumenCorte(
            [FromQuery] DateTime? fechaInicio,
            [FromQuery] DateTime? fechaFin)
        {
            try
            {
                var inicio = fechaInicio ?? DateTime.Today;
                var fin = fechaFin ?? DateTime.Now;

                var resumen = await _service.ObtenerResumenCorteCaja(inicio, fin);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Caja/corte/cerrar
        /// </summary>
        [HttpPost("corte/cerrar")]
        public async Task<ActionResult<CorteCajaDto>> CerrarCorte([FromBody] CerrarCorteCajaDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var corte = await _service.CerrarCorteCaja(dto, idUsuario);
                return Ok(corte);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId() => 1; // Temporal
    }

    // ========================================================================
    // CONTROLLER: MEDIOS DE PAGO
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediosPagoController : ControllerBase
    {
        private readonly IPagoService _service;

        public MediosPagoController(IPagoService service)
        {
            _service = service;
        }

        /// <summary>
        /// GET /api/MediosPago
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<MedioPagoDto>>> Get()
        {
            try
            {
                var medios = await _service.ObtenerMediosPago();
                return Ok(medios);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // ========================================================================
    // CONTROLLER: BECAS
    // ========================================================================
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BecasController : ControllerBase
    {
        private readonly IBecaService _service;

        public BecasController(IBecaService service)
        {
            _service = service;
        }

        /// <summary>
        /// GET /api/Becas/estudiante/{idEstudiante}
        /// </summary>
        [HttpGet("estudiante/{idEstudiante}")]
        public async Task<ActionResult<List<BecaEstudianteDto>>> GetByEstudiante(int idEstudiante)
        {
            try
            {
                var becas = await _service.ObtenerBecasEstudiante(idEstudiante);
                return Ok(becas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/Becas
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<BecaEstudianteDto>> Create([FromBody] CreateBecaEstudianteDto dto)
        {
            try
            {
                var idUsuario = GetUserId();
                var beca = await _service.CrearBeca(dto, idUsuario);
                return Ok(beca);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/Becas/{id}/desactivar
        /// </summary>
        [HttpPut("{id}/desactivar")]
        public async Task<ActionResult> Desactivar(int id, [FromBody] DesactivarBecaDto dto)
        {
            try
            {
                await _service.DesactivarBeca(id, dto.Motivo);
                return Ok(new { message = "Beca desactivada" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId() => 1; // Temporal
    }

    // ========================================================================
    // DTOs AUXILIARES PARA CONTROLLERS
    // ========================================================================
    public class CambiarEstadoDto
    {
        public bool EsActiva { get; set; }
    }

    public class DuplicarPlantillaDto
    {
        public string NombreNuevaPlantilla { get; set; }
        public int NumeroCuatrimestre { get; set; }
        public int? IdPeriodoAcademico { get; set; }
    }

    public class VistaPreviaRequest
    {
        public CreatePlantillaCobroDto Plantilla { get; set; }
        public DateTime FechaInicio { get; set; }
    }

    public class RecalcularRecibosDto
    {
        public int IdEstudiante { get; set; }
        public int? IdPeriodoAcademico { get; set; }
    }
}
