'use client'

import { useCallback, useState } from 'react'

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
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
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import importacionService, {
  type ImportarEstudianteDto,
  type ImportarEstudiantesResponse,
  type ValidarImportacionResponse,
} from '@/services/importacion-service'

const COLUMN_MAPPING: Record<string, keyof ImportarEstudianteDto> = {
  ciclo: 'ciclo',
  escuela: 'campus',
  campus: 'campus',
  curso: 'curso',
  carrera: 'curso',
  periodo: 'periodo',
  grupo: 'grupo',
  matricula: 'matricula',
  matrícula: 'matricula',
  paterno: 'apellidoPaterno',
  'apellido paterno': 'apellidoPaterno',
  materno: 'apellidoMaterno',
  'apellido materno': 'apellidoMaterno',
  nombre: 'nombre',
  nombres: 'nombre',
  curp: 'curp',
  'forma pago': 'formaPago',
  formapago: 'formaPago',
  telefono: 'telefono',
  teléfono: 'telefono',
  email: 'email',
  correo: 'email',
  'f.nacimiento': 'fechaNacimiento',
  fechanacimiento: 'fechaNacimiento',
  'fecha nacimiento': 'fechaNacimiento',
  'f.inscripcion': 'fechaInscripcion',
  'f.inscripción': 'fechaInscripcion',
  fechainscripcion: 'fechaInscripcion',
  'fecha inscripcion': 'fechaInscripcion',
  domicilio: 'domicilio',
  direccion: 'domicilio',
  colonia: 'colonia',
  'tel.celular': 'celular',
  celular: 'celular',
  genero: 'genero',
  género: 'genero',
  sexo: 'genero',
}

type Step = 'upload' | 'preview' | 'validate' | 'import' | 'results'

