import {
  ConvenioDto,
  CrearConvenioDto,
  ActualizarConvenioDto,
  AsignarConvenioAspiranteDto,
  AspiranteConvenioDto,
  ConvenioDisponibleDto,
  CalculoDescuentoConvenioDto,
  CalculoDescuentoTotalDto,
  EstatusConvenioAspirante,
} from "@/types/convenio";

import apiClient from "./api-client";

export async function listarConvenios(params?: {
  soloActivos?: boolean;
  idCampus?: number;
  idPlanEstudios?: number;
}): Promise<ConvenioDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.soloActivos !== undefined) {
    queryParams.append("soloActivos", String(params.soloActivos));
  }
  if (params?.idCampus) {
    queryParams.append("idCampus", String(params.idCampus));
  }
  if (params?.idPlanEstudios) {
    queryParams.append("idPlanEstudios", String(params.idPlanEstudios));
  }

  const { data } = await apiClient.get<ConvenioDto[]>(
    `/Convenio${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return data;
}

export async function obtenerConvenioPorId(id: number): Promise<ConvenioDto> {
  const { data } = await apiClient.get<ConvenioDto>(`/Convenio/${id}`);
  return data;
}

export async function obtenerConveniosActivos(params?: {
  idCampus?: number;
  idPlanEstudios?: number;
}): Promise<ConvenioDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.idCampus) {
    queryParams.append("idCampus", String(params.idCampus));
  }
  if (params?.idPlanEstudios) {
    queryParams.append("idPlanEstudios", String(params.idPlanEstudios));
  }

  const { data } = await apiClient.get<ConvenioDto[]>(
    `/Convenio/activos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return data;
}

export async function crearConvenio(payload: CrearConvenioDto): Promise<ConvenioDto> {
  const { data } = await apiClient.post<ConvenioDto>("/Convenio", payload);
  return data;
}

export async function actualizarConvenio(id: number, payload: ActualizarConvenioDto): Promise<ConvenioDto> {
  const { data } = await apiClient.put<ConvenioDto>(`/Convenio/${id}`, payload);
  return data;
}

export async function eliminarConvenio(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/Convenio/${id}`);
  return data;
}

export async function cambiarEstadoConvenio(id: number, activo: boolean): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>(`/Convenio/${id}/estado`, { activo });
  return data;
}

export async function obtenerConveniosDisponiblesParaAspirante(idAspirante: number): Promise<ConvenioDisponibleDto[]> {
  const { data } = await apiClient.get<ConvenioDisponibleDto[]>(`/Convenio/aspirante/${idAspirante}/disponibles`);
  return data;
}

export async function obtenerConveniosAspirante(idAspirante: number): Promise<AspiranteConvenioDto[]> {
  const { data } = await apiClient.get<AspiranteConvenioDto[]>(`/Convenio/aspirante/${idAspirante}`);
  return data;
}

export async function asignarConvenioAspirante(payload: AsignarConvenioAspiranteDto): Promise<AspiranteConvenioDto> {
  const { data } = await apiClient.post<AspiranteConvenioDto>("/Convenio/aspirante/asignar", payload);
  return data;
}

export async function cambiarEstatusConvenioAspirante(
  idAspiranteConvenio: number,
  estatus: EstatusConvenioAspirante,
): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>(`/Convenio/aspirante/${idAspiranteConvenio}/estatus`, {
    estatus,
  });
  return data;
}

export async function eliminarConvenioAspirante(idAspiranteConvenio: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/Convenio/aspirante/${idAspiranteConvenio}`);
  return data;
}

export async function calcularDescuentoConvenio(id: number, monto: number): Promise<CalculoDescuentoConvenioDto> {
  const { data } = await apiClient.get<CalculoDescuentoConvenioDto>(
    `/Convenio/${id}/calcular-descuento?monto=${monto}`,
  );
  return data;
}

export async function calcularDescuentoTotalAspirante(
  idAspirante: number,
  monto: number,
): Promise<CalculoDescuentoTotalDto> {
  const { data } = await apiClient.get<CalculoDescuentoTotalDto>(
    `/Convenio/aspirante/${idAspirante}/calcular-descuento-total?monto=${monto}`,
  );
  return data;
}

export function formatearBeneficio(convenio: {
  tipoBeneficio: string;
  descuentoPct?: number | null;
  monto?: number | null;
}): string {
  switch (convenio.tipoBeneficio.toUpperCase()) {
    case "PORCENTAJE":
      return `${convenio.descuentoPct ?? 0}% de descuento`;
    case "MONTO":
      return `$${(convenio.monto ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })} de descuento`;
    case "EXENCION":
      return "Exencion total (100%)";
    default:
      return convenio.tipoBeneficio;
  }
}

export function getColorEstatusConvenio(estatus: EstatusConvenioAspirante): "default" | "success" | "destructive" {
  switch (estatus) {
    case "Aprobado":
      return "success";
    case "Rechazado":
      return "destructive";
    default:
      return "default";
  }
}
