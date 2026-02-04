'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Search,
  Upload,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getStudyPlans,
  getAcademicPeriods,
} from '@/services/catalogs-service'
import {
  getGroups,
  importarEstudiantesCompleto,
  getEstudiantesDelGrupoDirecto,
  type ImportarEstudiantesGrupoResponse,
  type EstudiantesDelGrupoResponse,
  type EstudianteImportar,
} from '@/services/groups-service'
import type { StudyPlan, AcademicPeriod } from '@/types/catalog'

interface EstudianteParaInscribir extends EstudianteImportar {
  seleccionado: boolean
  fila: number
}

type Step = 'select-group' | 'load-students' | 'confirm' | 'results'

const PLANTILLA_COLUMNAS = [
  'Nombre',
  'ApellidoPaterno',
  'ApellidoMaterno',
  'Genero',
  'CURP',
  'Correo',
  'Telefono',
  'Celular',
  'FechaNacimiento',
  'Matricula',
]

const mapearGenero = (generoTexto: string): number | undefined => {
  if (!generoTexto) return undefined
  const texto = generoTexto.toLowerCase().trim()
  if (['m', 'masculino', 'hombre', 'h', 'male', '1'].includes(texto)) return 1
  if (['f', 'femenino', 'mujer', 'female', '2'].includes(texto)) return 2
  return undefined
}

