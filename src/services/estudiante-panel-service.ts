// ============================================
// Servicio para el Panel de Gestión de Estudiantes
// ============================================

import apiClient from './api-client';
import type {
  EstudiantePanelDto,
  BuscarEstudiantesPanelRequest,
  BuscarEstudiantesPanelResponse,
  EstadisticasEstudiantesDto,
  InformacionAcademicaPanelDto,
  ResumenKardexDto,
  BecaAsignadaDto,
  ResumenRecibosDto,
  ReciboPanelResumenDto,
  DocumentosDisponiblesDto,
  DocumentosPersonalesEstudianteDto,
  GenerarDocumentoPanelRequest,
  AccionPanelResponse,
  ActualizarDatosEstudianteRequest,
  SeguimientoAcademicoDto,
} from '@/types/estudiante-panel';

const BASE_URL = '/estudiante-panel';

// ============================================
// Consultas de Panel
// ============================================

/**
 * Obtiene el panel completo de un estudiante por ID
 */
export async function obtenerPanelEstudiante(idEstudiante: number): Promise<EstudiantePanelDto> {
  const response = await apiClient.get<EstudiantePanelDto>(`${BASE_URL}/${idEstudiante}`);
  return response.data;
}

/**
 * Obtiene el panel de un estudiante por matrícula
 */
export async function obtenerPanelPorMatricula(matricula: string): Promise<EstudiantePanelDto> {
  const response = await apiClient.get<EstudiantePanelDto>(`${BASE_URL}/matricula/${matricula}`);
  return response.data;
}

/**
 * Busca estudiantes con filtros avanzados
 */
export async function buscarEstudiantes(
  request: BuscarEstudiantesPanelRequest
): Promise<BuscarEstudiantesPanelResponse> {
  const response = await apiClient.post<BuscarEstudiantesPanelResponse>(
    `${BASE_URL}/buscar`,
    request
  );
  return response.data;
}

/**
 * Obtiene estadísticas generales de estudiantes
 */
export async function obtenerEstadisticas(
  idPlanEstudios?: number,
  idPeriodoAcademico?: number
): Promise<EstadisticasEstudiantesDto> {
  const params = new URLSearchParams();
  if (idPlanEstudios) params.append('idPlanEstudios', idPlanEstudios.toString());
  if (idPeriodoAcademico) params.append('idPeriodoAcademico', idPeriodoAcademico.toString());

  const response = await apiClient.get<EstadisticasEstudiantesDto>(
    `${BASE_URL}/estadisticas?${params.toString()}`
  );
  return response.data;
}

// ============================================
// Información Académica
// ============================================

/**
 * Obtiene la información académica detallada
 */
export async function obtenerInformacionAcademica(
  idEstudiante: number
): Promise<InformacionAcademicaPanelDto> {
  const response = await apiClient.get<InformacionAcademicaPanelDto>(
    `${BASE_URL}/${idEstudiante}/informacion-academica`
  );
  return response.data;
}

/**
 * Obtiene el resumen del kardex
 */
export async function obtenerResumenKardex(idEstudiante: number): Promise<ResumenKardexDto> {
  const response = await apiClient.get<ResumenKardexDto>(
    `${BASE_URL}/${idEstudiante}/resumen-kardex`
  );
  return response.data;
}

/**
 * Obtiene el seguimiento académico detallado (por período)
 */
export async function obtenerSeguimientoAcademico(
  idEstudiante: number
): Promise<SeguimientoAcademicoDto> {
  const response = await apiClient.get<SeguimientoAcademicoDto>(
    `${BASE_URL}/${idEstudiante}/seguimiento-academico`
  );
  return response.data;
}

// ============================================
// Becas
// ============================================

/**
 * Obtiene las becas asignadas a un estudiante
 */
export async function obtenerBecasEstudiante(
  idEstudiante: number,
  soloActivas: boolean = true
): Promise<BecaAsignadaDto[]> {
  const response = await apiClient.get<BecaAsignadaDto[]>(
    `${BASE_URL}/${idEstudiante}/becas?soloActivas=${soloActivas}`
  );
  return response.data;
}

