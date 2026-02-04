import {
  Applicant,
  ApplicantsResponse,
  AspiranteDocumentoDto,
  CambiarEstatusDocumentoDto,
  CancelarAspiranteRequest,
  CargarDocumentoFormData,
  DocumentoRequisitoDto,
  EstadisticasAspirantesDto,
  FichaAdmisionDto,
  InscribirAspiranteRequest,
  InscripcionAspiranteResultDto,
  PayloadCreateApplicant,
  PayloadTrackingLog,
  PayloadUpdateApplicant,
  PlantillaCobroAspirante,
  RecalcularDescuentosResult,
  ReciboDto,
  TrackingLog,
  ValidarDocumentoRequestDto,
} from "@/types/applicant";

import apiClient from "./api-client";

export async function getApplicantsList(dataOptions: {
  page?: number;
  pageSize?: number;
  filter?: string;
}): Promise<ApplicantsResponse> {
  const { data } = await apiClient.get<ApplicantsResponse>(
    `/Aspirante?page=${dataOptions.page ?? 1}&pageSize=${dataOptions.pageSize ?? 20}&filter=${dataOptions.filter ?? ""}`,
  );
  return data;
}

export async function getApplicantById(applicantId: number | string): Promise<Applicant> {
  const { data } = await apiClient.get<Applicant>(`/Aspirante/${applicantId}`);
  return data;
}

export async function createApplicant(payload: PayloadCreateApplicant): Promise<Applicant> {
  const { data } = await apiClient.post<Applicant>(`/Aspirante`, payload);
  return data;
}

export async function updateApplicant(payload: PayloadUpdateApplicant): Promise<Applicant> {
  const { data } = await apiClient.put<Applicant>(`/Aspirante`, payload);
  return data;
}

export async function getApplicantTrackingLogs(applicantId: number | string): Promise<TrackingLog[]> {
  const { data } = await apiClient.get<TrackingLog[]>(`/Aspirante/bitacora-seguimiento?aspiranteId=${applicantId}`);
  return data;
}

export async function addApplicantTrackingLog(payload: PayloadTrackingLog): Promise<TrackingLog> {
  const { data } = await apiClient.post<TrackingLog>(`/Aspirante/bitacora-seguimiento`, payload);
  return data;
}

export async function getApplicantDocuments(aspiranteId: number): Promise<AspiranteDocumentoDto[]> {
  const { data } = await apiClient.get<AspiranteDocumentoDto[]>(`/Aspirante/${aspiranteId}/documentos`);
  return data;
}

export async function getDocumentRequirements(): Promise<DocumentoRequisitoDto[]> {
  const { data } = await apiClient.get<DocumentoRequisitoDto[]>(`/Aspirante/0/documentos/requisitos`);
  return data;
}

export async function validateDocument(idDocumento: number, payload: ValidarDocumentoRequestDto): Promise<void> {
  await apiClient.patch(`/Aspirante/documentos/${idDocumento}/validar`, payload);
}

export async function changeDocumentStatus(idDocumento: number, payload: CambiarEstatusDocumentoDto): Promise<void> {
  await apiClient.patch(`/Aspirante/documentos/${idDocumento}/estatus`, payload);
}

