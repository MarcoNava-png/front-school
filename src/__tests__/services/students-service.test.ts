import apiClient from '@/services/api-client'
import {
  getStudentsList,
  createStudent,
  getStudentById,
  getStudent,
  enrollStudent,
  getStudentsByGrupo,
} from '@/services/students-service'

jest.mock('@/services/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('Students Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getStudentsList', () => {
    it('debe obtener lista de estudiantes con paginacion por defecto', async () => {
      const mockResponse = {
        data: [
          { idEstudiante: 1, matricula: '2024001', nombreCompleto: 'Juan' },
          { idEstudiante: 2, matricula: '2024002', nombreCompleto: 'Maria' },
        ],
        totalCount: 50,
        page: 1,
        pageSize: 20,
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getStudentsList()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/estudiantes?page=1&pageSize=20')
      expect(result).toEqual(mockResponse)
    })

    it('debe obtener lista de estudiantes con paginacion personalizada', async () => {
      const mockResponse = {
        data: [],
        totalCount: 100,
        page: 3,
        pageSize: 10,
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getStudentsList(3, 10)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/estudiantes?page=3&pageSize=10')
      expect(result.pageNumber).toBe(3)
    })
  })

  describe('createStudent', () => {
    it('debe crear un estudiante correctamente', async () => {
      const mockStudent = {
        idEstudiante: 123,
        matricula: '2024003',
        nombre: 'Pedro',
        apellidoPaterno: 'Garcia',
        email: 'pedro@test.com',
      }
      mockedApiClient.post.mockResolvedValueOnce({ data: mockStudent })

      const payload = {
        nombre: 'Pedro',
        apellidoPaterno: 'Garcia',
        email: 'pedro@test.com',
        idPlanEstudios: 1,
      }

      const result = await createStudent(payload as never)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/estudiantes', payload)
      expect(result.idEstudiante).toBe(123)
    })

    it('debe manejar error al crear estudiante duplicado', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Email ya registrado' } },
      })

      const payload = {
        nombre: 'Test',
        apellidoPaterno: 'User',
        email: 'existente@test.com',
        idPlanEstudios: 1,
      }

      await expect(createStudent(payload as never)).rejects.toEqual({
        response: { status: 400, data: { message: 'Email ya registrado' } },
      })
    })
  })

  describe('getStudentById', () => {
    it('debe obtener un estudiante por ID', async () => {
      const mockStudent = {
        idEstudiante: 1,
        matricula: '2024001',
        nombre: 'Juan',
        apellidoPaterno: 'Perez',
        apellidoMaterno: 'Lopez',
        email: 'juan@test.com',
        activo: true,
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockStudent })

      const result = await getStudentById(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/estudiantes/1')
      expect(result.matricula).toBe('2024001')
    })
  })

  describe('getStudent', () => {
    it('debe obtener datos basicos del estudiante', async () => {
      const mockStudent = {
        idEstudiante: 5,
        matricula: '2024005',
        nombreCompleto: 'Ana',
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockStudent })

      const result = await getStudent(5)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/estudiantes/5')
      expect(result.nombreCompleto).toBe('Ana')
    })
  })

  describe('enrollStudent', () => {
    it('debe matricular un estudiante correctamente', async () => {
      mockedApiClient.put.mockResolvedValueOnce({ data: { success: true } })

      const payload = {
        idEstudiante: 1,
        matricula: '2024-001-A',
      }

      await enrollStudent(payload)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/estudiantes/matricular', payload)
    })
  })

  describe('getStudentsByGrupo', () => {
    it('debe obtener estudiantes de un grupo', async () => {
      const mockEstudiantes = [
        { idEstudiante: 1, matricula: '2024001', nombreCompleto: 'Juan' },
        { idEstudiante: 2, matricula: '2024002', nombreCompleto: 'Maria' },
        { idEstudiante: 3, matricula: '2024003', nombreCompleto: 'Pedro' },
      ]
      mockedApiClient.get.mockResolvedValueOnce({ data: { estudiantes: mockEstudiantes } })

      const result = await getStudentsByGrupo(10)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/grupos/10/estudiantes')
      expect(result).toHaveLength(3)
    })

    it('debe retornar array vacio si el grupo no tiene estudiantes', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: { estudiantes: [] } })

      const result = await getStudentsByGrupo(999)

      expect(result).toEqual([])
    })
  })
})
