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
import importacionService, {
  type ImportarMateriasResponse,
  type MateriaImportItem,
} from '@/services/importacion-service'

// Mapeo de columnas del Excel a propiedades del DTO
const COLUMN_MAPPING: Record<string, keyof MateriaImportItem> = {
  clave: 'clave',
  codigo: 'clave',
  'clave materia': 'clave',
  nombre: 'nombre',
  materia: 'nombre',
  'nombre materia': 'nombre',
  creditos: 'creditos',
  créditos: 'creditos',
  'horas teoria': 'horasTeoria',
  horasteoria: 'horasTeoria',
  'horas teóricas': 'horasTeoria',
  'horas practica': 'horasPractica',
  horaspractica: 'horasPractica',
  'horas prácticas': 'horasPractica',
  grado: 'grado',
  periodo: 'grado',
  cuatrimestre: 'grado',
  semestre: 'grado',
  optativa: 'esOptativa',
  'es optativa': 'esOptativa',
  campus: 'campus',
  escuela: 'campus',
  curso: 'curso',
  carrera: 'curso',
  plan: 'curso',
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
  planes,
  onSuccess,
}: ImportSubjectsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [materias, setMaterias] = useState<MateriaImportItem[]>([])
  const [resultado, setResultado] = useState<ImportarMateriasResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [clavePlan, setClavePlan] = useState<string>('')

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

      // Primera fila son los headers
      const headers = (jsonData[0]).map((h) => String(h).toLowerCase().trim())
      const rows = jsonData.slice(1)

      // Mapear datos
      const mapped: MateriaImportItem[] = []

      for (const row of rows) {
        // Saltar filas vacías
        if (!row || row.every((cell) => !cell)) continue

        const materia: Partial<MateriaImportItem> = {
          creditos: 0,
          horasTeoria: 0,
          horasPractica: 0,
          grado: '1',
          esOptativa: false,
        }

        headers.forEach((header, index) => {
          const mappedKey = COLUMN_MAPPING[header]
          if (mappedKey && row[index] !== undefined && row[index] !== null) {
            const value = row[index]

            if (mappedKey === 'creditos' || mappedKey === 'horasTeoria' || mappedKey === 'horasPractica') {
              ;(materia as Record<string, unknown>)[mappedKey] = Number(value) || 0
            } else if (mappedKey === 'esOptativa') {
              const strValue = String(value).toLowerCase()
              ;(materia as Record<string, unknown>)[mappedKey] =
                strValue === 'si' || strValue === 'sí' || strValue === 'true' || strValue === '1'
            } else {
              ;(materia as Record<string, unknown>)[mappedKey] = String(value).trim()
            }
          }
        })

        // Solo agregar si tiene clave y nombre
        if (materia.clave && materia.nombre) {
          mapped.push(materia as MateriaImportItem)
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
    if (!selectedPlan && !clavePlan) {
      toast.error('Debes seleccionar o ingresar un plan de estudios')
      return
    }

    setLoading(true)
    setStep('importing')

    try {
      const result = await importacionService.importarMaterias({
        idPlanEstudios: selectedPlan ? Number(selectedPlan) : undefined,
        clavePlanEstudios: clavePlan || undefined,
        materias,
      })

      setResultado(result)
      setStep('results')

      if (result.exito) {
        toast.success(result.mensaje)
        onSuccess?.()
      } else {
        toast.error(result.mensaje)
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
    setSelectedPlan('')
    setClavePlan('')
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const template = [
      ['Clave', 'Nombre', 'Creditos', 'Grado', 'Horas Teoria', 'Horas Practica', 'Optativa'],
      ['MAT101', 'Matemáticas I', 6, '1ero.', 4, 2, 'No'],
      ['FIS101', 'Física I', 6, '1ero.', 4, 2, 'No'],
      ['QUI101', 'Química', 4, '1ero.', 3, 1, 'No'],
      ['MAT201', 'Matemáticas II', 6, '2do.', 4, 2, 'No'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Materias')
    XLSX.writeFile(wb, 'plantilla_importacion_materias.xlsx')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Materias
          </DialogTitle>
          <DialogDescription>
            Importa materias masivamente desde un archivo Excel y asígnalas a un plan de estudios
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
                El archivo debe contener al menos las columnas: <strong>Clave</strong> y{' '}
                <strong>Nombre</strong>. Opcionalmente: Creditos, Grado, Horas Teoria, Horas
                Practica, Optativa.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{materias.length} materias cargadas</Badge>
            </div>

            {/* Selección de Plan de Estudios */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Plan de Estudios (seleccionar)</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((plan) => (
                      <SelectItem key={plan.idPlanEstudios} value={String(plan.idPlanEstudios)}>
                        {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>O ingresa la clave del plan</Label>
                <Input
                  placeholder="Ej: 04LICENF"
                  value={clavePlan}
                  onChange={(e) => setClavePlan(e.target.value)}
                />
              </div>
            </div>

            {/* Vista previa */}
            <div className="max-h-[300px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Optativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materias.slice(0, 50).map((mat, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{mat.clave}</TableCell>
                      <TableCell>{mat.nombre}</TableCell>
                      <TableCell>{mat.grado}</TableCell>
                      <TableCell>{mat.creditos}</TableCell>
                      <TableCell>
                        {mat.esOptativa ? (
                          <Badge variant="secondary">Sí</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
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
                disabled={loading || (!selectedPlan && !clavePlan)}
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
            <p className="text-sm text-muted-foreground">Por favor espera</p>
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && resultado && (
          <div className="space-y-4">
            {/* Resumen */}
            {resultado.exito ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Importación Exitosa</AlertTitle>
                <AlertDescription>
                  Plan: {resultado.clavePlanEstudios} - {resultado.nombrePlanEstudios}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error en la Importación</AlertTitle>
                <AlertDescription>{resultado.mensaje}</AlertDescription>
              </Alert>
            )}

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{resultado.totalProcesadas}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{resultado.materiasCreadas}</p>
                <p className="text-xs text-muted-foreground">Materias Creadas</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-600">{resultado.materiasExistentes}</p>
                <p className="text-xs text-muted-foreground">Materias Existentes</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800 dark:bg-purple-950">
                <p className="text-2xl font-bold text-purple-600">
                  {resultado.asignacionesCreadas}
                </p>
                <p className="text-xs text-muted-foreground">Asignaciones</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{resultado.errores}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>

            {/* Detalle */}
            {resultado.detalle.length > 0 && (
              <div className="max-h-[200px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Clave</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cuatrimestre</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.detalle.slice(0, 50).map((det, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{det.clave}</TableCell>
                        <TableCell>{det.nombre}</TableCell>
                        <TableCell>{det.cuatrimestre}</TableCell>
                        <TableCell>
                          {det.mensajeError ? (
                            <Badge variant="destructive" className="text-xs">
                              {det.mensajeError}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="mr-1 h-3 w-3" />
                              {det.estado}
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
