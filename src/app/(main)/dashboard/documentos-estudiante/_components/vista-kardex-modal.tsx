'use client'

import { useEffect, useState } from 'react'

import { Download, Loader2, QrCode } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import documentosEstudianteService from '@/services/documentos-estudiante-service'
import type { KardexEstudiante, SolicitudDocumento } from '@/types/documentos-estudiante'

interface VistaKardexModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudDocumento
}

export function VistaKardexModal({ open, onOpenChange, solicitud }: VistaKardexModalProps) {
  const [kardex, setKardex] = useState<KardexEstudiante | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (open && solicitud) {
      loadKardex()
    }
  }, [open, solicitud])

  const loadKardex = async () => {
    try {
      setLoading(true)
      const data = await documentosEstudianteService.getKardex(
        solicitud.idEstudiante,
        solicitud.variante === 'PERIODO_ACTUAL'
      )
      setKardex(data)
    } catch (error) {
      console.error('Error al cargar kardex:', error)
      toast.error('Error al cargar el kardex')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const blob = await documentosEstudianteService.descargarKardexPdf(solicitud.idSolicitud)
      const filename = `KARDEX_${solicitud.matricula}_${solicitud.folioSolicitud}.pdf`
      documentosEstudianteService.downloadPdf(blob, filename)
      toast.success('Kardex descargado exitosamente')
    } catch (error) {
      console.error('Error al descargar kardex:', error)
      toast.error('Error al descargar el kardex')
    } finally {
      setDownloading(false)
    }
  }

  const getCalificacionColor = (calificacion: number | undefined | null) => {
    if (calificacion === undefined || calificacion === null) return 'text-muted-foreground'
    if (calificacion >= 9) return 'text-green-600'
    if (calificacion >= 7) return 'text-blue-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kardex del Estudiante</DialogTitle>
          <DialogDescription>
            {kardex?.nombreCompleto} - {kardex?.matricula}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : kardex ? (
          <div className="space-y-6">
            {/* Info del estudiante */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Carrera</p>
                <p className="font-medium">{kardex.carrera}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan de Estudios</p>
                <p className="font-medium">{kardex.planEstudios}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio General</p>
                <p className={`text-xl font-bold ${getCalificacionColor(kardex.promedioGeneral)}`}>
                  {kardex.promedioGeneral.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avance</p>
                <p className="font-medium">
                  {kardex.creditosCursados}/{kardex.creditosTotales} creditos (
                  {kardex.porcentajeAvance.toFixed(1)}%)
                </p>
              </div>
            </div>

            {/* Periodos */}
            {kardex.periodos.map((periodo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{periodo.periodo}</h3>
                  <Badge variant="secondary">Promedio: {periodo.promedioPeriodo.toFixed(2)}</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clave</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead className="text-center">Creditos</TableHead>
                      <TableHead className="text-center">Calificacion</TableHead>
                      <TableHead className="text-center">Estatus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodo.materias.map((materia, mIndex) => (
                      <TableRow key={mIndex}>
                        <TableCell className="font-mono text-sm">{materia.claveMateria}</TableCell>
                        <TableCell>{materia.nombreMateria}</TableCell>
                        <TableCell className="text-center">{materia.creditos}</TableCell>
                        <TableCell
                          className={`text-center font-bold ${getCalificacionColor(materia.calificacionFinal)}`}
                        >
                          {materia.calificacionFinal?.toFixed(1) ?? '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              materia.estatus === 'Aprobada'
                                ? 'default'
                                : materia.estatus === 'Reprobada'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {materia.estatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}

            {kardex.periodos.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No hay materias registradas en el kardex
              </p>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No se pudo cargar el kardex</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => window.open(solicitud.urlVerificacion, '_blank')}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Ver QR
          </Button>
          <Button onClick={handleDownload} disabled={downloading || loading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
