import { ReceiptStatus } from "@/types/receipt";

export const TASA_RECARGO_DIARIO = 0.01;
export const RECARGO_FIJO_DIARIO = 10;

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

export function calcularTotalAPagarHoy(
  fechaVencimiento: string | Date,
  saldo: number
): number {
  const recargo = calcularRecargo(fechaVencimiento, saldo);
  return saldo + recargo;
}

function normalizeReceiptStatus(status: ReceiptStatus | number | string): ReceiptStatus {
  if (typeof status === 'number') {
    return status as ReceiptStatus;
  }

  if (typeof status === 'string') {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'PENDIENTE': return ReceiptStatus.PENDIENTE;
      case 'PARCIAL': return ReceiptStatus.PARCIAL;
      case 'PAGADO': return ReceiptStatus.PAGADO;
      case 'VENCIDO': return ReceiptStatus.VENCIDO;
      case 'CANCELADO': return ReceiptStatus.CANCELADO;
      case 'BONIFICADO': return ReceiptStatus.BONIFICADO;
      default: {
        const num = parseInt(status);
        if (!isNaN(num)) return num as ReceiptStatus;
        return ReceiptStatus.PENDIENTE;
      }
    }
  }

  return ReceiptStatus.PENDIENTE;
}

export function formatReceiptStatus(status: ReceiptStatus | number | string): string {
  const normalizedStatus = normalizeReceiptStatus(status);
  const labels: Record<ReceiptStatus, string> = {
    [ReceiptStatus.PENDIENTE]: "Pendiente",
    [ReceiptStatus.PARCIAL]: "Pago Parcial",
    [ReceiptStatus.PAGADO]: "Pagado",
    [ReceiptStatus.VENCIDO]: "Vencido",
    [ReceiptStatus.CANCELADO]: "Cancelado",
    [ReceiptStatus.BONIFICADO]: "Bonificado",
  };
  return labels[normalizedStatus] || "Desconocido";
}

export function getReceiptStatusVariant(
  status: ReceiptStatus | number | string
): "default" | "secondary" | "destructive" | "outline" {
  const normalizedStatus = normalizeReceiptStatus(status);
  const variants: Record<ReceiptStatus, "default" | "secondary" | "destructive" | "outline"> = {
    [ReceiptStatus.PENDIENTE]: "secondary",
    [ReceiptStatus.PARCIAL]: "outline",
    [ReceiptStatus.PAGADO]: "default",
    [ReceiptStatus.VENCIDO]: "destructive",
    [ReceiptStatus.CANCELADO]: "outline",
    [ReceiptStatus.BONIFICADO]: "secondary",
  };
  return variants[normalizedStatus] || "outline";
}

export function getReceiptStatusColor(status: ReceiptStatus | number | string): string {
  const normalizedStatus = normalizeReceiptStatus(status);
  const colors: Record<ReceiptStatus, string> = {
    [ReceiptStatus.PENDIENTE]: "text-blue-600",
    [ReceiptStatus.PARCIAL]: "text-yellow-600",
    [ReceiptStatus.PAGADO]: "text-green-600",
    [ReceiptStatus.VENCIDO]: "text-red-600",
    [ReceiptStatus.CANCELADO]: "text-gray-600",
    [ReceiptStatus.BONIFICADO]: "text-purple-600",
  };
  return colors[normalizedStatus] || "text-gray-600";
}

export function isPaidOrPartial(status: ReceiptStatus | number | string): boolean {
  const normalizedStatus = normalizeReceiptStatus(status);
  return normalizedStatus === ReceiptStatus.PAGADO || normalizedStatus === ReceiptStatus.PARCIAL;
}

export function isCanceledOrPaid(status: ReceiptStatus | number | string): boolean {
  const normalizedStatus = normalizeReceiptStatus(status);
  return normalizedStatus === ReceiptStatus.CANCELADO || normalizedStatus === ReceiptStatus.PAGADO;
}

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

export function descargarReciboPDF(blob: Blob, folio: string): void {
  descargarArchivo(blob, `Recibo_${folio}.pdf`);
}

export function descargarComprobantePDF(blob: Blob, folioPago: string): void {
  descargarArchivo(blob, `Comprobante_${folioPago}.pdf`);
}

export function descargarExcel(blob: Blob, nombreBase: string): void {
  const fecha = new Date().toISOString().split("T")[0];
  descargarArchivo(blob, `${nombreBase}_${fecha}.xlsx`);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function puedeSerCobrado(status: ReceiptStatus, saldo: number): boolean {
  return (
    saldo > 0 &&
    (status === ReceiptStatus.PENDIENTE ||
      status === ReceiptStatus.PARCIAL ||
      status === ReceiptStatus.VENCIDO)
  );
}

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

export function calcularImporteNeto(
  importe: number,
  descuentoBeca: number
): number {
  return Math.max(0, importe - descuentoBeca);
}