export default function InscribirEstudiantesGrupoPage() {
  const [step, setStep] = useState<Step>('select-group')
  const [loading, setLoading] = useState(false)

  const [planes, setPlanes] = useState<StudyPlan[]>([])
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([])
  const [grupos, setGrupos] = useState<{ idGrupo: number; nombreGrupo: string; codigoGrupo?: string }[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('')
  const [selectedGrupo, setSelectedGrupo] = useState<string>('')
  const [grupoInfo, setGrupoInfo] = useState<EstudiantesDelGrupoResponse | null>(null)

  const [estudiantes, setEstudiantes] = useState<EstudianteParaInscribir[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [resultado, setResultado] = useState<ImportarEstudiantesGrupoResponse | null>(null)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [planesData, periodosData] = await Promise.all([
          getStudyPlans(),
          getAcademicPeriods(),
        ])
        setPlanes(planesData)
        setPeriodos(periodosData)
      } catch (error) {
        console.error('Error cargando datos iniciales:', error)
        toast.error('Error al cargar planes y periodos')
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    const loadGrupos = async () => {
      if (!selectedPlan || !selectedPeriodo) {
        setGrupos([])
        return
      }

      try {
        const response = await getGroups(1, 1000, parseInt(selectedPeriodo))
        const gruposFiltrados = response.items.filter(
          (g) => g.idPlanEstudios === parseInt(selectedPlan)
        )
        setGrupos(gruposFiltrados.map(g => ({
          idGrupo: g.idGrupo,
          nombreGrupo: g.nombreGrupo,
          codigoGrupo: g.codigoGrupo
        })))
      } catch (error) {
        console.error('Error cargando grupos:', error)
      }
    }
    loadGrupos()
  }, [selectedPlan, selectedPeriodo])

  useEffect(() => {
    const loadGrupoInfo = async () => {
      if (!selectedGrupo) {
        setGrupoInfo(null)
        return
      }

      try {
        const info = await getEstudiantesDelGrupoDirecto(parseInt(selectedGrupo))
        setGrupoInfo(info)
      } catch (error) {
        console.error('Error cargando info del grupo:', error)
        const grupoSeleccionado = grupos.find(g => g.idGrupo === parseInt(selectedGrupo))
        if (grupoSeleccionado) {
          setGrupoInfo({
            idGrupo: grupoSeleccionado.idGrupo,
            nombreGrupo: grupoSeleccionado.nombreGrupo,
            codigoGrupo: grupoSeleccionado.codigoGrupo,
            planEstudios: planes.find(p => p.idPlanEstudios === parseInt(selectedPlan))?.nombrePlanEstudios || '',
            periodoAcademico: periodos.find(p => p.idPeriodoAcademico === parseInt(selectedPeriodo))?.nombre || '',
            numeroCuatrimestre: 1,
            totalEstudiantes: 0,
            capacidadMaxima: 40,
            cupoDisponible: 40,
            estudiantes: []
          })
        }
      }
    }
    loadGrupoInfo()
  }, [selectedGrupo, grupos, planes, periodos, selectedPlan, selectedPeriodo])

  const handleDownloadTemplate = () => {
    const wsData = XLSX.utils.aoa_to_sheet([
      PLANTILLA_COLUMNAS,
      ['Juan', 'Pérez', 'López', 'M', 'PELJ900101HDFRPN01', 'juan.perez@email.com', '5551234567', '5559876543', '1990-01-15', ''],
      ['María', 'García', 'Ruiz', 'F', 'GARM850220MDFRRC02', 'maria.garcia@email.com', '', '5558765432', '1985-02-20', ''],
    ])

    wsData['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsData, 'Estudiantes')
    XLSX.writeFile(wb, 'plantilla_importar_estudiantes.xlsx')
    toast.success('Plantilla descargada')
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [])

  const processFile = async (selectedFile: File) => {
    setLoading(true)

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

      if (jsonData.length === 0) {
        toast.error('El archivo no contiene datos')
        return
      }

      const mapped: EstudianteParaInscribir[] = []
      let fila = 1

      for (const row of jsonData) {
        const keys = Object.keys(row)

        const getValue = (possibleNames: string[]): string => {
          for (const name of possibleNames) {
            const key = keys.find(k => k.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase().replace(/[_\s]/g, ''))
            if (key && row[key] !== undefined && row[key] !== null) {
              return String(row[key]).trim()
            }
          }
          return ''
        }

        const nombre = getValue(['nombre', 'nombres', 'name'])
        const apellidoPaterno = getValue(['apellidopaterno', 'paterno', 'apellido_paterno', 'apellido1'])
        const apellidoMaterno = getValue(['apellidomaterno', 'materno', 'apellido_materno', 'apellido2'])
        const generoTexto = getValue(['genero', 'sexo', 'gender', 'sex'])
        const curp = getValue(['curp'])
        const correo = getValue(['correo', 'email', 'correoelectronico', 'mail'])
        const telefono = getValue(['telefono', 'tel', 'phone'])
        const celular = getValue(['celular', 'movil', 'cel', 'mobile'])
        const fechaNacimiento = getValue(['fechanacimiento', 'fecha_nacimiento', 'nacimiento', 'birthdate'])
        const matricula = getValue(['matricula', 'matricula', 'enrollment'])

        const idGenero = mapearGenero(generoTexto)

        if (!nombre || !apellidoPaterno) {
          console.warn(`Fila ${fila + 1} ignorada: falta nombre o apellido paterno`)
          fila++
          continue
        }

        mapped.push({
          fila: fila++,
          nombre,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || undefined,
          idGenero,
          curp: curp || undefined,
          correo: correo || undefined,
          telefono: telefono || undefined,
          celular: celular || undefined,
          fechaNacimiento: fechaNacimiento || undefined,
          matricula: matricula || undefined,
          seleccionado: true,
        })
      }

      if (mapped.length === 0) {
        toast.error('No se encontraron estudiantes válidos. Verifica que tengas las columnas Nombre y ApellidoPaterno.')
        return
      }

      setEstudiantes(mapped)
      toast.success(`Se cargaron ${mapped.length} estudiantes`)
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      toast.error('Error al procesar el archivo Excel')
    } finally {
      setLoading(false)
    }
  }

  const toggleSeleccion = (index: number) => {
    setEstudiantes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], seleccionado: !updated[index].seleccionado }
      return updated
    })
  }

  const toggleTodos = (seleccionar: boolean) => {
    setEstudiantes(prev => prev.map(e => ({ ...e, seleccionado: seleccionar })))
  }

  const handleImportar = async () => {
    const seleccionados = estudiantes.filter(e => e.seleccionado)

    if (seleccionados.length === 0) {
      toast.error('Selecciona al menos un estudiante')
      return
    }

    setLoading(true)

    try {
      const estudiantesParaImportar: EstudianteImportar[] = seleccionados.map(e => ({
        nombre: e.nombre,
        apellidoPaterno: e.apellidoPaterno,
        apellidoMaterno: e.apellidoMaterno,
        idGenero: e.idGenero,
        curp: e.curp,
        correo: e.correo,
        telefono: e.telefono,
        celular: e.celular,
        fechaNacimiento: e.fechaNacimiento,
        matricula: e.matricula,
      }))

      const result = await importarEstudiantesCompleto(
        parseInt(selectedGrupo),
        estudiantesParaImportar,
        'Importación masiva desde Excel'
      )

      setResultado(result)
      setStep('results')

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.exitosos} estudiantes exitosamente`)
      } else {
        toast.warning(
          `Importación completada: ${result.exitosos} exitosos, ${result.fallidos} fallidos`
        )
      }
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar los estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('select-group')
    setEstudiantes([])
    setResultado(null)
    setSelectedGrupo('')
  }

  const estudiantesFiltrados = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.curp && e.curp.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.correo && e.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const seleccionadosCount = estudiantes.filter(e => e.seleccionado).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div
              className="rounded-lg p-2"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <UserPlus className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Importar Estudiantes a Grupo
          </h1>
          <p className="mt-1 text-muted-foreground">
            Importa estudiantes nuevos desde Excel: crea persona, estudiante y los inscribe al grupo
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        {['select-group', 'load-students', 'confirm', 'results'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                ['select-group', 'load-students', 'confirm', 'results'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : step !== s
                    ? 'bg-muted text-muted-foreground'
                    : ''
              }`}
              style={step === s ? { background: 'linear-gradient(to right, #14356F, #1e4a8f)', color: 'white' } : undefined}
            >
              {['select-group', 'load-students', 'confirm', 'results'].indexOf(step) > i ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && <div className="mx-2 h-0.5 w-12 bg-muted" />}
          </div>
        ))}
      </div>
      {step === 'select-group' && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Seleccionar Grupo</CardTitle>
            <CardDescription>
              Selecciona el grupo donde inscribirás a los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Plan de Estudios</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((plan) => (
                      <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                        {plan.nombrePlanEstudios}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Periodo Académico</Label>
                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.idPeriodoAcademico} value={periodo.idPeriodoAcademico.toString()}>
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={!selectedPlan || !selectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder={grupos.length === 0 ? 'No hay grupos' : 'Selecciona un grupo'} />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.idGrupo} value={grupo.idGrupo.toString()}>
                        {grupo.nombreGrupo} {grupo.codigoGrupo && `(${grupo.codigoGrupo})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {grupoInfo && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Users className="h-4 w-4" />
                <AlertTitle>Información del Grupo</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 grid gap-2 md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Grupo:</span>{' '}
                      <strong>{grupoInfo.nombreGrupo}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Plan:</span>{' '}
                      <strong>{grupoInfo.planEstudios}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inscritos:</span>{' '}
                      <strong>{grupoInfo.totalEstudiantes}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cupo disponible:</span>{' '}
                      <strong>{grupoInfo.cupoDisponible}</strong>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep('load-students')} disabled={!selectedGrupo}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {step === 'load-students' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paso 2: Cargar Estudiantes</CardTitle>
                <CardDescription>
                  Carga un archivo Excel con los datos de los estudiantes a importar
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Columnas del Excel</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="default">Nombre *</Badge>
                  <Badge variant="default">ApellidoPaterno *</Badge>
                  <Badge variant="secondary">ApellidoMaterno</Badge>
                  <Badge variant="secondary">Genero (M/F)</Badge>
                  <Badge variant="secondary">CURP</Badge>
                  <Badge variant="secondary">Correo</Badge>
                  <Badge variant="secondary">Telefono</Badge>
                  <Badge variant="secondary">Celular</Badge>
                  <Badge variant="secondary">FechaNacimiento</Badge>
                  <Badge variant="secondary">Matricula</Badge>
                </div>
                <p className="mt-2 text-xs">* Campos requeridos. Género: M=Masculino, F=Femenino. La matrícula se genera automáticamente si no se proporciona.</p>
              </AlertDescription>
            </Alert>

            {estudiantes.length === 0 ? (
              <div
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 transition-colors hover:border-primary/50 hover:bg-muted/20"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {loading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <>
                    <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium">Arrastra tu archivo Excel aquí</p>
                    <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{estudiantes.length} estudiantes cargados</Badge>
                    <Badge variant="outline">{seleccionadosCount} seleccionados</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleTodos(true)}>
                      Seleccionar todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleTodos(false)}>
                      Deseleccionar todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEstudiantes([])}>
                      <X className="mr-1 h-4 w-4" />
                      Limpiar
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, CURP o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-[400px] overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Apellidos</TableHead>
                        <TableHead>CURP</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Teléfono</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estudiantesFiltrados.map((est, i) => (
                        <TableRow key={i} className={est.seleccionado ? 'bg-primary/5' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={est.seleccionado}
                              onCheckedChange={() => toggleSeleccion(estudiantes.indexOf(est))}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{est.nombre}</TableCell>
                          <TableCell>{est.apellidoPaterno} {est.apellidoMaterno}</TableCell>
                          <TableCell className="font-mono text-xs">{est.curp || '-'}</TableCell>
                          <TableCell className="text-xs">{est.correo || '-'}</TableCell>
                          <TableCell className="text-xs">{est.celular || est.telefono || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('select-group')}>
                Volver
              </Button>
              <Button onClick={() => setStep('confirm')} disabled={seleccionadosCount === 0}>
                Continuar ({seleccionadosCount} seleccionados)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && grupoInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paso 3: Confirmar Importación</CardTitle>
              <CardDescription>
                Revisa los datos antes de importar. Se crearán las personas, estudiantes y se inscribirán al grupo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardHeader className="pb-2">
                    <CardDescription>Grupo destino</CardDescription>
                    <CardTitle>{grupoInfo.nombreGrupo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{grupoInfo.planEstudios}</p>
                    <p className="text-sm text-muted-foreground">{grupoInfo.periodoAcademico}</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardHeader className="pb-2">
                    <CardDescription>Estudiantes a importar</CardDescription>
                    <CardTitle className="text-green-600">{seleccionadosCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Se generarán matrículas automáticamente
                    </p>
                  </CardContent>
                </Card>
              </div>

              {seleccionadosCount > grupoInfo.cupoDisponible && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>
                    El número de estudiantes ({seleccionadosCount}) excede el cupo disponible ({grupoInfo.cupoDisponible}).
                    Algunos estudiantes podrían no inscribirse.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Lo que se creará</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-inside list-disc text-sm">
                    <li>Registros de <strong>Persona</strong> (datos personales)</li>
                    <li>Registros de <strong>Estudiante</strong> (con matrícula generada automáticamente)</li>
                    <li>Inscripciones al <strong>Grupo</strong> seleccionado</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('load-students')}>
                  Volver
                </Button>
                <Button onClick={handleImportar} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Importar {seleccionadosCount} Estudiantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'results' && resultado && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Grupo</CardDescription>
                <CardTitle className="text-lg">{resultado.nombreGrupo}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Procesados</CardDescription>
                <CardTitle>{resultado.totalProcesados}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardDescription>Exitosos</CardDescription>
                <CardTitle className="text-green-600">{resultado.exitosos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader className="pb-2">
                <CardDescription>Fallidos</CardDescription>
                <CardTitle className="text-red-600">{resultado.fallidos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardHeader className="pb-2">
                <CardDescription>Matrículas generadas</CardDescription>
                <CardTitle className="text-blue-600">{resultado.estudiantesCreados}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          {resultado.fallidos === 0 ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Importación Exitosa</AlertTitle>
              <AlertDescription>
                Todos los estudiantes fueron importados e inscritos correctamente.
                Se crearon {resultado.personasCreadas} personas, {resultado.estudiantesCreados} estudiantes y {resultado.inscripcionesCreadas} inscripciones.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Importación con Errores</AlertTitle>
              <AlertDescription>
                Algunos estudiantes no pudieron ser importados. Revisa el detalle abajo.
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Importación</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={resultado.fallidos > 0 ? 'errores' : 'todos'}>
                <TabsList>
                  <TabsTrigger value="errores">
                    Con Errores ({resultado.fallidos})
                  </TabsTrigger>
                  <TabsTrigger value="exitosos">
                    Exitosos ({resultado.exitosos})
                  </TabsTrigger>
                  <TabsTrigger value="todos">
                    Todos ({resultado.totalProcesados})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="errores">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>CURP</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.resultados
                          .filter((r) => !r.exitoso)
                          .map((res, i) => (
                            <TableRow key={i}>
                              <TableCell>{res.fila}</TableCell>
                              <TableCell>{res.nombreCompleto}</TableCell>
                              <TableCell className="font-mono text-xs">{res.curp || '-'}</TableCell>
                              <TableCell className="text-red-600">{res.mensajeError}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="exitosos">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.resultados
                          .filter((r) => r.exitoso)
                          .map((res, i) => (
                            <TableRow key={i}>
                              <TableCell>{res.fila}</TableCell>
                              <TableCell>{res.nombreCompleto}</TableCell>
                              <TableCell className="font-mono font-medium text-blue-600">
                                {res.matriculaGenerada || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">
                                  <Check className="mr-1 h-3 w-3" />
                                  Importado
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="todos">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.resultados.map((res, i) => (
                          <TableRow key={i}>
                            <TableCell>{res.fila}</TableCell>
                            <TableCell>{res.nombreCompleto}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {res.matriculaGenerada || '-'}
                            </TableCell>
                            <TableCell>
                              {res.exitoso ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Check className="mr-1 h-3 w-3" />
                                  Importado
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <X className="mr-1 h-3 w-3" />
                                  Error
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleReset}>
              <UserPlus className="mr-2 h-4 w-4" />
              Nueva Importación
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
