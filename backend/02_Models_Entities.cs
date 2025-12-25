// ============================================================================
// MODELOS/ENTITIES DEL SISTEMA DE COLEGIATURAS
// Ubicación sugerida: Models/ o Entities/
// ============================================================================

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TuProyecto.Models
{
    // ========================================================================
    // 1. CONCEPTO DE PAGO
    // ========================================================================
    [Table("ConceptosPago")]
    public class ConceptoPago
    {
        [Key]
        public int IdConceptoPago { get; set; }

        [Required, MaxLength(20)]
        public string Clave { get; set; }

        [Required, MaxLength(100)]
        public string Nombre { get; set; }

        [MaxLength(255)]
        public string Descripcion { get; set; }

        public bool EsActivo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public DateTime? FechaModificacion { get; set; }
    }

    // ========================================================================
    // 2. PLANTILLA DE COBRO
    // ========================================================================
    [Table("PlantillasCobro")]
    public class PlantillaCobro
    {
        [Key]
        public int IdPlantillaCobro { get; set; }

        [Required, MaxLength(200)]
        public string NombrePlantilla { get; set; }

        public int IdPlanEstudios { get; set; }

        public int NumeroCuatrimestre { get; set; }

        public int? IdPeriodoAcademico { get; set; }

        public int? IdTurno { get; set; }

        [Required, MaxLength(20)]
        public string EstrategiaEmision { get; set; } = "INICIO_PERIODO";

        [Range(1, 12)]
        public int NumeroRecibos { get; set; }

        [Range(1, 31)]
        public int DiaVencimiento { get; set; }

        public bool EsActiva { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public DateTime? FechaModificacion { get; set; }

        public int IdUsuarioCreacion { get; set; }

        // Navegación
        public virtual ICollection<PlantillaCobroDetalle> Detalles { get; set; }
    }

    // ========================================================================
    // 3. DETALLE DE PLANTILLA DE COBRO
    // ========================================================================
    [Table("PlantillasCobroDetalles")]
    public class PlantillaCobroDetalle
    {
        [Key]
        public int IdDetalleTempla { get; set; }

        public int IdPlantillaCobro { get; set; }

        public int IdConceptoPago { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        public int Cantidad { get; set; } = 1;

        [Required, MaxLength(20)]
        public string Distribucion { get; set; } = "TODOS_LOS_RECIBOS";

        public int? NumeroRecibo { get; set; }

        public int Orden { get; set; } = 1;

        // Navegación
        [ForeignKey("IdPlantillaCobro")]
        public virtual PlantillaCobro PlantillaCobro { get; set; }

        [ForeignKey("IdConceptoPago")]
        public virtual ConceptoPago ConceptoPago { get; set; }
    }

    // ========================================================================
    // 4. RECIBO
    // ========================================================================
    [Table("Recibos")]
    public class Recibo
    {
        [Key]
        public int IdRecibo { get; set; }

        [Required, MaxLength(50)]
        public string Folio { get; set; }

        public int IdEstudiante { get; set; }

        public int IdPeriodoAcademico { get; set; }

        public int? IdGrupo { get; set; }

        public DateTime FechaEmision { get; set; } = DateTime.Now;

        public DateTime FechaVencimiento { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Subtotal { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Descuento { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Total { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Saldo { get; set; } = 0;

        // 0=Pendiente, 1=Pagado, 2=Parcial, 3=Vencido, 4=Cancelado, 5=Bonificado
        public int Estatus { get; set; } = 0;

        [MaxLength(500)]
        public string MotivoCancelacion { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public int IdUsuarioCreacion { get; set; }

        public DateTime? FechaCancelacion { get; set; }

        public int? IdUsuarioCancelacion { get; set; }

        // Navegación
        public virtual ICollection<ReciboDetalle> Detalles { get; set; }

        public virtual ICollection<PagoAplicado> PagosAplicados { get; set; }
    }

    // ========================================================================
    // 5. DETALLE DE RECIBO
    // ========================================================================
    [Table("RecibosDetalles")]
    public class ReciboDetalle
    {
        [Key]
        public int IdDetalleRecibo { get; set; }

        public int IdRecibo { get; set; }

        public int IdConceptoPago { get; set; }

        [Required, MaxLength(200)]
        public string Concepto { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        public int Orden { get; set; } = 1;

        // Navegación
        [ForeignKey("IdRecibo")]
        public virtual Recibo Recibo { get; set; }

        [ForeignKey("IdConceptoPago")]
        public virtual ConceptoPago ConceptoPago { get; set; }
    }

    // ========================================================================
    // 6. MEDIO DE PAGO
    // ========================================================================
    [Table("MediosPago")]
    public class MedioPago
    {
        [Key]
        public int IdMedioPago { get; set; }

        [Required, MaxLength(50)]
        public string Nombre { get; set; }

        public bool RequiereReferencia { get; set; } = false;

        public bool Activo { get; set; } = true;
    }

    // ========================================================================
    // 7. PAGO
    // ========================================================================
    [Table("Pagos")]
    public class Pago
    {
        [Key]
        public int IdPago { get; set; }

        [Required, MaxLength(50)]
        public string FolioPago { get; set; }

        public DateTime FechaPagoUtc { get; set; }

        public int IdMedioPago { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        [MaxLength(100)]
        public string Referencia { get; set; }

        [MaxLength(500)]
        public string Notas { get; set; }

        // 0=Confirmado, 1=Cancelado
        public int Estatus { get; set; } = 0;

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public int IdUsuarioCreacion { get; set; }

        // Navegación
        [ForeignKey("IdMedioPago")]
        public virtual MedioPago MedioPago { get; set; }

        public virtual ICollection<PagoAplicado> PagosAplicados { get; set; }
    }

    // ========================================================================
    // 8. APLICACIÓN DE PAGO (Relación Pago-Recibo)
    // ========================================================================
    [Table("PagosAplicados")]
    public class PagoAplicado
    {
        [Key]
        public int IdPagoAplicado { get; set; }

        public int IdPago { get; set; }

        public int IdRecibo { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MontoAplicado { get; set; }

        public DateTime FechaAplicacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("IdPago")]
        public virtual Pago Pago { get; set; }

        [ForeignKey("IdRecibo")]
        public virtual Recibo Recibo { get; set; }
    }

    // ========================================================================
    // 9. BECA DE ESTUDIANTE
    // ========================================================================
    [Table("BecasEstudiantes")]
    public class BecaEstudiante
    {
        [Key]
        public int IdBeca { get; set; }

        public int IdEstudiante { get; set; }

        [Required, MaxLength(20)]
        public string TipoBeca { get; set; } // PORCENTAJE o MONTO_FIJO

        [Column(TypeName = "decimal(10,2)")]
        public decimal Valor { get; set; }

        public int? IdConceptoPago { get; set; }

        public int? IdPeriodoAcademico { get; set; }

        public bool Activa { get; set; } = true;

        public DateTime FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public int IdUsuarioCreacion { get; set; }

        [MaxLength(500)]
        public string Observaciones { get; set; }

        // Navegación
        [ForeignKey("IdConceptoPago")]
        public virtual ConceptoPago ConceptoPago { get; set; }
    }

    // ========================================================================
    // 10. CORTE DE CAJA
    // ========================================================================
    [Table("CortesCaja")]
    public class CorteCaja
    {
        [Key]
        public int IdCorteCaja { get; set; }

        [Required, MaxLength(50)]
        public string FolioCorteCaja { get; set; }

        public DateTime FechaInicio { get; set; }

        public DateTime FechaFin { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalEfectivo { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalTransferencia { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalTarjeta { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalOtros { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalGeneral { get; set; } = 0;

        [Column(TypeName = "decimal(10,2)")]
        public decimal MontoInicial { get; set; } = 0;

        public bool Cerrado { get; set; } = false;

        [MaxLength(500)]
        public string Observaciones { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public int IdUsuarioCreacion { get; set; }
    }
}
