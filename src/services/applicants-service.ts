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
  ReciboDto,
  TrackingLog,
  ValidarDocumentoRequestDto,
} from "@/types/applicant";

import apiClient from "./api-client";

// ============================================================================
// CRUD BÁSICO DE ASPIRANTES
// ============================================================================

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

// ============================================================================
// BITÁCORA DE SEGUIMIENTO
// ============================================================================

export async function getApplicantTrackingLogs(applicantId: number | string): Promise<TrackingLog[]> {
  const { data } = await apiClient.get<TrackingLog[]>(`/Aspirante/bitacora-seguimiento?aspiranteId=${applicantId}`);
  return data;
}

export async function addApplicantTrackingLog(payload: PayloadTrackingLog): Promise<TrackingLog> {
  const { data } = await apiClient.post<TrackingLog>(`/Aspirante/bitacora-seguimiento`, payload);
  return data;
}

// ============================================================================
// GESTIÓN DE DOCUMENTOS
// ============================================================================

/**
 * Obtiene la lista de documentos del aspirante con su estado
 * @param aspiranteId ID del aspirante
 * @returns Lista de documentos con estatus (PENDIENTE, SUBIDO, VALIDADO, RECHAZADO)
 */
export async function getApplicantDocuments(aspiranteId: number): Promise<AspiranteDocumentoDto[]> {
  const { data } = await apiClient.get<AspiranteDocumentoDto[]>(`/Aspirante/${aspiranteId}/documentos`);
  return data;
}

/**
 * Obtiene la lista de requisitos de documentos (catálogo)
 * @returns Lista de requisitos de documentos disponibles
 */
export async function getDocumentRequirements(): Promise<DocumentoRequisitoDto[]> {
  const { data } = await apiClient.get<DocumentoRequisitoDto[]>(`/Aspirante/0/documentos/requisitos`);
  return data;
}

/**
 * Valida o rechaza un documento subido por el aspirante
 * @param idDocumento ID del documento a validar
 * @param payload Datos de validación (validar: true/false, notas opcionales)
 */
export async function validateDocument(idDocumento: number, payload: ValidarDocumentoRequestDto): Promise<void> {
  await apiClient.patch(`/Aspirante/documentos/${idDocumento}/validar`, payload);
}

/**
 * Cambia el estatus de un documento (simplificado)
 * @param idDocumento ID del documento
 * @param payload Nuevo estatus y notas opcionales
 */
export async function changeDocumentStatus(idDocumento: number, payload: CambiarEstatusDocumentoDto): Promise<void> {
  await apiClient.patch(`/Aspirante/documentos/${idDocumento}/estatus`, payload);
}

/**
 * Carga un archivo de documento del aspirante
 * @param formData Datos del formulario con archivo (multipart/form-data)
 * @returns ID del documento creado
 */
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

/**
 * Obtiene un documento específico por su ID
 * @param idDocumento ID del documento
 */
export async function getDocumentById(idDocumento: number): Promise<AspiranteDocumentoDto> {
  const { data } = await apiClient.get<AspiranteDocumentoDto>(`/Aspirante/documentos/${idDocumento}`);
  return data;
}

// ============================================================================
// GESTIÓN DE RECIBOS/PAGOS
// ============================================================================

/**
 * Obtiene los recibos iniciales del aspirante (pago de inscripción)
 * @param aspiranteId ID del aspirante
 * @returns Lista de recibos con detalles
 */
