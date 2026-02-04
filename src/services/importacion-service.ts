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

  async importarCampus(
    request: ImportarCampusRequest
  ): Promise<ImportarCampusResponse> {
    const response = await axiosInstance.post<ImportarCampusResponse>(
      `${API_URL}/campus`,
      request
    )
    return response.data
  },

  async importarPlanesEstudios(
    request: ImportarPlanesEstudiosRequest
  ): Promise<ImportarPlanesEstudiosResponse> {
    const response = await axiosInstance.post<ImportarPlanesEstudiosResponse>(
      `${API_URL}/planes`,
      request
    )
    return response.data
  },

  async importarMaterias(
    request: ImportarMateriasRequest
  ): Promise<ImportarMateriasResponse> {
    const response = await axiosInstance.post<{ data: ImportarMateriasResponse }>(
      '/importacion/materias',
      request
    )
    return response.data.data
  },

  async getMateriasPorPlan(idPlanEstudios: number): Promise<unknown[]> {
    const response = await axiosInstance.get<{ data: unknown[] }>(
      `/materiaplan/por-plan/${idPlanEstudios}`
    )
    return response.data.data
  },

  async validarMaterias(materias: ImportarMateriaDto[]): Promise<ValidarMateriasResponse> {
    const response = await axiosInstance.post<{ data: ValidarMateriasResponse }>(
      '/importacion/materias/validar',
      { materias }
    )
    return response.data.data
  },

  async descargarPlantillaMaterias(idPlanEstudios?: number): Promise<Blob> {
    const url = idPlanEstudios
      ? `/materiaplan/plantilla?idPlanEstudios=${idPlanEstudios}`
      : '/materiaplan/plantilla'
    const response = await axiosInstance.get(url, {
      responseType: 'blob'
    })
    return response.data
  },
}

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

export interface ImportarMateriaDto {
  clave: string
  nombre: string
  planEstudios: string
  claveCampus: string
  cuatrimestre: string
  creditos?: number
  horasTeoria?: number
  horasPractica?: number
  esOptativa?: string
  tipo?: string
}

export interface ResultadoValidacionMateria {
  fila: number
  clave: string
  nombre: string
  planEstudios: string
  cuatrimestre: number
  exito: boolean
  mensaje: string
  advertencias: string[]
}

export interface ValidarMateriasResponse {
  esValido: boolean
  totalRegistros: number
  registrosValidos: number
  registrosConErrores: number
  planesEncontrados: string[]
  planesNoEncontrados: string[]
  clavesDuplicadas: string[]
  detalleValidacion: ResultadoValidacionMateria[]
}

export interface MateriaImportItem {
  clave: string
  nombre: string
  creditos: number
  horasTeoria?: number
  horasPractica?: number
  grado: string
  esOptativa?: boolean
  campus?: string
  curso?: string
}

export interface ImportarMateriasRequest {
  idPlanEstudios?: number
  clavePlanEstudios?: string
  materias: MateriaImportItem[] | ImportarMateriaDto[]
  actualizarExistentes?: boolean
  crearRelacionSiExiste?: boolean
}

export interface ImportarMateriaResultItem {
  clave: string
  nombre: string
  cuatrimestre: number
  estado: string
  mensajeError?: string
  idMateria?: number
  idMateriaPlan?: number
}

export interface ImportarMateriasResultado {
  fila: number
  clave: string
  nombre: string
  planEstudios: string
  cuatrimestre: number
  exito: boolean
  mensaje: string
  advertencias: string[]
}

export interface ImportarMateriasResponse {
  exito: boolean
  mensaje: string
  idPlanEstudios?: number
  clavePlanEstudios?: string
  nombrePlanEstudios?: string
  totalProcesadas: number
  totalProcesados: number
  materiasCreadas: number
  materiasActualizadas: number
  materiasExistentes: number
  asignacionesCreadas: number
  relacionesCreadas: number
  asignacionesExistentes: number
  errores: number
  fallidos: number
  detalle: ImportarMateriaResultItem[]
  resultados: ImportarMateriasResultado[]
}

export default importacionService