export default function ImportarEstudiantesPage() {
  const [step, setStep] = useState<Step>('upload')
  const [estudiantes, setEstudiantes] = useState<ImportarEstudianteDto[]>([])
  const [validacion, setValidacion] = useState<ValidarImportacionResponse | null>(null)
  const [resultado, setResultado] = useState<ImportarEstudiantesResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const [crearCatalogos, setCrearCatalogos] = useState(false)
  const [actualizarExistentes, setActualizarExistentes] = useState(true)
  const [inscribirAGrupo, setInscribirAGrupo] = useState(false)

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
      const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        toast.error('El archivo no contiene datos')
        return
      }

      const headers = (jsonData[0]).map((h) => String(h).toLowerCase().trim())
      const rows = jsonData.slice(1)

      const mapped: ImportarEstudianteDto[] = []

      for (const row of rows) {
        if (!row || row.every((cell) => !cell)) continue

        const estudiante: Partial<ImportarEstudianteDto> = {}

        headers.forEach((header, index) => {
          const mappedKey = COLUMN_MAPPING[header]
          if (mappedKey && row[index] !== undefined && row[index] !== null) {
            let value = String(row[index]).trim()

            if (mappedKey === 'fechaNacimiento' || mappedKey === 'fechaInscripcion') {
              if (value === '-' || value === '0000-00-00') {
                value = ''
              }
            }

            ;(estudiante as Record<string, string>)[mappedKey] = value
          }
        })

        if (estudiante.matricula) {
          mapped.push(estudiante as ImportarEstudianteDto)
        }
      }

      setEstudiantes(mapped)
      setStep('preview')
      toast.success(`Se cargaron ${mapped.length} registros`)
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      toast.error('Error al procesar el archivo Excel')
    } finally {
      setLoading(false)
    }
  }

  const handleValidar = async () => {
    setLoading(true)

    try {
      const result = await importacionService.validarImportacion(estudiantes)
      setValidacion(result)
      setStep('validate')

      if (result.esValido) {
        toast.success('Validacion exitosa - Listo para importar')
      } else {
        toast.warning('Se encontraron problemas en la validacion')
      }
    } catch (error) {
      console.error('Error al validar:', error)
      toast.error('Error al validar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleImportar = async () => {
    setLoading(true)

    try {
      const result = await importacionService.importarEstudiantes({
        estudiantes,
        crearCatalogosInexistentes: crearCatalogos,
        actualizarExistentes,
        inscribirAGrupo,
      })

      setResultado(result)
      setStep('results')

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.exitosos} estudiantes exitosamente`)
      } else {
        toast.warning(
          `Importacion completada: ${result.exitosos} exitosos, ${result.fallidos} fallidos`
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
    setStep('upload')
    setEstudiantes([])
    setValidacion(null)
    setResultado(null)
  }

  const downloadTemplate = () => {
    const template = [
      [
        'Ciclo',
        'Escuela',
        'Curso',
        'Periodo',
        'Grupo',
        'Matricula',
        'Paterno',
        'Materno',
        'Nombre',
        'CURP',
        'Forma Pago',
        'Telefono',
        'Email',
        'F.Nacimiento',
        'F.Inscripcion',
        'Domicilio',
        'Colonia',
        'Tel.Celular',
        'Genero',
      ],
      [
        '18 CUATRIMESTRE SEPTIEMBRE-DICIEMBRE',
        'CAMPUS CENTRO',
        'AUXILIAR EN ENFERMERIA',
        '1ero.',
        '11',
        'L00001',
        'GARCIA',
        'LOPEZ',
        'JUAN CARLOS',
        'GALJ900101HGTRCN01',
        'SinTitulo',
        '4771234567',
        'ejemplo@correo.com',
        '1990-01-01',
        '2025-09-01',
        'CALLE EJEMPLO 123',
        'CENTRO',
        '4779876543',
        'Masculino',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla')
    XLSX.writeFile(wb, 'plantilla_importacion_estudiantes.xlsx')
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div
              className="rounded-lg p-2"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <Upload className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Importar Estudiantes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Carga masiva de estudiantes desde archivo Excel
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          style={{ borderColor: '#14356F', color: '#14356F' }}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar Plantilla
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {['upload', 'preview', 'validate', 'import', 'results'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                ['upload', 'preview', 'validate', 'import', 'results'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : step !== s
                    ? 'bg-muted text-muted-foreground'
                    : ''
              }`}
              style={step === s ? { background: 'linear-gradient(to right, #14356F, #1e4a8f)', color: 'white' } : undefined}
            >
              {['upload', 'preview', 'validate', 'import', 'results'].indexOf(step) > i ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 4 && <div className="mx-2 h-0.5 w-12 bg-muted" />}
          </div>
        ))}
      </div>
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Subir Archivo</CardTitle>
            <CardDescription>
              Arrastra tu archivo Excel o haz clic para seleccionarlo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 transition-colors hover:border-primary/50 hover:bg-muted/20"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <>
                  <FileSpreadsheet className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">Arrastra tu archivo Excel aqui</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Formatos soportados: .xlsx, .xls
                  </p>
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
          </CardContent>
        </Card>
      )}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Paso 2: Vista Previa</span>
              <Badge variant="secondary">{estudiantes.length} registros</Badge>
            </CardTitle>
            <CardDescription>
              Verifica que los datos se hayan cargado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Matricula</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>F. Inscripcion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.slice(0, 100).map((est, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{est.matricula}</TableCell>
                      <TableCell>
                        {`${est.nombre} ${est.apellidoPaterno} ${est.apellidoMaterno ?? ''}`.trim()}
                      </TableCell>
                      <TableCell>{est.campus}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={est.curso}>
                        {est.curso}
                      </TableCell>
                      <TableCell>{est.grupo ?? '-'}</TableCell>
                      <TableCell>{est.fechaInscripcion ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {estudiantes.length > 100 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Mostrando 100 de {estudiantes.length} registros
              </p>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleValidar} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Validar Datos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'validate' && validacion && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card
              className={
                validacion.esValido
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
              }
            >
              <CardHeader className="pb-2">
                <CardDescription>Estado</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  {validacion.esValido ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Listo
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Con Problemas
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Registros</CardDescription>
                <CardTitle>{validacion.totalRegistros}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardDescription>Validos</CardDescription>
                <CardTitle className="text-green-600">{validacion.registrosValidos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader className="pb-2">
                <CardDescription>Con Errores</CardDescription>
                <CardTitle className="text-red-600">{validacion.registrosConErrores}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          {validacion.campusNoEncontrados.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Campus no encontrados</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {validacion.campusNoEncontrados.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validacion.cursosNoEncontrados.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Carreras/Cursos no encontrados</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {validacion.cursosNoEncontrados.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validacion.matriculasDuplicadas.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Matriculas duplicadas en el archivo</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {validacion.matriculasDuplicadas.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Importacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crear-catalogos"
                  checked={crearCatalogos}
                  onCheckedChange={(checked) => setCrearCatalogos(checked === true)}
                />
                <Label htmlFor="crear-catalogos" className="cursor-pointer">
                  Crear Campus y Carreras que no existan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actualizar"
                  checked={actualizarExistentes}
                  onCheckedChange={(checked) => setActualizarExistentes(checked === true)}
                />
                <Label htmlFor="actualizar" className="cursor-pointer">
                  Actualizar estudiantes existentes (por matricula)
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="inscribir"
                  checked={inscribirAGrupo}
                  onCheckedChange={(checked) => setInscribirAGrupo(checked === true)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="inscribir" className="cursor-pointer">
                    Inscribir automáticamente al grupo indicado
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crea el grupo si no existe (requiere columnas Periodo y Grupo).
                    Formato Grupo: &quot;31&quot; = Turno 3, Grupo 1
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Validacion</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="errores">
                <TabsList>
                  <TabsTrigger value="errores">
                    Con Errores ({validacion.registrosConErrores})
                  </TabsTrigger>
                  <TabsTrigger value="todos">Todos ({validacion.totalRegistros})</TabsTrigger>
                </TabsList>
                <TabsContent value="errores">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Matricula</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Mensaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validacion.detalleValidacion
                          .filter((d) => !d.exito)
                          .map((det) => (
                            <TableRow key={det.fila}>
                              <TableCell>{det.fila}</TableCell>
                              <TableCell className="font-mono">{det.matricula}</TableCell>
                              <TableCell>{det.nombreCompleto}</TableCell>
                              <TableCell className="text-red-600">{det.mensaje}</TableCell>
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
                          <TableHead>Matricula</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validacion.detalleValidacion.slice(0, 100).map((det) => (
                          <TableRow key={det.fila}>
                            <TableCell>{det.fila}</TableCell>
                            <TableCell className="font-mono">{det.matricula}</TableCell>
                            <TableCell>{det.nombreCompleto}</TableCell>
                            <TableCell>
                              {det.exito ? (
                                <Badge className="bg-green-100 text-green-800">Valido</Badge>
                              ) : (
                                <Badge variant="destructive">{det.mensaje}</Badge>
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

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('preview')}>
              Volver
            </Button>
            <Button
              onClick={handleImportar}
              disabled={loading || (!validacion.esValido && !crearCatalogos)}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importar {validacion.registrosValidos} Estudiantes
            </Button>
          </div>
        </div>
      )}
      {step === 'results' && resultado && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Procesados</CardDescription>
                <CardTitle>{resultado.totalProcesados}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardDescription>Creados</CardDescription>
                <CardTitle className="text-green-600">{resultado.exitosos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardHeader className="pb-2">
                <CardDescription>Actualizados</CardDescription>
                <CardTitle className="text-blue-600">{resultado.actualizados}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader className="pb-2">
                <CardDescription>Fallidos</CardDescription>
                <CardTitle className="text-red-600">{resultado.fallidos}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          {resultado.fallidos === 0 ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Importacion Exitosa</AlertTitle>
              <AlertDescription>
                Todos los estudiantes fueron importados correctamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Importacion con Errores</AlertTitle>
              <AlertDescription>
                Algunos estudiantes no pudieron ser importados. Revisa el detalle abajo.
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fila</TableHead>
                      <TableHead>Matricula</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.resultados.map((res) => (
                      <TableRow key={res.fila}>
                        <TableCell>{res.fila}</TableCell>
                        <TableCell className="font-mono">{res.matricula}</TableCell>
                        <TableCell>{res.nombreCompleto}</TableCell>
                        <TableCell>
                          {res.exito ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="mr-1 h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={res.exito ? 'text-green-600' : 'text-red-600'}>
                            {res.mensaje}
                          </span>
                          {res.advertencias.length > 0 && (
                            <div className="mt-1 text-xs text-yellow-600">
                              {res.advertencias.join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleReset}>
              <Upload className="mr-2 h-4 w-4" />
              Nueva Importacion
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
