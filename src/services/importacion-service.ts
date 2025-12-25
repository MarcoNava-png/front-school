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
}

export default importacionService
