// ============================================================================
// SERVICIOS RESTANTES - Sistema de Colegiaturas
// Ubicación sugerida: Services/
// ============================================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TuProyecto.Data;
using TuProyecto.Models;
using TuProyecto.DTOs;

namespace TuProyecto.Services
{
    // ========================================================================
    // SERVICIO DE PLANTILLAS DE COBRO
    // ========================================================================
    public interface IPlantillaCobroService
    {
        Task<List<PlantillaCobroDto>> ListarPlantillas(int? idPlanEstudios, int? numeroCuatrimestre, bool soloActivas);
        Task<PlantillaCobroDto> ObtenerPlantillaPorId(int id);
        Task<PlantillaCobroDto> BuscarPlantillaActiva(BuscarPlantillaActivaQuery query);
        Task<PlantillaCobroDto> CrearPlantilla(CreatePlantillaCobroDto dto, int idUsuario);
        Task<PlantillaCobroDto> ActualizarPlantilla(UpdatePlantillaCobroDto dto, int idUsuario);
        Task CambiarEstado(int id, bool esActiva);
        Task<PlantillaCobroDto> DuplicarPlantilla(int idPlantilla, string nombreNueva, int numeroCuatrimestre, int? idPeriodo, int idUsuario);
        Task<List<VistaPreviaReciboDto>> GenerarVistaPrevia(CreatePlantillaCobroDto dto, DateTime fechaInicio);
    }

    public class PlantillaCobroService : IPlantillaCobroService
    {
        private readonly ApplicationDbContext _context;

        public PlantillaCobroService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PlantillaCobroDto>> ListarPlantillas(
            int? idPlanEstudios,
            int? numeroCuatrimestre,
            bool soloActivas)
        {
            var query = _context.PlantillasCobro
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.ConceptoPago)
                .AsQueryable();

            if (idPlanEstudios.HasValue)
                query = query.Where(p => p.IdPlanEstudios == idPlanEstudios.Value);

            if (numeroCuatrimestre.HasValue)
                query = query.Where(p => p.NumeroCuatrimestre == numeroCuatrimestre.Value);

            if (soloActivas)
                query = query.Where(p => p.EsActiva);

            var plantillas = await query
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return plantillas.Select(p => MapToDto(p)).ToList();
        }

        public async Task<PlantillaCobroDto> ObtenerPlantillaPorId(int id)
        {
            var plantilla = await _context.PlantillasCobro
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.ConceptoPago)
                .FirstOrDefaultAsync(p => p.IdPlantillaCobro == id);

            if (plantilla == null)
                throw new Exception("Plantilla no encontrada");

