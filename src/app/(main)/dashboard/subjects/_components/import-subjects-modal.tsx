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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import importacionService, {
  type ImportarMateriaDto,
  type ImportarMateriasResponse,
} from '@/services/importacion-service'

const COLUMN_MAPPING: Record<string, keyof ImportarMateriaDto> = {
  clave: 'clave',
  codigo: 'clave',
  código: 'clave',
  'clave materia': 'clave',
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
  'horas teoria': 'horasTeoria',
  horasteoria: 'horasTeoria',
  'horas teóricas': 'horasTeoria',
  ht: 'horasTeoria',
  'horas practica': 'horasPractica',
  horaspractica: 'horasPractica',
  'horas prácticas': 'horasPractica',
  hp: 'horasPractica',
  optativa: 'esOptativa',
  'es optativa': 'esOptativa',
  esoptativa: 'esOptativa',
  tipo: 'tipo',
}

type Step = 'upload' | 'preview' | 'importing' | 'results'

interface StudyPlanBasic {
  idPlanEstudios: number
  clavePlanEstudios: string
  nombrePlanEstudios: string
}

interface ImportSubjectsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planes: StudyPlanBasic[]
  onSuccess?: () => void
}

export function ImportSubjectsModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportSubjectsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [materias, setMaterias] = useState<ImportarMateriaDto[]>([])
  const [resultado, setResultado] = useState<ImportarMateriasResponse | null>(null)
  const [loading, setLoading] = useState(false)

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

  const handleImportar = async () => {
    const sinPlan = materias.filter(m => !m.planEstudios)
    const sinCampus = materias.filter(m => !m.claveCampus)

    if (sinPlan.length > 0) {
      toast.error(`${sinPlan.length} materias no tienen Plan de Estudios. Agrega la columna "PlanEstudios" a tu archivo.`)
      return
    }

    if (sinCampus.length > 0) {
      toast.error(`${sinCampus.length} materias no tienen Campus. Agrega la columna "ClaveCampus" o "Campus" a tu archivo.`)
      return
    }

    setLoading(true)
    setStep('importing')

    try {
      const result = await importacionService.importarMaterias({
        materias,
        actualizarExistentes: true,
        crearRelacionSiExiste: true,
      })

      setResultado(result)
      setStep('results')

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.materiasCreadas} materias exitosamente`)
        onSuccess?.()
      } else {
        toast.warning(
          `Importación completada: ${result.materiasCreadas} creadas, ${result.fallidos} fallidas`
        )
      }
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar las materias')
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setMaterias([])
    setResultado(null)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const template = [
      ['Clave', 'Nombre', 'PlanEstudios', 'ClaveCampus', 'Cuatrimestre', 'Creditos', 'HorasTeoria', 'HorasPractica', 'EsOptativa'],
      ['MAT101', 'Matemáticas I', 'Ingeniería en Software', 'NORTE', '1', '6', '4', '2', 'No'],
      ['MAT101', 'Matemáticas I', 'Ingeniería en Software', 'SUR', '1', '6', '4', '2', 'No'],
      ['FIS101', 'Física I', 'Ingeniería en Software', 'NORTE', '1', '6', '4', '2', 'No'],
      ['MAT201', 'Matemáticas II', 'Ingeniería en Software', 'NORTE', '2', '6', '4', '2', 'No'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Materias')

    const instrucciones = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE MATERIAS'],
      [''],
      ['Columnas REQUERIDAS:'],
      ['• Clave: Clave única de la materia (ej: MAT101)'],
      ['• Nombre: Nombre completo de la materia'],
      ['• PlanEstudios: Nombre o clave del plan de estudios'],
      ['• ClaveCampus: Clave del campus (ej: NORTE, SUR)'],
      ['• Cuatrimestre: Número (1, 2, 3) o texto (1ero., 2do.)'],
      [''],
      ['Columnas opcionales:'],
      ['• Creditos: Número de créditos'],
      ['• HorasTeoria: Horas de teoría'],
      ['• HorasPractica: Horas de práctica'],
      ['• EsOptativa: Si/No'],
      [''],
      ['NOTA: Para asignar la misma materia a varios campus,'],
      ['duplica la fila cambiando solo ClaveCampus.'],
    ]
    const wsInstruc = XLSX.utils.aoa_to_sheet(instrucciones)
    XLSX.utils.book_append_sheet(wb, wsInstruc, 'Instrucciones')

    XLSX.writeFile(wb, 'plantilla_importacion_materias.xlsx')
    toast.success('Plantilla descargada')
  }

  const planesUnicos = [...new Set(materias.map(m => m.planEstudios).filter(Boolean))]
  const campusUnicos = [...new Set(materias.map(m => m.claveCampus).filter(Boolean))]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Materias
          </DialogTitle>
          <DialogDescription>
            Importa materias masivamente desde un archivo Excel. El plan de estudios y campus se leen de cada fila.
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>

            <div
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 transition-colors hover:border-primary/50 hover:bg-muted/20"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('materias-file-input')?.click()}
            >
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <>
                  <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 font-medium">Arrastra tu archivo Excel aquí</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                </>
              )}
              <input
                id="materias-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Columnas requeridas</AlertTitle>
              <AlertDescription>
                <strong>Clave</strong>, <strong>Nombre</strong>, <strong>PlanEstudios</strong>, <strong>ClaveCampus</strong>, <strong>Cuatrimestre</strong>.
                <br />
                Opcionales: Creditos, HorasTeoria, HorasPractica, EsOptativa.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {materias.length} materias cargadas
              </Badge>
              <div className="flex gap-2">
                <Badge variant="outline">{planesUnicos.length} planes</Badge>
                <Badge variant="outline">{campusUnicos.length} campus</Badge>
              </div>
            </div>

            {/* Mostrar planes y campus detectados */}
            {planesUnicos.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <strong>Planes detectados:</strong> {planesUnicos.slice(0, 5).join(', ')}
                {planesUnicos.length > 5 && ` y ${planesUnicos.length - 5} más...`}
              </div>
            )}

            {/* Vista previa */}
            <div className="max-h-[300px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Cuatri</TableHead>
                    <TableHead>Créditos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materias.slice(0, 50).map((mat, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{mat.clave}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{mat.nombre}</TableCell>
                      <TableCell className="max-w-[120px] truncate" title={mat.planEstudios}>
                        {mat.planEstudios || <span className="text-red-500">Falta</span>}
                      </TableCell>
                      <TableCell>
                        {mat.claveCampus || <span className="text-red-500">Falta</span>}
                      </TableCell>
                      <TableCell>{mat.cuatrimestre}</TableCell>
                      <TableCell>{mat.creditos ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {materias.length > 50 && (
              <p className="text-center text-sm text-muted-foreground">
                Mostrando 50 de {materias.length} materias
              </p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleImportar}
                disabled={loading || materias.length === 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Importar {materias.length} Materias
              </Button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Importando materias...</p>
            <p className="text-sm text-muted-foreground">Procesando {materias.length} registros, por favor espera</p>
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && resultado && (
          <div className="space-y-4">
            {/* Resumen */}
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

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{resultado.totalProcesados}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{resultado.materiasCreadas}</p>
                <p className="text-xs text-muted-foreground">Creadas</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-600">{resultado.materiasActualizadas || 0}</p>
                <p className="text-xs text-muted-foreground">Actualizadas</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800 dark:bg-purple-950">
                <p className="text-2xl font-bold text-purple-600">
                  {resultado.relacionesCreadas || resultado.asignacionesCreadas || 0}
                </p>
                <p className="text-xs text-muted-foreground">Asignaciones</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{resultado.fallidos || resultado.errores || 0}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>

            {/* Detalle */}
            {resultado.resultados && resultado.resultados.length > 0 && (
              <div className="max-h-[200px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Fila</TableHead>
                      <TableHead>Clave</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.resultados.slice(0, 50).map((res, i) => (
                      <TableRow key={i}>
                        <TableCell>{res.fila}</TableCell>
                        <TableCell className="font-mono">{res.clave}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{res.planEstudios}</TableCell>
                        <TableCell>
                          {res.exito ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="mr-1 h-3 w-3" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              {res.mensaje}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
