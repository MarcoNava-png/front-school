'use client'

import { useCallback, useEffect, useState } from 'react'

import { Download, FileText, Loader2, Plus, QrCode } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import documentosEstudianteService from '@/services/documentos-estudiante-service'
import {
  ESTATUS_COLORS,
  ESTATUS_LABELS,
  VARIANTE_LABELS,
  type SolicitudDocumento,
  type TipoDocumento,
  type VarianteDocumento,
} from '@/types/documentos-estudiante'

interface StudentDocumentsModalProps {
  open: boolean
  onClose: () => void
  studentId: number
  studentName: string
}

export function StudentDocumentsModal({
  open,
  onClose,
  studentId,
  studentName,
}: StudentDocumentsModalProps) {
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([])
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [idTipoDocumento, setIdTipoDocumento] = useState<number | null>(null)
  const [variante, setVariante] = useState<VarianteDocumento>('COMPLETO')
  const [notas, setNotas] = useState('')

  const selectedTipo = tiposDocumento.find((t) => t.idTipoDocumento === idTipoDocumento)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [solRes, tiposRes] = await Promise.all([
        documentosEstudianteService.getSolicitudesByEstudiante(studentId),
        documentosEstudianteService.getTiposDocumento(),
      ])
      setSolicitudes(solRes)
      setTiposDocumento(tiposRes)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  const handleSubmit = async () => {
    if (!idTipoDocumento) {
      toast.error('Seleccione un tipo de documento')
      return
    }

    try {
      setSubmitting(true)
      await documentosEstudianteService.crearSolicitud({
        idEstudiante: studentId,
        idTipoDocumento,
        variante,
        notas: notas || undefined,
      })
      toast.success('Solicitud creada exitosamente')
      setShowForm(false)
      setIdTipoDocumento(null)
      setVariante('COMPLETO')
      setNotas('')
      loadData()
    } catch (error) {
      console.error('Error al crear solicitud:', error)
      toast.error('Error al crear la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDescargar = async (solicitud: SolicitudDocumento) => {
    try {
      setDownloadingId(solicitud.idSolicitud)
      let blob: Blob

      if (solicitud.tipoDocumentoClave.includes('KARDEX')) {
        blob = await documentosEstudianteService.descargarKardexPdf(solicitud.idSolicitud)
      } else {
        blob = await documentosEstudianteService.descargarConstanciaPdf(solicitud.idSolicitud)
      }

      const filename = `${solicitud.tipoDocumentoClave}_${solicitud.matricula}_${solicitud.folioSolicitud}.pdf`
      documentosEstudianteService.downloadPdf(blob, filename)
      toast.success('Documento descargado')
    } catch (error) {
      console.error('Error al descargar:', error)
      toast.error('Error al descargar el documento')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleGenerar = async (idSolicitud: number) => {
    try {
      await documentosEstudianteService.marcarComoGenerada(idSolicitud)
      toast.success('Documento generado')
      loadData()
    } catch (error) {
      console.error('Error al generar:', error)
      toast.error('Error al generar el documento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Estudiante
          </DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud de Documento
              </Button>
            )}
            {showForm && (
              <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                <h4 className="font-semibold">Nueva Solicitud</h4>

                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={idTipoDocumento?.toString() ?? ''}
                    onValueChange={(value) => setIdTipoDocumento(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo.idTipoDocumento} value={tipo.idTipoDocumento.toString()}>
                          {tipo.nombre} {tipo.requierePago && `($${tipo.precio.toFixed(2)})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Variante</Label>
                  <Select value={variante} onValueChange={(v) => setVariante(v as VarianteDocumento)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(VARIANTE_LABELS) as VarianteDocumento[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {VARIANTE_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                  />
                </div>

                {selectedTipo && (
                  <div className="flex items-center justify-between rounded border bg-white p-2 dark:bg-gray-900">
                    <span>Costo:</span>
                    <span className="font-bold">
                      {selectedTipo.requierePago ? `$${selectedTipo.precio.toFixed(2)}` : 'Sin costo'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting || !idTipoDocumento} className="flex-1">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Solicitud
                  </Button>
                </div>
              </div>
            )}

            <Separator />
            <div>
              <h4 className="mb-2 font-semibold">Historial de Solicitudes</h4>
              {solicitudes.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No hay solicitudes de documentos
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudes.map((sol) => {
                      const colors = ESTATUS_COLORS[sol.estatus]
                      return (
                        <TableRow key={sol.idSolicitud}>
                          <TableCell className="font-mono text-sm">{sol.folioSolicitud}</TableCell>
                          <TableCell>{sol.tipoDocumentoNombre}</TableCell>
                          <TableCell>
                            {new Date(sol.fechaSolicitud).toLocaleDateString('es-MX')}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${colors.bg} ${colors.text}`}>
                              {ESTATUS_LABELS[sol.estatus]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {sol.puedeGenerar && sol.estatus === 'PAGADO' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGenerar(sol.idSolicitud)}
                                  title="Generar documento"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                              {sol.estatus === 'GENERADO' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDescargar(sol)}
                                    disabled={downloadingId === sol.idSolicitud}
                                    title="Descargar PDF"
                                  >
                                    {downloadingId === sol.idSolicitud ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {sol.urlVerificacion && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(sol.urlVerificacion, '_blank')}
                                      title="Ver QR"
                                    >
                                      <QrCode className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
