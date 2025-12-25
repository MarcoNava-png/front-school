import { ReceiptStatus } from "@/types/receipt";

// ============================================================================
// CONSTANTES
// ============================================================================

export const TASA_RECARGO_DIARIO = 0.01; // 1% diario
export const RECARGO_FIJO_DIARIO = 10; // $10 por día (alternativa)

// ============================================================================
// CÁLCULOS DE RECARGOS
// ============================================================================

/**
 * Calcula el recargo por días vencidos
 * @param fechaVencimiento Fecha de vencimiento del recibo
 * @param saldo Saldo pendiente
 * @param tasaDiaria Tasa de recargo diario (por defecto 1%)
 * @returns Monto del recargo
 */
export function calcularRecargo(
  fechaVencimiento: string | Date,
  saldo: number,
  tasaDiaria: number = TASA_RECARGO_DIARIO
): number {
  const fecha = typeof fechaVencimiento === "string"
    ? new Date(fechaVencimiento)
    : fechaVencimiento;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  if (fecha >= hoy || saldo <= 0) return 0;

  const diasVencido = Math.floor(
    (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)
  );

  return saldo * tasaDiaria * diasVencido;
}

/**
 * Calcula los días de vencimiento
 * @param fechaVencimiento Fecha de vencimiento
 * @returns Días vencidos (0 si no está vencido)
 */