export async function uploadApplicantDocument(formData: CargarDocumentoFormData): Promise<{ idAspiranteDocumento: number; mensaje: string }> {
  const form = new FormData();
  form.append("idAspirante", formData.idAspirante.toString());
  form.append("idDocumentoRequisito", formData.idDocumentoRequisito.toString());
  form.append("archivo", formData.archivo);
  if (formData.notas) {
    form.append("notas", formData.notas);
  }

  const { data } = await apiClient.post<{ idAspiranteDocumento: number; mensaje: string }>(
    `/Aspirante/documentos/cargar`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}

export async function getDocumentById(idDocumento: number): Promise<AspiranteDocumentoDto> {
  const { data } = await apiClient.get<AspiranteDocumentoDto>(`/Aspirante/documentos/${idDocumento}`);
  return data;
}

export async function getApplicantReceipts(aspiranteId: number): Promise<ReciboDto[]> {
  const { data } = await apiClient.get<ReciboDto[]>(`/Aspirante/${aspiranteId}/recibo-inicial`);
  return data;
}

export async function getApplicantStatistics(periodoId?: number): Promise<EstadisticasAspirantesDto> {
  const url = periodoId ? `/Aspirante/estadisticas?periodoId=${periodoId}` : `/Aspirante/estadisticas`;
  const { data } = await apiClient.get<EstadisticasAspirantesDto>(url);
  return data;
}

export async function getApplicantAdmissionSheet(aspiranteId: number): Promise<FichaAdmisionDto> {
  const { data } = await apiClient.get<FichaAdmisionDto>(`/Aspirante/${aspiranteId}/ficha-admision`);
  return data;
}

export async function downloadApplicantEnrollmentSheet(aspiranteId: number, openInNewTab: boolean = false): Promise<void> {
  const response = await apiClient.get(`/Aspirante/${aspiranteId}/hoja-inscripcion/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  if (openInNewTab) {
    window.open(url, "_blank");
  } else {
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let fileName = `HojaInscripcion_${aspiranteId}_${new Date().toISOString().split("T")[0]}.pdf`;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, "");
      }
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  window.URL.revokeObjectURL(url);
}

export async function enrollApplicantAsStudent(
  aspiranteId: number,
  request: InscribirAspiranteRequest,
): Promise<InscripcionAspiranteResultDto> {
  const { data } = await apiClient.post<InscripcionAspiranteResultDto>(
    `/Aspirante/${aspiranteId}/inscribir-como-estudiante`,
    request,
  );
  return data;
}

export async function cancelApplicant(aspiranteId: number, request: CancelarAspiranteRequest): Promise<void> {
  await apiClient.patch(`/Aspirante/${aspiranteId}/cancelar`, request);
}

export async function generateApplicantReceipt(
  aspiranteId: number,
  monto: number,
  concepto: string = "Cuota de Inscripcion",
  diasVencimiento: number = 7
): Promise<ReciboDto> {
  const { data } = await apiClient.post<ReciboDto>(
    `/Aspirante/${aspiranteId}/generar-recibo-inscripcion`,
    {
      monto,
      concepto,
      diasVencimiento,
    }
  );
  return data;
}

export async function deleteApplicantReceipt(idRecibo: number): Promise<void> {
  await apiClient.delete(`/Aspirante/recibo/${idRecibo}`);
}

export async function repairReceiptsWithoutDetails(): Promise<{ reparados: number; mensaje: string }> {
  console.log("Llamando a /Aspirante/reparar-recibos-sin-detalles...");
  const response = await apiClient.post<any>(`/Aspirante/reparar-recibos-sin-detalles`);
  console.log("Respuesta del backend:", response);
  console.log("Data recibida:", response.data);

  const reparados = response.data?.Reparados ?? response.data?.reparados ?? 0;
  const mensaje = response.data?.Mensaje ?? response.data?.mensaje ?? "Reparacion completada";

  console.log(`Reparados: ${reparados}, Mensaje: ${mensaje}`);

  return { reparados, mensaje };
}

export async function recalcularDescuentosConvenio(
  aspiranteId: number
): Promise<RecalcularDescuentosResult> {
  const { data } = await apiClient.post<RecalcularDescuentosResult>(
    `/Aspirante/${aspiranteId}/recalcular-descuentos-convenio`
  );
  return data;
}

export async function buscarPlantillaParaAspirante(
  aspiranteId: number
): Promise<PlantillaCobroAspirante | null> {
  try {
    const { data } = await apiClient.get<PlantillaCobroAspirante>(
      `/Aspirante/${aspiranteId}/plantilla-disponible`
    );
    return data;
  } catch {
    return null;
  }
}

export async function generarRecibosDesdeePlantilla(
  aspiranteId: number,
  idPlantillaCobro: number,
  eliminarPendientesExistentes: boolean = false
): Promise<ReciboDto[]> {
  const { data } = await apiClient.post<ReciboDto[]>(
    `/Aspirante/${aspiranteId}/generar-recibos-plantilla`,
    { idPlantillaCobro, eliminarPendientesExistentes }
  );
  return data;
}

export async function generateApplicantReceiptByConcepto(
  aspiranteId: number,
  idConceptoPago: number,
  diasVencimiento: number = 7
): Promise<ReciboDto> {
  const { data } = await apiClient.post<ReciboDto>(
    `/Aspirante/${aspiranteId}/generar-recibo-inscripcion`,
    { idConceptoPago, diasVencimiento, monto: 0 }
  );
  return data;
}