// ============================================
// Recibos y Pagos
// ============================================

/**
 * Obtiene el resumen de recibos
 */
export async function obtenerResumenRecibos(idEstudiante: number): Promise<ResumenRecibosDto> {
  const response = await apiClient.get<ResumenRecibosDto>(
    `${BASE_URL}/${idEstudiante}/resumen-recibos`
  );
  return response.data;
}

/**
 * Obtiene los recibos de un estudiante
 */
export async function obtenerRecibosEstudiante(
  idEstudiante: number,
  estatus?: string,
  limite: number = 50
): Promise<ReciboPanelResumenDto[]> {
  const params = new URLSearchParams();
  if (estatus) params.append('estatus', estatus);
  params.append('limite', limite.toString());

  const response = await apiClient.get<ReciboPanelResumenDto[]>(
    `${BASE_URL}/${idEstudiante}/recibos?${params.toString()}`
  );
  return response.data;
}

// ============================================
// Documentos
// ============================================

/**
 * Obtiene los documentos disponibles para un estudiante
 */
export async function obtenerDocumentosDisponibles(
  idEstudiante: number
): Promise<DocumentosDisponiblesDto> {
  const response = await apiClient.get<DocumentosDisponiblesDto>(
    `${BASE_URL}/${idEstudiante}/documentos`
  );
  return response.data;
}

/**
 * Obtiene los documentos personales del estudiante (subidos cuando era aspirante)
 */
export async function obtenerDocumentosPersonales(
  idEstudiante: number
): Promise<DocumentosPersonalesEstudianteDto> {
  const response = await apiClient.get<DocumentosPersonalesEstudianteDto>(
    `${BASE_URL}/${idEstudiante}/documentos-personales`
  );
  return response.data;
}

/**
 * Genera una solicitud de documento
 */
export async function generarDocumento(
  request: GenerarDocumentoPanelRequest
): Promise<AccionPanelResponse> {
  const response = await apiClient.post<AccionPanelResponse>(
    `${BASE_URL}/generar-documento`,
    request
  );
  return response.data;
}

/**
 * Descarga el Kardex en PDF
 */
export async function descargarKardexPdf(
  idEstudiante: number,
  soloPeriodoActual: boolean = false
): Promise<Blob> {
  const response = await apiClient.get(
    `${BASE_URL}/${idEstudiante}/kardex/pdf?soloPeriodoActual=${soloPeriodoActual}`,
    { responseType: 'blob' }
  );
  return response.data;
}

/**
 * Descarga la Constancia de Estudios en PDF
 */
export async function descargarConstanciaPdf(idEstudiante: number): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/${idEstudiante}/constancia/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Descarga el Expediente completo en PDF
 */
export async function descargarExpedientePdf(idEstudiante: number): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/${idEstudiante}/expediente/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Descarga la Boleta de Calificaciones en PDF
 */
export async function descargarBoletaPdf(
  idEstudiante: number,
  idPeriodoAcademico?: number
): Promise<Blob> {
  const params = idPeriodoAcademico ? `?idPeriodoAcademico=${idPeriodoAcademico}` : '';
  const response = await apiClient.get(`${BASE_URL}/${idEstudiante}/boleta/pdf${params}`, {
    responseType: 'blob',
  });
  return response.data;
}

// ============================================
// Acciones Rápidas
// ============================================

/**
 * Envía recordatorio de pago por email
 */
export async function enviarRecordatorioPago(
  idEstudiante: number,
  idRecibo?: number
): Promise<AccionPanelResponse> {
  const params = idRecibo ? `?idRecibo=${idRecibo}` : '';
  const response = await apiClient.post<AccionPanelResponse>(
    `${BASE_URL}/${idEstudiante}/enviar-recordatorio${params}`
  );
  return response.data;
}

