// ============================================================================
// DTOs (Data Transfer Objects) - Sistema de Colegiaturas
// Ubicación sugerida: DTOs/ o Models/DTOs/
// ============================================================================

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TuProyecto.DTOs
{
    // ========================================================================
    // CONCEPTOS DE PAGO
    // ========================================================================
    public class ConceptoPagoDto
    {
        public int IdConceptoPago { get; set; }
        public string Clave { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public bool EsActivo { get; set; }
    }

    public class CreateConceptoPagoDto
    {
        [Required, MaxLength(20)]
        public string Clave { get; set; }

        [Required, MaxLength(100)]
        public string Nombre { get; set; }

        [MaxLength(255)]
        public string Descripcion { get; set; }
    }

    // ========================================================================
    // PLANTILLAS DE COBRO
    // ========================================================================
    public class PlantillaCobroDto
    {
        public int IdPlantillaCobro { get; set; }
        public string NombrePlantilla { get; set; }
        public int IdPlanEstudios { get; set; }
        public string NombrePlanEstudios { get; set; } // Join
        public int NumeroCuatrimestre { get; set; }
        public int? IdPeriodoAcademico { get; set; }
        public string NombrePeriodo { get; set; } // Join
        public int? IdTurno { get; set; }
        public string EstrategiaEmision { get; set; }
        public int NumeroRecibos { get; set; }
        public int DiaVencimiento { get; set; }
        public bool EsActiva { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int TotalConceptos { get; set; } // Calculado
        public List<PlantillaCobroDetalleDto> Detalles { get; set; }
    }

    public class PlantillaCobroDetalleDto
    {
        public int IdDetalleTempla { get; set; }
        public int IdConceptoPago { get; set; }
        public string NombreConcepto { get; set; } // Join
        public decimal Monto { get; set; }
        public int Cantidad { get; set; }
        public string Distribucion { get; set; }
        public int? NumeroRecibo { get; set; }
        public int Orden { get; set; }
    }

    public class CreatePlantillaCobroDto
    {
        [Required, MaxLength(200)]
        public string NombrePlantilla { get; set; }

        [Required]
        public int IdPlanEstudios { get; set; }

        [Required, Range(1, 12)]
        public int NumeroCuatrimestre { get; set; }

        public int? IdPeriodoAcademico { get; set; }

        public int? IdTurno { get; set; }

        [Required, MaxLength(20)]
        public string EstrategiaEmision { get; set; } = "INICIO_PERIODO";

        [Required, Range(1, 12)]
        public int NumeroRecibos { get; set; }

        [Required, Range(1, 31)]
        public int DiaVencimiento { get; set; }

        public bool EsActiva { get; set; } = true;

        [Required]
        public List<CreatePlantillaCobroDetalleDto> Detalles { get; set; }
    }

    public class CreatePlantillaCobroDetalleDto
    {
        [Required]
        public int IdConceptoPago { get; set; }

        [Required, Range(0.01, 999999.99)]
        public decimal Monto { get; set; }

        [Range(1, 99)]
        public int Cantidad { get; set; } = 1;

        [Required, MaxLength(20)]
        public string Distribucion { get; set; } = "TODOS_LOS_RECIBOS";

        public int? NumeroRecibo { get; set; }

        public int Orden { get; set; } = 1;
    }

    public class UpdatePlantillaCobroDto : CreatePlantillaCobroDto
    {
        public int IdPlantillaCobro { get; set; }
    }

    public class BuscarPlantillaActivaQuery
    {
        public int IdPlanEstudios { get; set; }
        public int NumeroCuatrimestre { get; set; }
        public int? IdPeriodoAcademico { get; set; }
        public int? IdTurno { get; set; }
    }

    public class VistaPrevia ReciboDto
    {
        public int NumeroRecibo { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public List<ConceptoVistaPreviaDto> Conceptos { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
    }

    public class ConceptoVistaPreviaDto
    {
        public string Concepto { get; set; }
        public decimal Monto { get; set; }
    }

    // ========================================================================
    // RECIBOS
    // ========================================================================
    public class ReciboDto
    {
        public int IdRecibo { get; set; }
        public string Folio { get; set; }
        public int IdEstudiante { get; set; }
        public string Matricula { get; set; } // Join
        public string NombreEstudiante { get; set; } // Join
        public int IdPeriodoAcademico { get; set; }
        public string NombrePeriodo { get; set; } // Join
        public int? IdGrupo { get; set; }
        public string NombreGrupo { get; set; } // Join
        public DateTime FechaEmision { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Descuento { get; set; }
        public decimal Total { get; set; }
        public decimal Saldo { get; set; }
        public int Estatus { get; set; }
        public string MotivoCancelacion { get; set; }
        public List<ReciboDetalleDto> Detalles { get; set; }
    }

    public class ReciboDetalleDto
    {
        public int IdDetalleRecibo { get; set; }
        public int IdConceptoPago { get; set; }
        public string Concepto { get; set; }
        public decimal Monto { get; set; }
        public int Orden { get; set; }
    }

    public class GenerarRecibosDesde PlantillaDto
    {
        [Required]
        public int IdEstudiante { get; set; }

        public int? IdGrupo { get; set; }

        [Required]
        public int IdPlantillaCobro { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }
    }

    public class RecibosGeneradosDto
    {
        public int RecibosGenerados { get; set; }
        public List<ReciboDto> Recibos { get; set; }
    }

    public class CancelarReciboDto
    {
        [Required, MaxLength(500)]
        public string Motivo { get; set; }
    }

    public class BuscarRecibosQuery
    {
        public int? IdEstudiante { get; set; }
        public string Matricula { get; set; }
        public string Folio { get; set; }
        public int? Estatus { get; set; }
        public int? IdPeriodoAcademico { get; set; }
        public bool SoloVencidos { get; set; }
    }

    // ========================================================================
    // CAJA - BÚSQUEDA DE RECIBOS PARA COBRO
    // ========================================================================
    public class RecibosParaCobroDto
    {
        public EstudianteInfoDto Estudiante { get; set; }
        public List<ReciboDto> Recibos { get; set; }
        public decimal TotalAdeudo { get; set; }
        public int RecibosVencidos { get; set; }
        public int RecibosPendientes { get; set; }
    }

    public class EstudianteInfoDto
    {
        public int IdEstudiante { get; set; }
        public string Matricula { get; set; }
        public string NombreCompleto { get; set; }
        public string Foto { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
    }

    // ========================================================================
    // PAGOS
    // ========================================================================
    public class MedioPagoDto
    {
        public int IdMedioPago { get; set; }
        public string Nombre { get; set; }
        public bool RequiereReferencia { get; set; }
        public bool Activo { get; set; }
    }

    public class RegistrarPagoCajaDto
    {
        [Required]
        public DateTime FechaPago { get; set; }

        [Required]
        public int IdMedioPago { get; set; }

        [Required, Range(0.01, 999999.99)]
        public decimal Monto { get; set; }

        [MaxLength(100)]
        public string Referencia { get; set; }

        [MaxLength(500)]
        public string Notas { get; set; }

        [Required]
        public List<ReciboSeleccionadoDto> RecibosSeleccionados { get; set; }
    }

    public class ReciboSeleccionadoDto
    {
        [Required]
        public int IdRecibo { get; set; }

        [Required, Range(0.01, 999999.99)]
        public decimal MontoAplicar { get; set; }
    }

    public class PagoRegistradoDto
    {
        public int IdPago { get; set; }
        public string FolioPago { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaPago { get; set; }
        public List<int> RecibosAfectados { get; set; }
        public decimal Cambio { get; set; }
    }

    public class PagoDto
    {
        public int IdPago { get; set; }
        public string FolioPago { get; set; }
        public DateTime FechaPagoUtc { get; set; }
        public string MedioPago { get; set; }
        public decimal Monto { get; set; }
        public string Referencia { get; set; }
        public string Notas { get; set; }
        public int Estatus { get; set; }
    }

    // ========================================================================
    // CORTE DE CAJA
    // ========================================================================
    public class ResumenCorteCajaDto
    {
        public List<PagoDto> Pagos { get; set; }
        public TotalesCorteCajaDto Totales { get; set; }
    }

    public class TotalesCorteCajaDto
    {
        public int Cantidad { get; set; }
        public decimal Efectivo { get; set; }
        public decimal Transferencia { get; set; }
        public decimal Tarjeta { get; set; }
        public decimal Total { get; set; }
    }

    public class CerrarCorteCajaDto
    {
        [Required, Range(0, 999999.99)]
        public decimal MontoInicial { get; set; }

        [MaxLength(500)]
        public string Observaciones { get; set; }
    }

    public class CorteCajaDto
    {
        public int IdCorteCaja { get; set; }
        public string FolioCorteCaja { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public decimal TotalEfectivo { get; set; }
        public decimal TotalTransferencia { get; set; }
        public decimal TotalTarjeta { get; set; }
        public decimal TotalOtros { get; set; }
        public decimal TotalGeneral { get; set; }
        public decimal MontoInicial { get; set; }
        public bool Cerrado { get; set; }
        public string Observaciones { get; set; }
    }

    // ========================================================================
    // BECAS
    // ========================================================================
    public class BecaEstudianteDto
    {
        public int IdBeca { get; set; }
        public int IdEstudiante { get; set; }
        public string TipoBeca { get; set; }
        public decimal Valor { get; set; }
        public int? IdConceptoPago { get; set; }
        public string NombreConcepto { get; set; } // Join
        public int? IdPeriodoAcademico { get; set; }
        public string NombrePeriodo { get; set; } // Join
        public bool Activa { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string Observaciones { get; set; }
    }

    public class CreateBecaEstudianteDto
    {
        [Required]
        public int IdEstudiante { get; set; }

        [Required, MaxLength(20)]
        public string TipoBeca { get; set; } // PORCENTAJE o MONTO_FIJO

        [Required, Range(0.01, 999999.99)]
        public decimal Valor { get; set; }

        public int? IdConceptoPago { get; set; }

        public int? IdPeriodoAcademico { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        [MaxLength(500)]
        public string Observaciones { get; set; }
    }

    public class DesactivarBecaDto
    {
        [Required, MaxLength(500)]
        public string Motivo { get; set; }
    }

    // ========================================================================
    // REPORTES
    // ========================================================================
    public class CarteraVencidaDto
    {
        public string Matricula { get; set; }
        public string NombreEstudiante { get; set; }
        public string Grupo { get; set; }
        public decimal TotalAdeudo { get; set; }
        public int RecibosVencidos { get; set; }
        public int DiasVencidoMaximo { get; set; }
    }

    public class IngresosPeriodoDto
    {
        public decimal TotalIngresos { get; set; }
        public decimal TotalRecibidos { get; set; }
        public decimal TotalPendiente { get; set; }
        public int PagosRegistrados { get; set; }
        public List<DesglosePorConceptoDto> DesglosePorConcepto { get; set; }
    }

    public class DesglosePorConceptoDto
    {
        public string Concepto { get; set; }
        public decimal Monto { get; set; }
    }

    // ========================================================================
    // RESPUESTAS GENÉRICAS
    // ========================================================================
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
    }

    public class ErrorResponse
    {
        public string Message { get; set; }
        public List<string> Errors { get; set; }
    }
}
