import type {
  AccionPanelResponse,
  ActualizarDatosEstudianteRequest,
  BecaAsignadaDto,
  BuscarEstudiantesPanelRequest,
  BuscarEstudiantesPanelResponse,
  DocumentosDisponiblesDto,
  DocumentosPersonalesEstudianteDto,
  EstadisticasEstudiantesDto,
  EstudiantePanelDto,
  GenerarDocumentoPanelRequest,
  InformacionAcademicaPanelDto,
  ReciboPanelResumenDto,
  ResumenKardexDto,
  ResumenRecibosDto,
  SeguimientoAcademicoDto,
} from '@/types/estudiante-panel';

import apiClient from './api-client';

const BASE_URL = '/estudiante-panel';

export async function obtenerPanelEstudiante(idEstudiante: number): Promise<EstudiantePanelDto> {
  const response = await apiClient.get<EstudiantePanelDto>(`${BASE_URL}/${idEstudiante}`);
  return response.data;
}

export async function obtenerPanelPorMatricula(matricula: string): Promise<EstudiantePanelDto> {
  const response = await apiClient.get<EstudiantePanelDto>(`${BASE_URL}/matricula/${matricula}`);
  return response.data;
}

export async function buscarEstudiantes(
  request: BuscarEstudiantesPanelRequest
): Promise<BuscarEstudiantesPanelResponse> {
  const response = await apiClient.post<BuscarEstudiantesPanelResponse>(
    `${BASE_URL}/buscar`,
    request
  );
  return response.data;
}

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

export async function obtenerInformacionAcademica(
  idEstudiante: number
): Promise<InformacionAcademicaPanelDto> {
  const response = await apiClient.get<InformacionAcademicaPanelDto>(
    `${BASE_URL}/${idEstudiante}/informacion-academica`
  );
  return response.data;
}

export async function obtenerResumenKardex(idEstudiante: number): Promise<ResumenKardexDto> {
  const response = await apiClient.get<ResumenKardexDto>(
    `${BASE_URL}/${idEstudiante}/resumen-kardex`
  );
  return response.data;
}

export async function obtenerSeguimientoAcademico(
  idEstudiante: number
): Promise<SeguimientoAcademicoDto> {
  const response = await apiClient.get<SeguimientoAcademicoDto>(
    `${BASE_URL}/${idEstudiante}/seguimiento-academico`
  );
  return response.data;
}

export async function obtenerBecasEstudiante(
  idEstudiante: number,
  soloActivas: boolean = true
): Promise<BecaAsignadaDto[]> {
  const response = await apiClient.get<BecaAsignadaDto[]>(
    `${BASE_URL}/${idEstudiante}/becas?soloActivas=${soloActivas}`
  );
  return response.data;
}

export async function obtenerResumenRecibos(idEstudiante: number): Promise<ResumenRecibosDto> {
  const response = await apiClient.get<ResumenRecibosDto>(
    `${BASE_URL}/${idEstudiante}/resumen-recibos`
  );
  return response.data;
}

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

export async function obtenerDocumentosDisponibles(
  idEstudiante: number
): Promise<DocumentosDisponiblesDto> {
  const response = await apiClient.get<DocumentosDisponiblesDto>(
    `${BASE_URL}/${idEstudiante}/documentos`
  );
  return response.data;
}

export async function obtenerDocumentosPersonales(
  idEstudiante: number
): Promise<DocumentosPersonalesEstudianteDto> {
  const response = await apiClient.get<DocumentosPersonalesEstudianteDto>(
    `${BASE_URL}/${idEstudiante}/documentos-personales`
  );
  return response.data;
}

export async function subirDocumentoPersonal(
  idEstudiante: number,
  idDocumentoRequisito: number,
  archivo: File,
  notas?: string
): Promise<AccionPanelResponse> {
  const formData = new FormData();
  formData.append('idDocumentoRequisito', idDocumentoRequisito.toString());
  formData.append('archivo', archivo);
  if (notas) formData.append('notas', notas);

  const response = await apiClient.post<AccionPanelResponse>(
    `${BASE_URL}/${idEstudiante}/subir-documento`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function validarDocumentoPersonal(
  idEstudiante: number,
  idAspiranteDocumento: number,
  aprobar: boolean,
  notas?: string
): Promise<AccionPanelResponse> {
  const response = await apiClient.patch<AccionPanelResponse>(
    `${BASE_URL}/${idEstudiante}/documentos/${idAspiranteDocumento}/validar`,
    { aprobar, notas }
  );
  return response.data;
}

export async function generarDocumento(
  request: GenerarDocumentoPanelRequest
): Promise<AccionPanelResponse> {
  const response = await apiClient.post<AccionPanelResponse>(
    `${BASE_URL}/generar-documento`,
    request
  );
  return response.data;
}

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

export async function descargarConstanciaPdf(idEstudiante: number): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/${idEstudiante}/constancia/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function descargarExpedientePdf(idEstudiante: number): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/${idEstudiante}/expediente/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

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

export async function exportarEstudiantesExcel(
  filtros: BuscarEstudiantesPanelRequest
): Promise<Blob> {
  const response = await apiClient.post(`${BASE_URL}/exportar/excel`, filtros, {
    responseType: 'blob',
  });
  return response.data;
}

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

export async function descargarYGuardarKardex(
  idEstudiante: number,
  matricula: string,
  soloPeriodoActual: boolean = false
): Promise<void> {
  const blob = await descargarKardexPdf(idEstudiante, soloPeriodoActual);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Kardex_${matricula}_${fecha}.pdf`);
}

export async function descargarYGuardarConstancia(
  idEstudiante: number,
  matricula: string
): Promise<void> {
  const blob = await descargarConstanciaPdf(idEstudiante);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Constancia_${matricula}_${fecha}.pdf`);
}

export async function descargarYGuardarExpediente(
  idEstudiante: number,
  matricula: string
): Promise<void> {
  const blob = await descargarExpedientePdf(idEstudiante);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Expediente_${matricula}_${fecha}.pdf`);
}

export async function descargarYGuardarBoleta(
  idEstudiante: number,
  matricula: string,
  idPeriodoAcademico?: number
): Promise<void> {
  const blob = await descargarBoletaPdf(idEstudiante, idPeriodoAcademico);
  const fecha = new Date().toISOString().split('T')[0];
  descargarArchivo(blob, `Boleta_${matricula}_${fecha}.pdf`);
}

const estudiantePanelService = {
  obtenerPanelEstudiante,
  obtenerPanelPorMatricula,
  buscarEstudiantes,
  obtenerEstadisticas,
  obtenerInformacionAcademica,
  obtenerResumenKardex,
  obtenerSeguimientoAcademico,
  obtenerBecasEstudiante,
  obtenerResumenRecibos,
  obtenerRecibosEstudiante,
  obtenerDocumentosDisponibles,
  obtenerDocumentosPersonales,
  subirDocumentoPersonal,
  validarDocumentoPersonal,
  generarDocumento,
  descargarKardexPdf,
  descargarConstanciaPdf,
  descargarExpedientePdf,
  descargarBoletaPdf,
  enviarRecordatorioPago,
  actualizarEstatusEstudiante,
  actualizarDatosEstudiante,
  exportarEstudiantesExcel,
  descargarArchivo,
  descargarYGuardarKardex,
  descargarYGuardarConstancia,
  descargarYGuardarExpediente,
  descargarYGuardarBoleta,
};

export default estudiantePanelService;