            return MapToDto(plantilla);
        }

        public async Task<PlantillaCobroDto> BuscarPlantillaActiva(BuscarPlantillaActivaQuery query)
        {
            var plantillaQuery = _context.PlantillasCobro
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.ConceptoPago)
                .Where(p => p.EsActiva &&
                           p.IdPlanEstudios == query.IdPlanEstudios &&
                           p.NumeroCuatrimestre == query.NumeroCuatrimestre);

            // Prioridad: Con periodo específico > Sin periodo
            if (query.IdPeriodoAcademico.HasValue)
            {
                var conPeriodo = await plantillaQuery
                    .FirstOrDefaultAsync(p => p.IdPeriodoAcademico == query.IdPeriodoAcademico.Value);

                if (conPeriodo != null)
                    return MapToDto(conPeriodo);
            }

            // Si no hay con periodo específico, buscar general
            var sinPeriodo = await plantillaQuery
                .FirstOrDefaultAsync(p => p.IdPeriodoAcademico == null);

            if (sinPeriodo != null)
                return MapToDto(sinPeriodo);

            throw new Exception($"No hay plantilla activa para: Plan {query.IdPlanEstudios}, Cuatrimestre {query.NumeroCuatrimestre}");
        }

        public async Task<PlantillaCobroDto> CrearPlantilla(CreatePlantillaCobroDto dto, int idUsuario)
        {
            // Validar que existe el plan de estudios
            var planExiste = await _context.PlanesEstudio
                .AnyAsync(p => p.IdPlanEstudios == dto.IdPlanEstudios);

            if (!planExiste)
                throw new Exception("Plan de estudios no encontrado");

            // Crear plantilla
            var plantilla = new PlantillaCobro
            {
                NombrePlantilla = dto.NombrePlantilla,
                IdPlanEstudios = dto.IdPlanEstudios,
                NumeroCuatrimestre = dto.NumeroCuatrimestre,
                IdPeriodoAcademico = dto.IdPeriodoAcademico,
                IdTurno = dto.IdTurno,
                EstrategiaEmision = dto.EstrategiaEmision,
                NumeroRecibos = dto.NumeroRecibos,
                DiaVencimiento = dto.DiaVencimiento,
                EsActiva = dto.EsActiva,
                IdUsuarioCreacion = idUsuario,
                FechaCreacion = DateTime.Now
            };

            // Agregar detalles
            plantilla.Detalles = dto.Detalles.Select(d => new PlantillaCobroDetalle
            {
                IdConceptoPago = d.IdConceptoPago,
                Monto = d.Monto,
                Cantidad = d.Cantidad,
                Distribucion = d.Distribucion,
                NumeroRecibo = d.NumeroRecibo,
                Orden = d.Orden
            }).ToList();

            _context.PlantillasCobro.Add(plantilla);
            await _context.SaveChangesAsync();

            return await ObtenerPlantillaPorId(plantilla.IdPlantillaCobro);
        }

        public async Task<PlantillaCobroDto> ActualizarPlantilla(UpdatePlantillaCobroDto dto, int idUsuario)
        {
            var plantilla = await _context.PlantillasCobro
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.IdPlantillaCobro == dto.IdPlantillaCobro);

            if (plantilla == null)
                throw new Exception("Plantilla no encontrada");

            // Actualizar propiedades
            plantilla.NombrePlantilla = dto.NombrePlantilla;
            plantilla.IdPlanEstudios = dto.IdPlanEstudios;
            plantilla.NumeroCuatrimestre = dto.NumeroCuatrimestre;
            plantilla.IdPeriodoAcademico = dto.IdPeriodoAcademico;
            plantilla.IdTurno = dto.IdTurno;
            plantilla.EstrategiaEmision = dto.EstrategiaEmision;
            plantilla.NumeroRecibos = dto.NumeroRecibos;
            plantilla.DiaVencimiento = dto.DiaVencimiento;
            plantilla.EsActiva = dto.EsActiva;
            plantilla.FechaModificacion = DateTime.Now;

            // Eliminar detalles existentes
            _context.PlantillasCobroDetalles.RemoveRange(plantilla.Detalles);

            // Agregar nuevos detalles
            plantilla.Detalles = dto.Detalles.Select(d => new PlantillaCobroDetalle
            {
                IdPlantillaCobro = plantilla.IdPlantillaCobro,
                IdConceptoPago = d.IdConceptoPago,
                Monto = d.Monto,
                Cantidad = d.Cantidad,
                Distribucion = d.Distribucion,
                NumeroRecibo = d.NumeroRecibo,
                Orden = d.Orden
            }).ToList();

            await _context.SaveChangesAsync();

            return await ObtenerPlantillaPorId(plantilla.IdPlantillaCobro);
        }

        public async Task CambiarEstado(int id, bool esActiva)
        {
            var plantilla = await _context.PlantillasCobro.FindAsync(id);

            if (plantilla == null)
                throw new Exception("Plantilla no encontrada");

            plantilla.EsActiva = esActiva;
            plantilla.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task<PlantillaCobroDto> DuplicarPlantilla(
            int idPlantilla,
            string nombreNueva,
            int numeroCuatrimestre,
            int? idPeriodo,
            int idUsuario)
        {
            var plantillaOriginal = await _context.PlantillasCobro
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.ConceptoPago)
                .FirstOrDefaultAsync(p => p.IdPlantillaCobro == idPlantilla);

            if (plantillaOriginal == null)
                throw new Exception("Plantilla original no encontrada");

            var nuevaPlantilla = new PlantillaCobro
            {
                NombrePlantilla = nombreNueva,
                IdPlanEstudios = plantillaOriginal.IdPlanEstudios,
                NumeroCuatrimestre = numeroCuatrimestre,
                IdPeriodoAcademico = idPeriodo,
                IdTurno = plantillaOriginal.IdTurno,
                EstrategiaEmision = plantillaOriginal.EstrategiaEmision,
                NumeroRecibos = plantillaOriginal.NumeroRecibos,
                DiaVencimiento = plantillaOriginal.DiaVencimiento,
                EsActiva = false, // La nueva comienza desactivada
                IdUsuarioCreacion = idUsuario,
                FechaCreacion = DateTime.Now
            };

            // Copiar detalles
            nuevaPlantilla.Detalles = plantillaOriginal.Detalles.Select(d => new PlantillaCobroDetalle
            {
                IdConceptoPago = d.IdConceptoPago,
                Monto = d.Monto,
                Cantidad = d.Cantidad,
                Distribucion = d.Distribucion,
                NumeroRecibo = d.NumeroRecibo,
                Orden = d.Orden
            }).ToList();

            _context.PlantillasCobro.Add(nuevaPlantilla);
            await _context.SaveChangesAsync();

            return await ObtenerPlantillaPorId(nuevaPlantilla.IdPlantillaCobro);
        }

        public async Task<List<VistaPreviaReciboDto>> GenerarVistaPrevia(
            CreatePlantillaCobroDto dto,
            DateTime fechaInicio)
        {
            var vistasPrevia = new List<VistaPreviaReciboDto>();

            // Calcular fechas de vencimiento
            for (int i = 0; i < dto.NumeroRecibos; i++)
            {
                var mes = fechaInicio.AddMonths(i);
                int dia = Math.Min(dto.DiaVencimiento, DateTime.DaysInMonth(mes.Year, mes.Month));
                var fechaVencimiento = new DateTime(mes.Year, mes.Month, dia);

                var conceptos = new List<ConceptoVistaPreviaDto>();
                decimal subtotal = 0;

                // Agregar conceptos según distribución
                foreach (var detalle in dto.Detalles.OrderBy(d => d.Orden))
                {
                    bool incluir = false;

                    switch (detalle.Distribucion)
                    {
                        case "TODOS_LOS_RECIBOS":
                            incluir = true;
                            break;
                        case "PRIMER_RECIBO":
                            incluir = i == 0;
                            break;
                        case "ULTIMO_RECIBO":
                            incluir = i == dto.NumeroRecibos - 1;
                            break;
                        case "RECIBO_ESPECIFICO":
                            incluir = (i + 1) == detalle.NumeroRecibo;
                            break;
                    }

                    if (incluir)
                    {
                        // Obtener nombre del concepto
                        var concepto = await _context.ConceptosPago
                            .FirstOrDefaultAsync(c => c.IdConceptoPago == detalle.IdConceptoPago);

                        conceptos.Add(new ConceptoVistaPreviaDto
                        {
                            Concepto = concepto?.Nombre ?? "Concepto desconocido",
                            Monto = detalle.Monto
                        });

                        subtotal += detalle.Monto;
                    }
                }

                vistasPrevia.Add(new VistaPreviaReciboDto
                {
                    NumeroRecibo = i + 1,
                    FechaVencimiento = fechaVencimiento,
                    Conceptos = conceptos,
                    Subtotal = subtotal,
                    Total = subtotal
                });
            }

            return vistasPrevia;
        }

        private PlantillaCobroDto MapToDto(PlantillaCobro plantilla)
        {
            return new PlantillaCobroDto
            {
                IdPlantillaCobro = plantilla.IdPlantillaCobro,
                NombrePlantilla = plantilla.NombrePlantilla,
                IdPlanEstudios = plantilla.IdPlanEstudios,
                NumeroCuatrimestre = plantilla.NumeroCuatrimestre,
                IdPeriodoAcademico = plantilla.IdPeriodoAcademico,
                IdTurno = plantilla.IdTurno,
                EstrategiaEmision = plantilla.EstrategiaEmision,
                NumeroRecibos = plantilla.NumeroRecibos,
                DiaVencimiento = plantilla.DiaVencimiento,
                EsActiva = plantilla.EsActiva,
                FechaCreacion = plantilla.FechaCreacion,
                TotalConceptos = plantilla.Detalles?.Count ?? 0,
                Detalles = plantilla.Detalles?.Select(d => new PlantillaCobroDetalleDto
                {
                    IdDetalleTempla = d.IdDetalleTempla,
                    IdConceptoPago = d.IdConceptoPago,
                    NombreConcepto = d.ConceptoPago?.Nombre,
                    Monto = d.Monto,
                    Cantidad = d.Cantidad,
                    Distribucion = d.Distribucion,
                    NumeroRecibo = d.NumeroRecibo,
                    Orden = d.Orden
                }).OrderBy(d => d.Orden).ToList()
            };
        }
    }

    // ========================================================================
    // SERVICIO DE PAGOS Y CAJA
    // ========================================================================
    public interface IPagoService
    {
        Task<PagoRegistradoDto> RegistrarPagoCaja(RegistrarPagoCajaDto dto, int idUsuario);
        Task<List<MedioPagoDto>> ObtenerMediosPago();
        Task<ResumenCorteCajaDto> ObtenerResumenCorteCaja(DateTime fechaInicio, DateTime fechaFin);
        Task<CorteCajaDto> CerrarCorteCaja(CerrarCorteCajaDto dto, int idUsuario);
        Task<RecibosParaCobroDto> BuscarRecibosParaCobro(string criterio);
    }

    public class PagoService : IPagoService
    {
        private readonly ApplicationDbContext _context;

        public PagoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagoRegistradoDto> RegistrarPagoCaja(RegistrarPagoCajaDto dto, int idUsuario)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Validar medio de pago
                var medioPago = await _context.MediosPago.FindAsync(dto.IdMedioPago);
                if (medioPago == null)
                    throw new Exception("Medio de pago no válido");

                if (medioPago.RequiereReferencia && string.IsNullOrWhiteSpace(dto.Referencia))
                    throw new Exception($"El medio de pago {medioPago.Nombre} requiere referencia");

                // 2. Validar monto total
                decimal totalAplicar = dto.RecibosSeleccionados.Sum(r => r.MontoAplicar);
                if (totalAplicar > dto.Monto)
                    throw new Exception("El monto a aplicar excede el monto del pago");

                // 3. Crear registro de pago
                var pago = new Pago
                {
                    FolioPago = await GenerarFolioPago(),
                    FechaPagoUtc = dto.FechaPago,
                    IdMedioPago = dto.IdMedioPago,
                    Monto = dto.Monto,
                    Referencia = dto.Referencia,
                    Notas = dto.Notas,
                    Estatus = 0, // Confirmado
                    IdUsuarioCreacion = idUsuario,
                    FechaCreacion = DateTime.Now
                };

                _context.Pagos.Add(pago);
                await _context.SaveChangesAsync();

                // 4. Aplicar pago a cada recibo
                var recibosAfectados = new List<int>();

                foreach (var item in dto.RecibosSeleccionados)
                {
                    var recibo = await _context.Recibos.FindAsync(item.IdRecibo);

                    if (recibo == null)
                        throw new Exception($"Recibo {item.IdRecibo} no encontrado");

                    if (item.MontoAplicar > recibo.Saldo)
                        throw new Exception($"Monto a aplicar excede saldo del recibo {recibo.Folio}");

                    // Actualizar saldo
                    recibo.Saldo -= item.MontoAplicar;

                    // Actualizar estatus
                    if (recibo.Saldo == 0)
                        recibo.Estatus = 1; // Pagado
                    else
                        recibo.Estatus = 2; // Pago Parcial

                    // Registrar aplicación
                    _context.PagosAplicados.Add(new PagoAplicado
                    {
                        IdPago = pago.IdPago,
                        IdRecibo = item.IdRecibo,
                        MontoAplicado = item.MontoAplicar,
                        FechaAplicacion = DateTime.Now
                    });

                    recibosAfectados.Add(item.IdRecibo);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new PagoRegistradoDto
                {
                    IdPago = pago.IdPago,
                    FolioPago = pago.FolioPago,
                    Monto = pago.Monto,
                    FechaPago = pago.FechaPagoUtc,
                    RecibosAfectados = recibosAfectados,
                    Cambio = dto.Monto - totalAplicar
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<MedioPagoDto>> ObtenerMediosPago()
        {
            return await _context.MediosPago
                .Where(m => m.Activo)
                .Select(m => new MedioPagoDto
                {
                    IdMedioPago = m.IdMedioPago,
                    Nombre = m.Nombre,
                    RequiereReferencia = m.RequiereReferencia,
                    Activo = m.Activo
                })
                .ToListAsync();
        }

        public async Task<RecibosParaCobroDto> BuscarRecibosParaCobro(string criterio)
        {
            // Buscar estudiante por matrícula, nombre o folio de recibo
            var estudiante = await _context.Estudiantes
                .Where(e => e.Matricula == criterio ||
                           (e.Nombre + " " + e.ApellidoPaterno + " " + e.ApellidoMaterno).Contains(criterio))
                .FirstOrDefaultAsync();

            if (estudiante == null)
            {
                // Buscar por folio de recibo
                var recibo = await _context.Recibos
                    .Include(r => r.Detalles)
                    .FirstOrDefaultAsync(r => r.Folio == criterio);

                if (recibo != null)
                {
                    estudiante = await _context.Estudiantes.FindAsync(recibo.IdEstudiante);
                }
            }

            if (estudiante == null)
                throw new Exception("No se encontró estudiante o recibo con ese criterio");

            // Obtener recibos pendientes del estudiante
            var hoy = DateTime.Today;
            var recibos = await _context.Recibos
                .Include(r => r.Detalles)
                .Where(r => r.IdEstudiante == estudiante.IdEstudiante &&
                           r.Saldo > 0 &&
                           r.Estatus != 4) // No cancelados
                .OrderBy(r => r.FechaVencimiento)
                .ToListAsync();

            // Actualizar estatus de vencidos
            foreach (var recibo in recibos)
            {
                if (recibo.FechaVencimiento < hoy && recibo.Estatus == 0)
                    recibo.Estatus = 3; // Vencido
            }

            return new RecibosParaCobroDto
            {
                Estudiante = new EstudianteInfoDto
                {
                    IdEstudiante = estudiante.IdEstudiante,
                    Matricula = estudiante.Matricula,
                    NombreCompleto = $"{estudiante.Nombre} {estudiante.ApellidoPaterno} {estudiante.ApellidoMaterno}"
                },
                Recibos = recibos.Select(r => MapReciboToDto(r)).ToList(),
                TotalAdeudo = recibos.Sum(r => r.Saldo),
                RecibosVencidos = recibos.Count(r => r.Estatus == 3),
                RecibosPendientes = recibos.Count(r => r.Estatus == 0)
            };
        }

        public async Task<ResumenCorteCajaDto> ObtenerResumenCorteCaja(DateTime fechaInicio, DateTime fechaFin)
        {
            var pagos = await _context.Pagos
                .Include(p => p.MedioPago)
                .Where(p => p.FechaPagoUtc >= fechaInicio &&
                           p.FechaPagoUtc <= fechaFin &&
                           p.Estatus == 0) // Solo confirmados
                .OrderBy(p => p.FechaPagoUtc)
                .ToListAsync();

            return new ResumenCorteCajaDto
            {
                Pagos = pagos.Select(p => new PagoDto
                {
                    IdPago = p.IdPago,
                    FolioPago = p.FolioPago,
                    FechaPagoUtc = p.FechaPagoUtc,
                    MedioPago = p.MedioPago.Nombre,
                    Monto = p.Monto,
                    Referencia = p.Referencia,
                    Notas = p.Notas,
                    Estatus = p.Estatus
                }).ToList(),
                Totales = new TotalesCorteCajaDto
                {
                    Cantidad = pagos.Count,
                    Efectivo = pagos.Where(p => p.MedioPago.Nombre == "Efectivo").Sum(p => p.Monto),
                    Transferencia = pagos.Where(p => p.MedioPago.Nombre == "Transferencia").Sum(p => p.Monto),
                    Tarjeta = pagos.Where(p => p.MedioPago.Nombre == "Tarjeta").Sum(p => p.Monto),
                    Total = pagos.Sum(p => p.Monto)
                }
            };
        }

        public async Task<CorteCajaDto> CerrarCorteCaja(CerrarCorteCajaDto dto, int idUsuario)
        {
            var hoy = DateTime.Today;
            var ahora = DateTime.Now;

            var resumen = await ObtenerResumenCorteCaja(hoy, ahora);

            var corte = new CorteCaja
            {
                FolioCorteCaja = await GenerarFolioCorte(),
                FechaInicio = hoy,
                FechaFin = ahora,
                TotalEfectivo = resumen.Totales.Efectivo,
                TotalTransferencia = resumen.Totales.Transferencia,
                TotalTarjeta = resumen.Totales.Tarjeta,
                TotalGeneral = resumen.Totales.Total,
                MontoInicial = dto.MontoInicial,
                Cerrado = true,
                Observaciones = dto.Observaciones,
                IdUsuarioCreacion = idUsuario,
                FechaCreacion = DateTime.Now
            };

            _context.CortesCaja.Add(corte);
            await _context.SaveChangesAsync();

            return new CorteCajaDto
            {
                IdCorteCaja = corte.IdCorteCaja,
                FolioCorteCaja = corte.FolioCorteCaja,
                FechaInicio = corte.FechaInicio,
                FechaFin = corte.FechaFin,
                TotalEfectivo = corte.TotalEfectivo,
                TotalTransferencia = corte.TotalTransferencia,
                TotalTarjeta = corte.TotalTarjeta,
                TotalOtros = corte.TotalOtros,
                TotalGeneral = corte.TotalGeneral,
                MontoInicial = corte.MontoInicial,
                Cerrado = corte.Cerrado,
                Observaciones = corte.Observaciones
            };
        }

        private async Task<string> GenerarFolioPago()
        {
            var folioParam = new Microsoft.Data.SqlClient.SqlParameter
            {
                ParameterName = "@Folio",
                SqlDbType = System.Data.SqlDbType.VarChar,
                Size = 50,
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerarFolioPago @Folio OUTPUT",
                folioParam
            );

            return folioParam.Value.ToString();
        }

        private async Task<string> GenerarFolioCorte()
        {
            var folioParam = new Microsoft.Data.SqlClient.SqlParameter
            {
                ParameterName = "@Folio",
                SqlDbType = System.Data.SqlDbType.VarChar,
                Size = 50,
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerarFolioCorte @Folio OUTPUT",
                folioParam
            );

            return folioParam.Value.ToString();
        }

        private ReciboDto MapReciboToDto(Recibo recibo)
        {
            return new ReciboDto
            {
                IdRecibo = recibo.IdRecibo,
                Folio = recibo.Folio,
                IdEstudiante = recibo.IdEstudiante,
                FechaEmision = recibo.FechaEmision,
                FechaVencimiento = recibo.FechaVencimiento,
                Subtotal = recibo.Subtotal,
                Descuento = recibo.Descuento,
                Total = recibo.Total,
                Saldo = recibo.Saldo,
                Estatus = recibo.Estatus,
                Detalles = recibo.Detalles?.Select(d => new ReciboDetalleDto
                {
                    IdDetalleRecibo = d.IdDetalleRecibo,
                    IdConceptoPago = d.IdConceptoPago,
                    Concepto = d.Concepto,
                    Monto = d.Monto,
                    Orden = d.Orden
                }).OrderBy(d => d.Orden).ToList()
            };
        }
    }

    // ========================================================================
    // SERVICIO DE BECAS
    // ========================================================================
    public interface IBecaService
    {
        Task<List<BecaEstudianteDto>> ObtenerBecasEstudiante(int idEstudiante);
        Task<List<BecaEstudiante>> ObtenerBecasActivas(int idEstudiante);
        Task<BecaEstudianteDto> CrearBeca(CreateBecaEstudianteDto dto, int idUsuario);
        Task DesactivarBeca(int idBeca, string motivo);
    }

    public class BecaService : IBecaService
    {
        private readonly ApplicationDbContext _context;

        public BecaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<BecaEstudianteDto>> ObtenerBecasEstudiante(int idEstudiante)
        {
            var becas = await _context.BecasEstudiantes
                .Include(b => b.ConceptoPago)
                .Where(b => b.IdEstudiante == idEstudiante)
                .OrderByDescending(b => b.FechaCreacion)
                .ToListAsync();

            return becas.Select(b => new BecaEstudianteDto
            {
                IdBeca = b.IdBeca,
                IdEstudiante = b.IdEstudiante,
                TipoBeca = b.TipoBeca,
                Valor = b.Valor,
                IdConceptoPago = b.IdConceptoPago,
                NombreConcepto = b.ConceptoPago?.Nombre ?? "Todos los conceptos",
                IdPeriodoAcademico = b.IdPeriodoAcademico,
                Activa = b.Activa,
                FechaInicio = b.FechaInicio,
                FechaFin = b.FechaFin,
                Observaciones = b.Observaciones
            }).ToList();
        }

        public async Task<List<BecaEstudiante>> ObtenerBecasActivas(int idEstudiante)
        {
            var hoy = DateTime.Today;

            return await _context.BecasEstudiantes
                .Where(b => b.IdEstudiante == idEstudiante &&
                           b.Activa &&
                           b.FechaInicio <= hoy &&
                           (b.FechaFin == null || b.FechaFin >= hoy))
                .ToListAsync();
        }

        public async Task<BecaEstudianteDto> CrearBeca(CreateBecaEstudianteDto dto, int idUsuario)
        {
            // Validar estudiante
            var estudiante = await _context.Estudiantes.FindAsync(dto.IdEstudiante);
            if (estudiante == null)
                throw new Exception("Estudiante no encontrado");

            // Validar tipo de beca
            if (dto.TipoBeca == "PORCENTAJE" && (dto.Valor < 0 || dto.Valor > 100))
                throw new Exception("El porcentaje debe estar entre 0 y 100");

            var beca = new BecaEstudiante
            {
                IdEstudiante = dto.IdEstudiante,
                TipoBeca = dto.TipoBeca,
                Valor = dto.Valor,
                IdConceptoPago = dto.IdConceptoPago,
                IdPeriodoAcademico = dto.IdPeriodoAcademico,
                Activa = true,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                Observaciones = dto.Observaciones,
                IdUsuarioCreacion = idUsuario,
                FechaCreacion = DateTime.Now
            };

            _context.BecasEstudiantes.Add(beca);
            await _context.SaveChangesAsync();

            return (await ObtenerBecasEstudiante(dto.IdEstudiante))
                .First(b => b.IdBeca == beca.IdBeca);
        }

        public async Task DesactivarBeca(int idBeca, string motivo)
        {
            var beca = await _context.BecasEstudiantes.FindAsync(idBeca);

            if (beca == null)
                throw new Exception("Beca no encontrada");

            beca.Activa = false;
            beca.Observaciones = (beca.Observaciones ?? "") + $"\nDesactivada: {motivo}";

            await _context.SaveChangesAsync();
        }
    }
}