export async function getApplicantReceipts(aspiranteId: number): Promise<ReciboDto[]> {
  const { data } = await apiClient.get<ReciboDto[]>(`/Aspirante/${aspiranteId}/recibo-inicial`);
  return data;
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

/**
 * Obtiene estadísticas generales de aspirantes
 * @param periodoId Opcional - ID del periodo académico para filtrar
 * @returns Estadísticas completas (totales, por estatus, programa, etc.)
 */
export async function getApplicantStatistics(periodoId?: number): Promise<EstadisticasAspirantesDto> {
  const url = periodoId ? `/Aspirante/estadisticas?periodoId=${periodoId}` : `/Aspirante/estadisticas`;
  const { data } = await apiClient.get<EstadisticasAspirantesDto>(url);
  return data;
}

// ============================================================================
// FICHA DE ADMISIÓN COMPLETA
// ============================================================================

/**
 * Obtiene la ficha de admisión completa del aspirante
 * Incluye: datos personales, académicos, documentos, pagos, seguimiento
 * Útil para generar PDF o vista detallada
 * @param aspiranteId ID del aspirante
 * @returns Ficha completa con toda la información del aspirante
 */
export async function getApplicantAdmissionSheet(aspiranteId: number): Promise<FichaAdmisionDto> {
  const { data } = await apiClient.get<FichaAdmisionDto>(`/Aspirante/${aspiranteId}/ficha-admision`);
  return data;
}

/**
 * Descarga el PDF de la hoja de inscripción del aspirante
 * @param aspiranteId ID del aspirante
 * @param openInNewTab Si es true, abre el PDF en una nueva pestaña; si es false, descarga el archivo
 */
export async function downloadApplicantEnrollmentSheet(aspiranteId: number, openInNewTab: boolean = false): Promise<void> {
  const response = await apiClient.get(`/Aspirante/${aspiranteId}/hoja-inscripcion/pdf`, {
    responseType: "blob",
  });

  // Crear URL del blob
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  if (openInNewTab) {
    // Abrir en nueva pestaña
    window.open(url, "_blank");
  } else {
    // Descargar el archivo
    const link = document.createElement("a");
    link.href = url;

    // Extraer el nombre del archivo del header Content-Disposition si existe
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

  // Liberar la URL del objeto
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// INSCRIPCIÓN COMO ESTUDIANTE (Proceso Atómico)
// ============================================================================

/**
 * Inscribe un aspirante como estudiante de manera completa y atómica
 *
 * Proceso completo:
 * - Valida requisitos previos (documentos, pagos, estatus)
 * - Genera matrícula automáticamente según el programa
 * - Crea registro de estudiante
 * - Crea usuario del sistema con credenciales temporales
 * - Actualiza estatus del aspirante a INSCRITO
 * - Registra en bitácora
 *
 * Todo el proceso se realiza en una transacción (todo o nada)
 *
 * @param aspiranteId ID del aspirante a inscribir
 * @param request Parámetros de inscripción (periodo, forzar, observaciones)
 * @returns Resultado completo con matrícula, credenciales y validaciones
 */
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

// ============================================================================
// CANCELACIÓN DE ASPIRANTE
// ============================================================================

/**
 * Cancela un aspirante (cambia su estatus a cancelado)
 * @param aspiranteId ID del aspirante
 * @param request Motivo de la cancelación (mínimo 10 caracteres)
 */
export async function cancelApplicant(aspiranteId: number, request: CancelarAspiranteRequest): Promise<void> {
  await apiClient.patch(`/Aspirante/${aspiranteId}/cancelar`, request);
}

/**
 * Genera un recibo de inscripción para el aspirante
 * @param aspiranteId ID del aspirante
 * @param monto Monto del recibo
 * @param concepto Concepto del recibo
 * @param diasVencimiento Días de vencimiento
 * @returns Recibo generado con sus detalles
 */
export async function generateApplicantReceipt(
  aspiranteId: number,
  monto: number,
  concepto: string = "Cuota de Inscripción",
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

/**
 * Elimina un recibo (solo si no tiene pagos aplicados)
 * @param idRecibo ID del recibo a eliminar
 */
export async function deleteApplicantReceipt(idRecibo: number): Promise<void> {
  await apiClient.delete(`/Aspirante/recibo/${idRecibo}`);
}

/**
 * Repara recibos sin detalles agregando líneas de detalle genéricas
 * @returns Número de recibos reparados
 */
export async function repairReceiptsWithoutDetails(): Promise<{ reparados: number; mensaje: string }> {
  console.log("🔧 Llamando a /Aspirante/reparar-recibos-sin-detalles...");
  const response = await apiClient.post<any>(`/Aspirante/reparar-recibos-sin-detalles`);
  console.log("📥 Respuesta del backend:", response);
  console.log("📦 Data recibida:", response.data);

  // El backend puede devolver con mayúsculas o minúsculas
  const reparados = response.data?.Reparados ?? response.data?.reparados ?? 0;
  const mensaje = response.data?.Mensaje ?? response.data?.mensaje ?? "Reparación completada";

  console.log(`✅ Reparados: ${reparados}, Mensaje: ${mensaje}`);

  return { reparados, mensaje };
}
