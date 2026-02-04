'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Loader2,
  Plus,
  QrCode,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import documentosEstudianteService from '@/services/documentos-estudiante-service'
import {
  ESTATUS_COLORS,
  ESTATUS_LABELS,
  type EstatusSolicitud,
  type SolicitudDocumento,
  type SolicitudesFiltro,
  type TipoDocumento,
} from '@/types/documentos-estudiante'

import { CrearSolicitudModal } from './_components/crear-solicitud-modal'
import { VistaKardexModal } from './_components/vista-kardex-modal'

export default function DocumentosEstudiantePage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([])
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [filtro, setFiltro] = useState<SolicitudesFiltro>({
    pagina: 1,
    tamanoPagina: 20,
  })
  const [busqueda, setBusqueda] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [kardexModalOpen, setKardexModalOpen] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDocumento | null>(null)

  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await documentosEstudianteService.getSolicitudes({
        ...filtro,
        busqueda: busqueda || undefined,
      })
      setSolicitudes(response.solicitudes)
      setTotalRegistros(response.totalRegistros)
      setPagina(response.pagina)
      setTotalPaginas(response.totalPaginas)
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [filtro, busqueda])

  const loadTiposDocumento = useCallback(async () => {
    try {
      const tipos = await documentosEstudianteService.getTiposDocumento()
      setTiposDocumento(tipos)
    } catch (error) {
      console.error('Error al cargar tipos de documento:', error)
    }
  }, [])

  useEffect(() => {
    loadTiposDocumento()
  }, [loadTiposDocumento])

  useEffect(() => {
    loadSolicitudes()
  }, [loadSolicitudes])

  const handleDescargarPdf = async (solicitud: SolicitudDocumento) => {
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
      toast.success('Documento descargado exitosamente')
      loadSolicitudes()
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      toast.error('Error al descargar el documento')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleVerKardex = (solicitud: SolicitudDocumento) => {
    setSelectedSolicitud(solicitud)
    setKardexModalOpen(true)
  }

  const handleGenerarDocumento = async (idSolicitud: number) => {
    try {
      await documentosEstudianteService.marcarComoGenerada(idSolicitud)
      toast.success('Documento generado exitosamente')
      loadSolicitudes()
    } catch (error) {
      console.error('Error al generar documento:', error)
      toast.error('Error al generar el documento')
    }
  }

  const clearFilters = () => {
    setFiltro({ pagina: 1, tamanoPagina: 20 })
    setBusqueda('')
  }

  const pendientesPago = solicitudes.filter((s) => s.estatus === 'PENDIENTE_PAGO').length
  const pagados = solicitudes.filter((s) => s.estatus === 'PAGADO').length
  const generados = solicitudes.filter((s) => s.estatus === 'GENERADO').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div
              className="rounded-lg p-2"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <FileText className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Documentos de Estudiante
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona constancias, kardex y otros documentos oficiales
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
          <Button
            onClick={() => setCrearModalOpen(true)}
            className="text-white"
            style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>
              Total Solicitudes
            </CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {totalRegistros}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 dark:text-yellow-400">
              Pendientes de Pago
            </CardDescription>
            <CardTitle className="text-4xl text-yellow-700 dark:text-yellow-300">
              {pendientesPago}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Pagados (Por Generar)
            </CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {pagados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">
              Generados
            </CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {generados}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros de Busqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Search className="h-4 w-4 text-primary" />
                  Buscar
                </Label>
                <Input
                  placeholder="Folio, matricula, nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  Tipo de Documento
                </Label>
                <Select
                  value={filtro.idTipoDocumento?.toString() ?? 'all'}
                  onValueChange={(value) =>
                    setFiltro((prev) => ({
                      ...prev,
                      idTipoDocumento: value === 'all' ? undefined : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo.idTipoDocumento} value={tipo.idTipoDocumento.toString()}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <FileCheck className="h-4 w-4 text-primary" />
                  Estatus
                </Label>
                <Select
                  value={filtro.estatus ?? 'all'}
                  onValueChange={(value) =>
                    setFiltro((prev) => ({
                      ...prev,
                      estatus: value === 'all' ? undefined : (value as EstatusSolicitud),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estatus</SelectItem>
                    <SelectItem value="PENDIENTE_PAGO">Pendiente de Pago</SelectItem>
                    <SelectItem value="PAGADO">Pagado</SelectItem>
                    <SelectItem value="GENERADO">Generado</SelectItem>
                    <SelectItem value="VENCIDO">Vencido</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Solicitudes</CardTitle>
              <CardDescription>{totalRegistros} solicitudes encontradas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
                >
                  <TableHead className="text-white font-semibold">Folio</TableHead>
                  <TableHead className="text-white font-semibold">Estudiante</TableHead>
                  <TableHead className="text-white font-semibold">Matricula</TableHead>
                  <TableHead className="text-white font-semibold">Tipo Documento</TableHead>
                  <TableHead className="text-white font-semibold">Fecha Solicitud</TableHead>
                  <TableHead className="text-white font-semibold">Estatus</TableHead>
                  <TableHead className="text-white font-semibold">Precio</TableHead>
                  <TableHead className="text-white font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No se encontraron solicitudes
                    </TableCell>
                  </TableRow>
                ) : (
                  solicitudes.map((solicitud) => {
                    const statusColors = ESTATUS_COLORS[solicitud.estatus]
                    return (
                      <TableRow key={solicitud.idSolicitud}>
                        <TableCell className="font-mono text-sm">
                          {solicitud.folioSolicitud}
                        </TableCell>
                        <TableCell>{solicitud.nombreEstudiante}</TableCell>
                        <TableCell className="font-mono">{solicitud.matricula}</TableCell>
                        <TableCell>{solicitud.tipoDocumentoNombre}</TableCell>
                        <TableCell>
                          {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-MX')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                            {ESTATUS_LABELS[solicitud.estatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {solicitud.precio ? `$${solicitud.precio.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(solicitud.estatus === 'PAGADO' || solicitud.estatus === 'GENERADO') && (
                              <>
                                {solicitud.tipoDocumentoClave?.includes('KARDEX') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerKardex(solicitud)}
                                    title="Ver Kardex"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDescargarPdf(solicitud)}
                                  disabled={downloadingId === solicitud.idSolicitud}
                                  title="Descargar PDF"
                                >
                                  {downloadingId === solicitud.idSolicitud ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                                {solicitud.estatus === 'GENERADO' && solicitud.urlVerificacion && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(solicitud.urlVerificacion, '_blank')
                                    }
                                    title="Ver QR de verificacion"
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
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <span className="text-sm text-muted-foreground">
              Pagina {pagina} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina <= 1}
                onClick={() => setFiltro((prev) => ({ ...prev, pagina: pagina - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagina >= totalPaginas}
                onClick={() => setFiltro((prev) => ({ ...prev, pagina: pagina + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
      <CrearSolicitudModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        tiposDocumento={tiposDocumento}
        onSuccess={loadSolicitudes}
      />

      {selectedSolicitud && (
        <VistaKardexModal
          open={kardexModalOpen}
          onOpenChange={setKardexModalOpen}
          solicitud={selectedSolicitud}
        />
      )}
    </div>
  )
}
