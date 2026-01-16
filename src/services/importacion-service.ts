import axiosInstance from './api-client'

export interface ImportarEstudianteDto {
  ciclo?: string
  campus: string
  curso: string
  periodo?: string
  grupo?: string
  matricula: string
  apellidoPaterno: string
  apellidoMaterno?: string
  nombre: string
  curp?: string
  formaPago?: string
  telefono?: string
  email?: string
  fechaNacimiento?: string
  fechaInscripcion?: string
  domicilio?: string
  colonia?: string
  celular?: string
  genero?: string
}

export interface ImportarEstudiantesRequest {
  estudiantes: ImportarEstudianteDto[]
  crearCatalogosInexistentes: boolean
  actualizarExistentes: boolean
  inscribirAGrupo: boolean
}

export interface ResultadoImportacion {
  fila: number
  matricula: string
  nombreCompleto: string
  exito: boolean
  mensaje: string
  idEstudiante?: number
  advertencias: string[]
}

export interface ImportarEstudiantesResponse {
  totalProcesados: number
  exitosos: number
  fallidos: number
  actualizados: number
  resultados: ResultadoImportacion[]
  errores: string[]
}

export interface ValidarImportacionResponse {
  esValido: boolean
  totalRegistros: number
  registrosValidos: number
  registrosConErrores: number
  campusEncontrados: string[]
  campusNoEncontrados: string[]
  cursosEncontrados: string[]
  cursosNoEncontrados: string[]
  matriculasDuplicadas: string[]
  detalleValidacion: ResultadoImportacion[]
}

const API_URL = '/importacion'

export const importacionService = {
  async getCampusDisponibles(): Promise<string[]> {
    const response = await axiosInstance.get<string[]>(`${API_URL}/campus`)
    return response.data
  },

  async getPlanesDisponibles(): Promise<string[]> {
    const response = await axiosInstance.get<string[]>(`${API_URL}/planes`)
    return response.data
  },

  async validarImportacion(
    estudiantes: ImportarEstudianteDto[]
  ): Promise<ValidarImportacionResponse> {
    const response = await axiosInstance.post<ValidarImportacionResponse>(
      `${API_URL}/estudiantes/validar`,
      { estudiantes }
    )
    return response.data
  },

  async importarEstudiantes(
    request: ImportarEstudiantesRequest
  ): Promise<ImportarEstudiantesResponse> {
    const response = await axiosInstance.post<ImportarEstudiantesResponse>(
      `${API_URL}/estudiantes`,
      request
    )
    return response.data
  },

  // ========================================
  // Importación de Campus
  // ========================================

  async importarCampus(
    request: ImportarCampusRequest
  ): Promise<ImportarCampusResponse> {
    const response = await axiosInstance.post<ImportarCampusResponse>(
      `${API_URL}/campus`,
      request
    )
    return response.data
  },

  // ========================================
  // Importación de Planes de Estudio
  // ========================================

  async importarPlanesEstudios(
    request: ImportarPlanesEstudiosRequest
  ): Promise<ImportarPlanesEstudiosResponse> {
    const response = await axiosInstance.post<ImportarPlanesEstudiosResponse>(
      `${API_URL}/planes`,
      request
    )
    return response.data
  },
}

// ========================================
// Interfaces para Campus
// ========================================

export interface ImportarCampusDto {
  claveCampus: string
  nombre: string
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  codigoPostal?: string
  colonia?: string
  telefono?: string
}

export interface ImportarCampusRequest {
  campus: ImportarCampusDto[]
  actualizarExistentes: boolean
}

export interface ResultadoImportacionCampus {
  fila: number
  claveCampus: string
  nombre: string
  exito: boolean
  mensaje: string
  idCampus?: number
  advertencias: string[]
}

export interface ImportarCampusResponse {
  totalProcesados: number
  exitosos: number
  fallidos: number
  actualizados: number
  resultados: ResultadoImportacionCampus[]
}

// ========================================
// Interfaces para Planes de Estudio
// ========================================

export interface ImportarPlanEstudiosDto {
  clavePlanEstudios: string
  nombrePlanEstudios: string
  claveCampus: string
  nivelEducativo?: string
  periodicidad?: string
  duracionMeses?: number
  rvoe?: string
  version?: string
}

export interface ImportarPlanesEstudiosRequest {
  planes: ImportarPlanEstudiosDto[]
  actualizarExistentes: boolean
}

export interface ResultadoImportacionPlanEstudios {
  fila: number
  clavePlanEstudios: string
  nombrePlanEstudios: string
  exito: boolean
  mensaje: string
  idPlanEstudios?: number
  advertencias: string[]
}

export interface ImportarPlanesEstudiosResponse {
  totalProcesados: number
  exitosos: number
  fallidos: number
  actualizados: number
  resultados: ResultadoImportacionPlanEstudios[]
}

export default importacionService