/**
 * Actualiza el estatus del estudiante (activo/inactivo)
 */
export async function actualizarEstatusEstudiante(
  idEstudiante: number,
  activo: boolean,
  motivo?: string
): Promise<AccionPanelResponse> {
  const params = new URLSearchParams();
  params.append('activo', activo.toString());
  if (motivo) params.append('motivo', motivo);

  const response = await apiClient.patch<AccionPanelResponse>(
    `${BASE_URL}/${idEstudiante}/estatus?${params.toString()}`
  );
  return response.data;
}

/**
 * Actualiza los datos personales del estudiante
 */
export async function actualizarDatosEstudiante(
  idEstudiante: number,
  datos: ActualizarDatosEstudianteRequest
): Promise<AccionPanelResponse> {
  const response = await apiClient.put<AccionPanelResponse>(
    `${BASE_URL}/${idEstudiante}/datos`,
    datos
  );
  return response.data;
}

// ============================================
// Exportación
// ============================================

/**
 * Exporta lista de estudiantes a Excel
 */
export async function exportarEstudiantesExcel(
  filtros: BuscarEstudiantesPanelRequest
): Promise<Blob> {
  const response = await apiClient.post(`${BASE_URL}/exportar/excel`, filtros, {
    responseType: 'blob',
  });
  return response.data;
}

// ============================================
// Utilidades
// ============================================

/**
 * Helper para descargar archivos blob
 */
export function descargarArchivo(blob: Blob, nombreArchivo: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Descarga y guarda el Kardex PDF
 */
export async function descargarYGuardarKardex(
  idEstudiante: number,
  matricula: string,
  soloPeriodoActual: boolean = false
): Promise<void> {
  const blob = await descargarKardexPdf(idEstudiante, soloPeriodoActual);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Kardex_${matricula}_${fecha}.pdf`);
}

/**
 * Descarga y guarda la Constancia PDF
 */
export async function descargarYGuardarConstancia(
  idEstudiante: number,
  matricula: string
): Promise<void> {
  const blob = await descargarConstanciaPdf(idEstudiante);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Constancia_${matricula}_${fecha}.pdf`);
}

/**
 * Descarga y guarda el Expediente PDF
 */
export async function descargarYGuardarExpediente(
  idEstudiante: number,
  matricula: string
): Promise<void> {
  const blob = await descargarExpedientePdf(idEstudiante);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Expediente_${matricula}_${fecha}.pdf`);
}

/**
 * Descarga y guarda la Boleta PDF
 */
export async function descargarYGuardarBoleta(
  idEstudiante: number,
  matricula: string,
  idPeriodoAcademico?: number
): Promise<void> {
  const blob = await descargarBoletaPdf(idEstudiante, idPeriodoAcademico);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Boleta_${matricula}_${fecha}.pdf`);
}

// Export default con todos los métodos
const estudiantePanelService = {
  // Consultas
  obtenerPanelEstudiante,
  obtenerPanelPorMatricula,
  buscarEstudiantes,
  obtenerEstadisticas,
  // Información académica
  obtenerInformacionAcademica,
  obtenerResumenKardex,
  obtenerSeguimientoAcademico,
  // Becas
  obtenerBecasEstudiante,
  // Recibos
  obtenerResumenRecibos,
  obtenerRecibosEstudiante,
  // Documentos
  obtenerDocumentosDisponibles,
  obtenerDocumentosPersonales,
  generarDocumento,
  descargarKardexPdf,
  descargarConstanciaPdf,
  descargarExpedientePdf,
  descargarBoletaPdf,
  // Acciones
  enviarRecordatorioPago,
  actualizarEstatusEstudiante,
  actualizarDatosEstudiante,
  // Exportación
  exportarEstudiantesExcel,
  // Utilidades
  descargarArchivo,
  descargarYGuardarKardex,
  descargarYGuardarConstancia,
  descargarYGuardarExpediente,
  descargarYGuardarBoleta,
};

export default estudiantePanelService;
