// ============================================================================
// SERVICIO DE RECIBOS - Lógica de Negocio
// Ubicación sugerida: Services/ReciboService.cs
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
    public interface IReciboService
    {
        Task<RecibosGeneradosDto> GenerarRecibosDesdePlantilla(GenerarRecibosDesdePlantillaDto dto, int idUsuario);
        Task<List<ReciboDto>> ListarRecibos(BuscarRecibosQuery query);
        Task<ReciboDto> ObtenerReciboPorId(int idRecibo);
        Task<ReciboDto> ObtenerReciboPorFolio(string folio);
        Task CancelarRecibo(int idRecibo, string motivo, int idUsuario);
        Task RecalcularRecibos(int idEstudiante, int? idPeriodoAcademico);
    }

    public class ReciboService : IReciboService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBecaService _becaService;

        public ReciboService(ApplicationDbContext context, IBecaService becaService)
        {
            _context = context;
            _becaService = becaService;
        }

        // ====================================================================
        // GENERACIÓN AUTOMÁTICA DE RECIBOS DESDE PLANTILLA
        // ====================================================================
        public async Task<RecibosGeneradosDto> GenerarRecibosDesdePlantilla(
            GenerarRecibos DesdePlantillaDto dto,
            int idUsuario)
        {
            // 1. Obtener plantilla con detalles
            var plantilla = await _context.PlantillasCobro
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.ConceptoPago)
                .FirstOrDefaultAsync(p => p.IdPlantillaCobro == dto.IdPlantillaCobro);

            if (plantilla == null)
                throw new Exception("Plantilla de cobro no encontrada");

            if (!plantilla.EsActiva)
                throw new Exception("La plantilla de cobro no está activa");

            // 2. Verificar que el estudiante existe
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.IdEstudiante == dto.IdEstudiante);

            if (estudiante == null)
                throw new Exception("Estudiante no encontrado");

            // 3. Verificar que no existan recibos generados para este estudiante/periodo
            var recibosExistentes = await _context.Recibos
                .Where(r => r.IdEstudiante == dto.IdEstudiante &&
                           r.IdPeriodoAcademico == plantilla.IdPeriodoAcademico)
                .CountAsync();

            if (recibosExistentes > 0)
                throw new Exception($"El estudiante ya tiene {recibosExistentes} recibos generados para este periodo");

            // 4. Calcular fechas de vencimiento
            var fechasVencimiento = CalcularFechasVencimiento(
                dto.FechaInicio,
                plantilla.NumeroRecibos,
                plantilla.DiaVencimiento
            );

            // 5. Generar cada recibo
            var recibos = new List<Recibo>();

            for (int i = 0; i < plantilla.NumeroRecibos; i++)
            {
                // 5.1 Crear recibo
                var recibo = new Recibo
                {
                    Folio = await GenerarFolioRecibo(),
                    IdEstudiante = dto.IdEstudiante,
                    IdPeriodoAcademico = plantilla.IdPeriodoAcademico ?? 0,
                    IdGrupo = dto.IdGrupo,
                    FechaEmision = DateTime.Now,
                    FechaVencimiento = fechasVencimiento[i],
                    Estatus = 0, // Pendiente
                    IdUsuarioCreacion = idUsuario
                };

                // 5.2 Agregar conceptos según distribución
                decimal subtotal = 0;
                var detallesRecibo = new List<ReciboDetalle>();

                foreach (var detalle in plantilla.Detalles.OrderBy(d => d.Orden))
                {
                    if (DebeIncluirConcepto(detalle, i + 1, plantilla.NumeroRecibos))
                    {
                        detallesRecibo.Add(new ReciboDetalle
                        {
                            IdConceptoPago = detalle.IdConceptoPago,
                            Concepto = detalle.ConceptoPago.Nombre,
                            Monto = detalle.Monto,
                            Orden = detalle.Orden
                        });

                        subtotal += detalle.Monto;
                    }
                }

                recibo.Subtotal = subtotal;
                recibo.Total = subtotal;
                recibo.Saldo = subtotal;
                recibo.Detalles = detallesRecibo;

                recibos.Add(recibo);
            }

            // 6. Aplicar becas si el estudiante tiene
            await AplicarBecasARecibos(dto.IdEstudiante, recibos);

            // 7. Guardar en BD
            _context.Recibos.AddRange(recibos);
            await _context.SaveChangesAsync();

            // 8. Retornar resultado
            return new RecibosGeneradosDto
            {
                RecibosGenerados = recibos.Count,
                Recibos = recibos.Select(r => MapToDto(r)).ToList()
            };
        }

        // ====================================================================
        // MÉTODOS AUXILIARES PARA GENERACIÓN DE RECIBOS
        // ====================================================================
        private List<DateTime> CalcularFechasVencimiento(DateTime fechaInicio, int numeroRecibos, int diaVencimiento)
        {
            var fechas = new List<DateTime>();

            for (int i = 0; i < numeroRecibos; i++)
            {
                var mes = fechaInicio.AddMonths(i);

                // Ajustar el día, si el mes tiene menos días que el especificado
                int dia = Math.Min(diaVencimiento, DateTime.DaysInMonth(mes.Year, mes.Month));

                var fechaVencimiento = new DateTime(mes.Year, mes.Month, dia);
                fechas.Add(fechaVencimiento);
            }

            return fechas;
        }

        private bool DebeIncluirConcepto(PlantillaCobroDetalle detalle, int numeroRecibo, int totalRecibos)
        {
            switch (detalle.Distribucion)
            {
                case "TODOS_LOS_RECIBOS":
                    return true;

                case "PRIMER_RECIBO":
                    return numeroRecibo == 1;

                case "ULTIMO_RECIBO":
                    return numeroRecibo == totalRecibos;

                case "RECIBO_ESPECIFICO":
                    return numeroRecibo == detalle.NumeroRecibo;

                default:
                    return false;
            }
        }

        private async Task AplicarBecasARecibos(int idEstudiante, List<Recibo> recibos)
        {
            // Obtener becas activas del estudiante
            var becas = await _becaService.ObtenerBecasActivas(idEstudiante);

            foreach (var recibo in recibos)
            {
                decimal descuentoTotal = 0;

                // Para cada concepto del recibo, aplicar becas
                foreach (var detalle in recibo.Detalles)
                {
                    foreach (var beca in becas)
                    {
                        // Verificar si la beca aplica a este concepto
                        bool becaAplica = beca.IdConceptoPago == null ||
                                         beca.IdConceptoPago == detalle.IdConceptoPago;

                        if (becaAplica)
                        {
                            decimal descuento = 0;

                            if (beca.TipoBeca == "PORCENTAJE")
                            {
                                descuento = detalle.Monto * (beca.Valor / 100);
                            }
                            else if (beca.TipoBeca == "MONTO_FIJO")
                            {
                                descuento = Math.Min(beca.Valor, detalle.Monto);
                            }

                            descuentoTotal += descuento;
                        }
                    }
                }

                // Aplicar descuento al recibo
                recibo.Descuento = descuentoTotal;
                recibo.Total = recibo.Subtotal - descuentoTotal;
                recibo.Saldo = recibo.Total;
            }
        }

        private async Task<string> GenerarFolioRecibo()
        {
            // Llamar al stored procedure
            var folioParam = new Microsoft.Data.SqlClient.SqlParameter
            {
                ParameterName = "@Folio",
                SqlDbType = System.Data.SqlDbType.VarChar,
                Size = 50,
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerarFolioRecibo @Folio OUTPUT",
                folioParam
            );

            return folioParam.Value.ToString();
        }

        // ====================================================================
        // LISTADO Y BÚSQUEDA DE RECIBOS
        // ====================================================================
        public async Task<List<ReciboDto>> ListarRecibos(BuscarRecibosQuery query)
        {
            var recibosQuery = _context.Recibos
                .Include(r => r.Detalles)
                .AsQueryable();

            // Aplicar filtros
            if (query.IdEstudiante.HasValue)
                recibosQuery = recibosQuery.Where(r => r.IdEstudiante == query.IdEstudiante.Value);

            if (!string.IsNullOrWhiteSpace(query.Matricula))
            {
                recibosQuery = recibosQuery.Where(r =>
                    _context.Estudiantes
                        .Where(e => e.Matricula == query.Matricula)
                        .Select(e => e.IdEstudiante)
                        .Contains(r.IdEstudiante)
                );
            }

            if (!string.IsNullOrWhiteSpace(query.Folio))
                recibosQuery = recibosQuery.Where(r => r.Folio.Contains(query.Folio));

            if (query.Estatus.HasValue)
                recibosQuery = recibosQuery.Where(r => r.Estatus == query.Estatus.Value);

            if (query.IdPeriodoAcademico.HasValue)
                recibosQuery = recibosQuery.Where(r => r.IdPeriodoAcademico == query.IdPeriodoAcademico.Value);

            if (query.SoloVencidos)
            {
                var hoy = DateTime.Today;
                recibosQuery = recibosQuery.Where(r =>
                    r.FechaVencimiento < hoy &&
                    r.Saldo > 0 &&
                    r.Estatus != 4 // No cancelados
                );
            }

            // Ejecutar query
            var recibos = await recibosQuery
                .OrderByDescending(r => r.FechaEmision)
                .Take(100) // Limitar a 100 resultados
                .ToListAsync();

            // Actualizar estatus de vencidos
            ActualizarEstatusVencidos(recibos);

            // Mapear a DTOs
            return recibos.Select(r => MapToDto(r)).ToList();
        }

        public async Task<ReciboDto> ObtenerReciboPorId(int idRecibo)
        {
            var recibo = await _context.Recibos
                .Include(r => r.Detalles)
                .FirstOrDefaultAsync(r => r.IdRecibo == idRecibo);

            if (recibo == null)
                throw new Exception("Recibo no encontrado");

            ActualizarEstatusVencidos(new List<Recibo> { recibo });

            return MapToDto(recibo);
        }

        public async Task<ReciboDto> ObtenerReciboPorFolio(string folio)
        {
            var recibo = await _context.Recibos
                .Include(r => r.Detalles)
                .FirstOrDefaultAsync(r => r.Folio == folio);

            if (recibo == null)
                throw new Exception($"Recibo {folio} no encontrado");

            ActualizarEstatusVencidos(new List<Recibo> { recibo });

            return MapToDto(recibo);
        }

        // ====================================================================
        // CANCELACIÓN DE RECIBOS
        // ====================================================================
        public async Task CancelarRecibo(int idRecibo, string motivo, int idUsuario)
        {
            var recibo = await _context.Recibos
                .FirstOrDefaultAsync(r => r.IdRecibo == idRecibo);

            if (recibo == null)
                throw new Exception("Recibo no encontrado");

            if (recibo.Estatus == 1) // Pagado
                throw new Exception("No se puede cancelar un recibo pagado");

            if (recibo.Estatus == 2) // Pago parcial
                throw new Exception("No se puede cancelar un recibo con pago parcial");

            if (recibo.Estatus == 4) // Ya cancelado
                throw new Exception("El recibo ya está cancelado");

            recibo.Estatus = 4; // Cancelado
            recibo.MotivoCancelacion = motivo;
            recibo.FechaCancelacion = DateTime.Now;
            recibo.IdUsuarioCancelacion = idUsuario;

            await _context.SaveChangesAsync();
        }

        // ====================================================================
        // RECALCULAR RECIBOS (Después de agregar/modificar becas)
        // ====================================================================
        public async Task RecalcularRecibos(int idEstudiante, int? idPeriodoAcademico)
        {
            var query = _context.Recibos
                .Include(r => r.Detalles)
                .Where(r => r.IdEstudiante == idEstudiante &&
                           r.Saldo > 0 &&
                           r.Estatus != 4); // No cancelados

            if (idPeriodoAcademico.HasValue)
                query = query.Where(r => r.IdPeriodoAcademico == idPeriodoAcademico.Value);

            var recibos = await query.ToListAsync();

            // Recalcular descuentos
            foreach (var recibo in recibos)
            {
                // Resetear descuento
                recibo.Descuento = 0;
                recibo.Total = recibo.Subtotal;

                // Aplicar becas actualizadas
                await AplicarBecasARecibos(idEstudiante, new List<Recibo> { recibo });

                // Recalcular saldo
                var pagosAplicados = await _context.PagosAplicados
                    .Where(pa => pa.IdRecibo == recibo.IdRecibo)
                    .SumAsync(pa => pa.MontoAplicado);

                recibo.Saldo = recibo.Total - pagosAplicados;

                // Actualizar estatus
                if (recibo.Saldo == 0)
                    recibo.Estatus = 1; // Pagado
                else if (recibo.Saldo < recibo.Total)
                    recibo.Estatus = 2; // Pago parcial
            }

            await _context.SaveChangesAsync();
        }

        // ====================================================================
        // MÉTODOS AUXILIARES
        // ====================================================================
        private void ActualizarEstatusVencidos(List<Recibo> recibos)
        {
            var hoy = DateTime.Today;

            foreach (var recibo in recibos)
            {
                if (recibo.Saldo > 0 &&
                    recibo.FechaVencimiento < hoy &&
                    recibo.Estatus == 0) // Solo si está pendiente
                {
                    recibo.Estatus = 3; // Vencido
                }
            }
        }

        private ReciboDto MapToDto(Recibo recibo)
        {
            // Obtener información del estudiante
            var estudiante = _context.Estudiantes
                .FirstOrDefault(e => e.IdEstudiante == recibo.IdEstudiante);

            return new ReciboDto
            {
                IdRecibo = recibo.IdRecibo,
                Folio = recibo.Folio,
                IdEstudiante = recibo.IdEstudiante,
                Matricula = estudiante?.Matricula,
                NombreEstudiante = estudiante != null
                    ? $"{estudiante.Nombre} {estudiante.ApellidoPaterno} {estudiante.ApellidoMaterno}"
                    : null,
                IdPeriodoAcademico = recibo.IdPeriodoAcademico,
                IdGrupo = recibo.IdGrupo,
                FechaEmision = recibo.FechaEmision,
                FechaVencimiento = recibo.FechaVencimiento,
                Subtotal = recibo.Subtotal,
                Descuento = recibo.Descuento,
                Total = recibo.Total,
                Saldo = recibo.Saldo,
                Estatus = recibo.Estatus,
                MotivoCancelacion = recibo.MotivoCancelacion,
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
}
