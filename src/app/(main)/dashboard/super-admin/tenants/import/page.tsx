"use client"

import { useState, useRef } from "react"

import Link from "next/link"

import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  FileDown
} from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axiosInstance from "@/services/api-client"

interface ImportResult {
  fila: number
  codigo: string
  nombre: string
  exitoso: boolean
  mensaje: string
  url?: string
  adminEmail?: string
  passwordTemporal?: string
}

interface ImportResponse {
  totalFilas: number
  exitosos: number
  fallidos: number
  resultados: ImportResult[]
}

export default function ImportTenantsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function downloadTemplate() {
    try {
      const response = await axiosInstance.get('/admin/tenants/importar/plantilla', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'plantilla_escuelas.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Plantilla descargada')
    } catch (err) {
      toast.error('Error al descargar la plantilla')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        toast.error('El archivo debe ser un Excel (.xlsx)')
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  async function handleImport() {
    if (!file) {
      toast.error('Selecciona un archivo primero')
      return
    }

    try {
      setLoading(true)
      setProgress(10)

      const formData = new FormData()
      formData.append('archivo', file)

      setProgress(30)

      const response = await axiosInstance.post<ImportResponse>('/admin/tenants/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProgress(100)
      setResult(response.data)

      if (response.data.exitosos > 0) {
        toast.success(`${response.data.exitosos} escuelas importadas exitosamente`)
      }
      if (response.data.fallidos > 0) {
        toast.error(`${response.data.fallidos} escuelas fallaron`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al importar')
    } finally {
      setLoading(false)
    }
  }

  async function exportResults() {
    if (!result) return

    try {
      const response = await axiosInstance.post('/admin/tenants/importar/exportar-resultados', result, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'resultados_importacion.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Resultados exportados')
    } catch (err) {
      toast.error('Error al exportar resultados')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  function resetImport() {
    setFile(null)
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/super-admin/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Importar Escuelas
          </h1>
          <p className="text-muted-foreground">
            Importa múltiples escuelas desde un archivo Excel
          </p>
        </div>
      </div>

      {!result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Paso 1: Descargar plantilla */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                Descargar Plantilla
              </CardTitle>
              <CardDescription>
                Descarga la plantilla Excel con el formato requerido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>Formato requerido</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  La plantilla incluye las columnas necesarias y ejemplos de datos.
                  Revisa la hoja &quot;Instrucciones&quot; para más detalles.
                </AlertDescription>
              </Alert>

              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla Excel
              </Button>
            </CardContent>
          </Card>

          {/* Paso 2: Subir archivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                Subir Archivo
              </CardTitle>
              <CardDescription>
                Sube el archivo Excel con los datos de las escuelas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation()
                      resetImport()
                    }}>
                      Cambiar archivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">Click para seleccionar archivo</p>
                    <p className="text-sm text-muted-foreground">
                      Solo archivos .xlsx
                    </p>
                  </div>
                )}
              </div>

              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Procesando importación...
                  </p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Escuelas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Resultados de la importación */
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{result.totalFilas}</p>
                  <p className="text-sm text-muted-foreground">Total procesadas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{result.exitosos}</p>
                  <p className="text-sm text-green-600">Exitosas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-700">{result.fallidos}</p>
                  <p className="text-sm text-red-600">Fallidas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button onClick={exportResults} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Resultados a Excel
            </Button>
            <Button onClick={resetImport} variant="outline">
              Importar más escuelas
            </Button>
            <Button asChild>
              <Link href="/dashboard/super-admin/tenants">
                Ver todas las escuelas
              </Link>
            </Button>
          </div>

          {/* Tabla de resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Importación</CardTitle>
              <CardDescription>
                Detalle de cada escuela procesada con sus credenciales de acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Fila</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Email Admin</TableHead>
                    <TableHead>Contraseña</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.resultados.map((r) => (
                    <TableRow key={r.fila} className={r.exitoso ? '' : 'bg-red-50'}>
                      <TableCell>{r.fila}</TableCell>
                      <TableCell className="font-mono">{r.codigo}</TableCell>
                      <TableCell>{r.nombre}</TableCell>
                      <TableCell>
                        {r.exitoso ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Exitoso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={r.mensaje}>
                        {r.mensaje}
                      </TableCell>
                      <TableCell>
                        {r.adminEmail && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">{r.adminEmail}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(r.adminEmail!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.passwordTemporal && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">{r.passwordTemporal}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(r.passwordTemporal!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
