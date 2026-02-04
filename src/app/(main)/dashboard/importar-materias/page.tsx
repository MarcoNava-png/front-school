'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  AlertTriangle,
  BookOpen,
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
import { getStudyPlans } from '@/services/catalogs-service'
import importacionService, {
  type ImportarMateriaDto,
  type ImportarMateriasResponse,
  type ValidarMateriasResponse,
} from '@/services/importacion-service'
import { StudyPlan } from '@/types/catalog'

const COLUMN_MAPPING: Record<string, keyof ImportarMateriaDto> = {
  clave: 'clave',
  código: 'clave',
  codigo: 'clave',
  nombre: 'nombre',
  materia: 'nombre',
  'nombre materia': 'nombre',
  planestudios: 'planEstudios',
  'plan estudios': 'planEstudios',
  'plan de estudios': 'planEstudios',
  plan: 'planEstudios',
  curso: 'planEstudios',
  carrera: 'planEstudios',
  clavecampus: 'claveCampus',
  'clave campus': 'claveCampus',
  campus: 'claveCampus',
  sede: 'claveCampus',
  cuatrimestre: 'cuatrimestre',
  grado: 'cuatrimestre',
  semestre: 'cuatrimestre',
  periodo: 'cuatrimestre',
  creditos: 'creditos',
  créditos: 'creditos',
  horasteoria: 'horasTeoria',
  'horas teoria': 'horasTeoria',
  'horas teóricas': 'horasTeoria',
  ht: 'horasTeoria',
  horaspractica: 'horasPractica',
  'horas practica': 'horasPractica',
  'horas prácticas': 'horasPractica',
  hp: 'horasPractica',
  esoptativa: 'esOptativa',
  'es optativa': 'esOptativa',
  optativa: 'esOptativa',
  tipo: 'tipo',
  'tipo materia': 'tipo',
}

type Step = 'upload' | 'preview' | 'validate' | 'import' | 'results'