export function calcularDiasVencido(fechaVencimiento: string | Date): number {
  const fecha = typeof fechaVencimiento === "string"
    ? new Date(fechaVencimiento)
    : fechaVencimiento;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  if (fecha >= hoy) return 0;

  return Math.floor(
    (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calcula el total a pagar hoy (saldo + recargo)
 * @param fechaVencimiento Fecha de vencimiento
 * @param saldo Saldo pendiente
 * @returns Total a pagar
 */
export function calcularTotalAPagarHoy(
  fechaVencimiento: string | Date,
  saldo: number
): number {
  const recargo = calcularRecargo(fechaVencimiento, saldo);
  return saldo + recargo;
}

// ============================================================================
// FORMATEO DE ESTATUS
// ============================================================================

/**
 * Convierte el enum de estatus a texto legible
 * @param status Estatus del recibo
 * @returns Texto del estatus
 */
export function formatReceiptStatus(status: ReceiptStatus): string {
  const labels: Record<ReceiptStatus, string> = {
    [ReceiptStatus.PENDIENTE]: "Pendiente",
    [ReceiptStatus.PARCIAL]: "Pago Parcial",
    [ReceiptStatus.PAGADO]: "Pagado",
    [ReceiptStatus.VENCIDO]: "Vencido",
    [ReceiptStatus.CANCELADO]: "Cancelado",
    [ReceiptStatus.BONIFICADO]: "Bonificado",
  };
  return labels[status] || "Desconocido";
}

/**
 * Obtiene el color para el badge de estatus
 * @param status Estatus del recibo
 * @returns Variante del badge
 */
export function getReceiptStatusVariant(
  status: ReceiptStatus
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<ReceiptStatus, "default" | "secondary" | "destructive" | "outline"> = {
    [ReceiptStatus.PENDIENTE]: "secondary",
    [ReceiptStatus.PARCIAL]: "outline",
    [ReceiptStatus.PAGADO]: "default",
    [ReceiptStatus.VENCIDO]: "destructive",
    [ReceiptStatus.CANCELADO]: "outline",
    [ReceiptStatus.BONIFICADO]: "secondary",
  };
  return variants[status] || "outline";
}

/**
 * Obtiene la clase de color para el texto del estatus
 * @param status Estatus del recibo
 * @returns Clase de Tailwind CSS
 */
export function getReceiptStatusColor(status: ReceiptStatus): string {
  const colors: Record<ReceiptStatus, string> = {
    [ReceiptStatus.PENDIENTE]: "text-blue-600",
    [ReceiptStatus.PARCIAL]: "text-yellow-600",
    [ReceiptStatus.PAGADO]: "text-green-600",
    [ReceiptStatus.VENCIDO]: "text-red-600",
    [ReceiptStatus.CANCELADO]: "text-gray-600",
    [ReceiptStatus.BONIFICADO]: "text-purple-600",
  };
  return colors[status] || "text-gray-600";
}

// ============================================================================
// DESCARGAS DE ARCHIVOS
// ============================================================================

/**
 * Descarga un archivo Blob con el nombre especificado
 * @param blob Blob del archivo
 * @param nombreArchivo Nombre del archivo a descargar
 */
export function descargarArchivo(blob: Blob, nombreArchivo: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Descarga un recibo en PDF
 * @param blob Blob del PDF
 * @param folio Folio del recibo
 */
export function descargarReciboPDF(blob: Blob, folio: string): void {
  descargarArchivo(blob, `Recibo_${folio}.pdf`);
}

/**
 * Descarga un comprobante de pago en PDF
 * @param blob Blob del PDF
 * @param folioPago Folio del pago
 */
export function descargarComprobantePDF(blob: Blob, folioPago: string): void {
  descargarArchivo(blob, `Comprobante_${folioPago}.pdf`);
}

/**
 * Descarga un archivo Excel
 * @param blob Blob del Excel
 * @param nombreBase Nombre base del archivo (sin extensión)
 */
export function descargarExcel(blob: Blob, nombreBase: string): void {
  const fecha = new Date().toISOString().split("T")[0];
  descargarArchivo(blob, `${nombreBase}_${fecha}.xlsx`);
}

// ============================================================================
// FORMATEO DE MONEDA
// ============================================================================

/**
 * Formatea un número como moneda MXN
 * @param amount Monto a formatear
 * @returns Monto formateado
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Formatea un número como porcentaje
 * @param value Valor decimal (0.5 = 50%)
 * @returns Porcentaje formateado
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida si un recibo puede ser cobrado
 * @param status Estatus del recibo
 * @param saldo Saldo del recibo
 * @returns true si puede ser cobrado
 */
export function puedeSerCobrado(status: ReceiptStatus, saldo: number): boolean {
  return (
    saldo > 0 &&
    (status === ReceiptStatus.PENDIENTE ||
      status === ReceiptStatus.PARCIAL ||
      status === ReceiptStatus.VENCIDO)
  );
}

/**
 * Valida si un pago puede ser cancelado
 * @param fechaPago Fecha del pago
 * @param horasLimite Horas límite para cancelar (por defecto 24)
 * @returns true si puede ser cancelado
 */
export function puedeCancelarPago(
  fechaPago: string | Date,
  horasLimite: number = 24
): boolean {
  const fecha = typeof fechaPago === "string" ? new Date(fechaPago) : fechaPago;
  const ahora = new Date();
  const diferenciaHoras =
    (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);

  return diferenciaHoras <= horasLimite;
}

// ============================================================================
// CÁLCULOS DE APLICACIÓN DE BECAS
// ============================================================================

/**
 * Calcula el descuento por beca
 * @param importe Importe original
 * @param tipoBeca Tipo de beca (PORCENTAJE o MONTO_FIJO)
 * @param valor Valor de la beca
 * @returns Monto del descuento
 */
export function calcularDescuentoBeca(
  importe: number,
  tipoBeca: "PORCENTAJE" | "MONTO_FIJO",
  valor: number
): number {
  if (tipoBeca === "PORCENTAJE") {
    return importe * (valor / 100);
  } else {
    return Math.min(valor, importe);
  }
}

/**
 * Calcula el importe neto después de aplicar beca
 * @param importe Importe original
 * @param descuentoBeca Descuento aplicado
 * @returns Importe neto
 */
export function calcularImporteNeto(
  importe: number,
  descuentoBeca: number
): number {
  return Math.max(0, importe - descuentoBeca);
}