export default function ImportarMateriasPage() {
  const [step, setStep] = useState<Step>('upload')
  const [materias, setMaterias] = useState<ImportarMateriaDto[]>([])
  const [validacion, setValidacion] = useState<ValidarMateriasResponse | null>(null)
  const [resultado, setResultado] = useState<ImportarMateriasResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [planes, setPlanes] = useState<StudyPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  const [actualizarExistentes, setActualizarExistentes] = useState(false)
  const [crearRelacion, setCrearRelacion] = useState(true)

  useEffect(() => {
    loadPlanes()
  }, [])

  const loadPlanes = async () => {
    try {
      const planesData = await getStudyPlans()
      setPlanes(planesData)
    } catch (error) {
      console.error('Error cargando planes:', error)
    }
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
      const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        toast.error('El archivo no contiene datos')
        return
      }

      const headers = (jsonData[0] as string[]).map((h) => String(h).toLowerCase().trim())
      const rows = jsonData.slice(1) as unknown[][]

      const mapped: ImportarMateriaDto[] = []

      for (const row of rows) {
        if (!row || row.every((cell) => !cell)) continue

        const materia: Partial<ImportarMateriaDto> = {}

        headers.forEach((header, index) => {
          const mappedKey = COLUMN_MAPPING[header]
          if (mappedKey && row[index] !== undefined && row[index] !== null) {
            const value = String(row[index]).trim()

            if (mappedKey === 'creditos' || mappedKey === 'horasTeoria' || mappedKey === 'horasPractica') {
              ;(materia as Record<string, number>)[mappedKey] = parseInt(value) || 0
            } else {
              ;(materia as Record<string, string>)[mappedKey] = value
            }
          }
        })

        if (materia.clave && materia.nombre) {
          mapped.push(materia as ImportarMateriaDto)
        }
      }

      setMaterias(mapped)
      setStep('preview')
      toast.success(`Se cargaron ${mapped.length} materias`)
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
      const result = await importacionService.validarMaterias(materias)
      setValidacion(result)
      setStep('validate')

      if (result.esValido) {
        toast.success('Validación exitosa - Listo para importar')
      } else {
        toast.warning('Se encontraron problemas en la validación')
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
      const result = await importacionService.importarMaterias({
        materias,
        actualizarExistentes,
        crearRelacionSiExiste: crearRelacion,
      })

      setResultado(result)
      setStep('results')

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.materiasCreadas} materias exitosamente`)
      } else {
        toast.warning(
          `Importación completada: ${result.materiasCreadas} creadas, ${result.fallidos} fallidas`
        )
      }
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar las materias')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setMaterias([])
    setValidacion(null)
    setResultado(null)
  }

  const downloadTemplate = async () => {
    try {
      setLoading(true)
      const planId = selectedPlanId ? parseInt(selectedPlanId) : undefined
      const blob = await importacionService.descargarPlantillaMaterias(planId)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = planId ? `plantilla_materias_plan_${planId}.xlsx` : 'plantilla_materias.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Plantilla descargada')
    } catch (error) {
      console.error('Error al descargar plantilla:', error)
      downloadLocalTemplate()
    } finally {
      setLoading(false)
    }
  }

  const downloadLocalTemplate = () => {
    const template = [
      ['Clave', 'Nombre', 'PlanEstudios', 'ClaveCampus', 'Cuatrimestre', 'Creditos', 'HorasTeoria', 'HorasPractica', 'EsOptativa', 'Tipo'],
      ['EECI101', 'Fundamentos Básicos De Enfermería', 'Especialidad En Cuidados Intensivos', 'NORTE', '1', '6', '4', '2', 'No', 'Formación Académica'],
      ['EECI101', 'Fundamentos Básicos De Enfermería', 'Especialidad En Cuidados Intensivos', 'SUR', '1', '6', '4', '2', 'No', 'Formación Académica'],
      ['EECI102', 'Fisiopatología I', 'Especialidad En Cuidados Intensivos', 'NORTE', '1', '6', '4', '2', 'No', 'Formación Académica'],
      ['EECI201', 'Cuidados Intensivos I', 'Especialidad En Cuidados Intensivos', 'NORTE', '2', '8', '4', '4', 'No', 'Formación Académica'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Materias')

    const instrucciones = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE MATERIAS'],
      [''],
      ['Columnas requeridas:'],
      ['• Clave: Clave única de la materia (ej: MAT101)'],
      ['• Nombre: Nombre completo de la materia'],
      ['• PlanEstudios: Nombre o clave del plan de estudios'],
      ['• ClaveCampus: Clave del campus (ej: NORTE, SUR, CENTRO)'],
      ['• Cuatrimestre: Número (1, 2, 3) o texto (1ero., 2do.)'],
      [''],
      ['Columnas opcionales:'],
      ['• Creditos: Número de créditos'],
      ['• HorasTeoria: Horas de teoría por semana'],
      ['• HorasPractica: Horas de práctica por semana'],
      ['• EsOptativa: Si/No'],
      ['• Tipo: Tipo de materia (informativo)'],
      [''],
      ['NOTA IMPORTANTE:'],
      ['Si deseas asignar la misma materia a varios campus,'],
      ['duplica la fila cambiando solo la columna ClaveCampus.'],
      ['La materia se creará una sola vez y se asignará a cada plan.'],
    ]
    const wsInstruc = XLSX.utils.aoa_to_sheet(instrucciones)
    XLSX.utils.book_append_sheet(wb, wsInstruc, 'Instrucciones')

    XLSX.writeFile(wb, 'plantilla_importacion_materias.xlsx')
    toast.success('Plantilla descargada')
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
              <BookOpen className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Importar Materias
          </h1>
          <p className="mt-1 text-muted-foreground">
            Carga masiva de materias y asignación a planes de estudio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Plan para exportar (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin plan específico</SelectItem>
              {planes.map((plan) => (
                <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                  {plan.nombrePlanEstudios}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={loading}
            style={{ borderColor: '#14356F', color: '#14356F' }}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar Plantilla
          </Button>
        </div>
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
                  <p className="mb-2 text-lg font-medium">Arrastra tu archivo Excel aquí</p>
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
              <Badge variant="secondary">{materias.length} materias</Badge>
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
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Plan de Estudios</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Cuatri</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>HT</TableHead>
                    <TableHead>HP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materias.slice(0, 100).map((mat, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{mat.clave}</TableCell>
                      <TableCell>{mat.nombre}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={mat.planEstudios}>
                        {mat.planEstudios}
                      </TableCell>
                      <TableCell className="font-mono">{mat.claveCampus}</TableCell>
                      <TableCell>{mat.cuatrimestre}</TableCell>
                      <TableCell>{mat.creditos ?? 0}</TableCell>
                      <TableCell>{mat.horasTeoria ?? 0}</TableCell>
                      <TableCell>{mat.horasPractica ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {materias.length > 100 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Mostrando 100 de {materias.length} registros
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
                <CardDescription>Válidos</CardDescription>
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
          {validacion.planesNoEncontrados.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Planes de estudio no encontrados</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Los siguientes planes no existen en el sistema:</p>
                <div className="flex flex-wrap gap-2">
                  {validacion.planesNoEncontrados.map((p) => (
                    <Badge key={p} variant="outline">
                      {p}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validacion.clavesDuplicadas.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Claves duplicadas en el archivo</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {validacion.clavesDuplicadas.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Importación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actualizar"
                  checked={actualizarExistentes}
                  onCheckedChange={(checked) => setActualizarExistentes(checked === true)}
                />
                <Label htmlFor="actualizar" className="cursor-pointer">
                  Actualizar materias existentes (por clave)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crear-relacion"
                  checked={crearRelacion}
                  onCheckedChange={(checked) => setCrearRelacion(checked === true)}
                />
                <Label htmlFor="crear-relacion" className="cursor-pointer">
                  Crear asignación a plan aunque la materia ya exista
                </Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Validación</CardTitle>
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
                          <TableHead>Clave</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Mensaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validacion.detalleValidacion
                          .filter((d) => !d.exito)
                          .map((det) => (
                            <TableRow key={det.fila}>
                              <TableCell>{det.fila}</TableCell>
                              <TableCell className="font-mono">{det.clave}</TableCell>
                              <TableCell>{det.nombre}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{det.planEstudios}</TableCell>
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
                          <TableHead>Clave</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Cuatri</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validacion.detalleValidacion.slice(0, 100).map((det) => (
                          <TableRow key={det.fila}>
                            <TableCell>{det.fila}</TableCell>
                            <TableCell className="font-mono">{det.clave}</TableCell>
                            <TableCell>{det.nombre}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{det.planEstudios}</TableCell>
                            <TableCell>{det.cuatrimestre}</TableCell>
                            <TableCell>
                              {det.exito ? (
                                <Badge className="bg-green-100 text-green-800">Válido</Badge>
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
              disabled={loading || validacion.registrosValidos === 0}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importar {validacion.registrosValidos} Materias
            </Button>
          </div>
        </div>
      )}

      {step === 'results' && resultado && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Procesadas</CardDescription>
                <CardTitle>{resultado.totalProcesados}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardDescription>Creadas</CardDescription>
                <CardTitle className="text-green-600">{resultado.materiasCreadas}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardHeader className="pb-2">
                <CardDescription>Actualizadas</CardDescription>
                <CardTitle className="text-blue-600">{resultado.materiasActualizadas}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
              <CardHeader className="pb-2">
                <CardDescription>Asignaciones</CardDescription>
                <CardTitle className="text-purple-600">{resultado.relacionesCreadas}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader className="pb-2">
                <CardDescription>Fallidas</CardDescription>
                <CardTitle className="text-red-600">{resultado.fallidos}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          {resultado.fallidos === 0 ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Importación Exitosa</AlertTitle>
              <AlertDescription>
                Todas las materias fueron importadas correctamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Importación con Errores</AlertTitle>
              <AlertDescription>
                Algunas materias no pudieron ser importadas. Revisa el detalle abajo.
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
                      <TableHead>Clave</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Cuatri</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.resultados.map((res) => (
                      <TableRow key={res.fila}>
                        <TableCell>{res.fila}</TableCell>
                        <TableCell className="font-mono">{res.clave}</TableCell>
                        <TableCell>{res.nombre}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{res.planEstudios}</TableCell>
                        <TableCell>{res.cuatrimestre}</TableCell>
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
              Nueva Importación
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
