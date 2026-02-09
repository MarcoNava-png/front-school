'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
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
import documentosSolicitudesService from '@/services/documentos-solicitudes-service'
import {
  ESTATUS_SOLICITUD_CONFIG,
  type EstatusSolicitudDocumento,
  type FiltrosSolicitudes,
  type SolicitudResumenDto,
  type SolicitudesPendientesDto,
} from '@/types/documentos-solicitudes'

export default function DocumentosSolicitudesPage() {
  const [data, setData] = useState<SolicitudesPendientesDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({})
  const [busqueda, setBusqueda] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await documentosSolicitudesService.getSolicitudesControlEscolar({
        ...filtros,
        busqueda: busqueda || undefined,
      })
      setData(response)
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [filtros, busqueda])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDescargarPdf = async (solicitud: SolicitudResumenDto) => {
    try {
      setDownloadingId(solicitud.idSolicitud)
      await documentosSolicitudesService.generarYDescargarPdf(
        solicitud.idSolicitud,
        solicitud.tipoDocumentoClave,
        solicitud.folioSolicitud
      )
      toast.success('Documento descargado exitosamente')
      loadData()
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      toast.error('Error al descargar el documento')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleMarcarEntregado = async (solicitud: SolicitudResumenDto) => {
    try {
      await documentosSolicitudesService.marcarComoEntregado(solicitud.idSolicitud)
      toast.success('Documento marcado como entregado')
      loadData()
    } catch (error) {
      console.error('Error al marcar como entregado:', error)
      toast.error('Error al marcar como entregado')
    }
  }

  const clearFilters = () => {
    setFiltros({})
    setBusqueda('')
  }

  const getStatusIcon = (estatus: EstatusSolicitudDocumento) => {
    switch (estatus) {
      case 'PENDIENTE_PAGO':
        return <Clock className="h-4 w-4" />
      case 'PAGADO':
        return <CheckCircle className="h-4 w-4" />
      case 'GENERADO':
        return <FileCheck className="h-4 w-4" />
      case 'VENCIDO':
        return <AlertTriangle className="h-4 w-4" />
      case 'CANCELADO':
        return <XCircle className="h-4 w-4" />
      case 'ENTREGADO':
        return <PackageCheck className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const handleExportarReporte = () => {
    if (!data || data.solicitudes.length === 0) {
      toast.error('No hay solicitudes para exportar')
      return
    }

    const statusLabel = (estatus: string) => {
      const labels: Record<string, string> = {
        PENDIENTE_PAGO: 'Pendiente de Pago',
        PAGADO: 'Listo para Generar',
        GENERADO: 'Generado',
        VENCIDO: 'Vencido',
        CANCELADO: 'Cancelado',
        ENTREGADO: 'Entregado',
      }
      return labels[estatus] || estatus
    }

    const headers = [
      'Folio',
      'Estudiante',
      'Matricula',
      'Tipo Documento',
      'Variante',
      'Estatus',
      'Precio',
      'Fecha Solicitud',
      'Folio Recibo',
      'Estatus Recibo',
      'Fecha Generacion',
      'Generado Por',
      'Fecha Entrega',
      'Entregado Por',
    ]

    const rows = data.solicitudes.map((s) => [
      s.folioSolicitud,
      s.nombreEstudiante,
      s.matricula,
      s.tipoDocumento,
      s.variante,
      statusLabel(s.estatus),
      s.precioDocumento?.toFixed(2) ?? '',
      s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleDateString('es-MX') : '',
      s.folioRecibo ?? '',
      s.estatusRecibo ?? '',
      s.fechaGeneracion ? new Date(s.fechaGeneracion).toLocaleDateString('es-MX') : '',
      s.usuarioGenera ?? '',
      s.fechaEntrega ? new Date(s.fechaEntrega).toLocaleDateString('es-MX') : '',
      s.usuarioEntrega ?? '',
    ])

    // BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF'
    const csvContent =
      BOM +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    const periodoTexto = filtros.fechaDesde && filtros.fechaHasta
      ? `_${filtros.fechaDesde}_a_${filtros.fechaHasta}`
      : filtros.fechaDesde
        ? `_desde_${filtros.fechaDesde}`
        : filtros.fechaHasta
          ? `_hasta_${filtros.fechaHasta}`
          : ''
    const estatusFiltro = filtros.estatus ? `_${filtros.estatus}` : ''
    const fecha = new Date().toISOString().split('T')[0]

    link.href = url
    link.download = `Reporte_Solicitudes${periodoTexto}${estatusFiltro}_${fecha}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Reporte generado exitosamente', {
      description: `${data.solicitudes.length} solicitudes exportadas`,
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:gap-3 sm:text-3xl">
            <div
              className="shrink-0 rounded-lg p-1.5 sm:p-2"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <FileText className="h-5 w-5 sm:h-8 sm:w-8" style={{ color: '#14356F' }} />
            </div>
            <span className="truncate">Solicitudes de Documentos</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona y genera documentos solicitados por estudiantes
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="mr-1.5 h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Actualizar
          </Button>
          <Button
            onClick={handleExportarReporte}
            size="sm"
            className="text-white"
            style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
            disabled={loading || !data || data.solicitudes.length === 0}
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="text-xs" style={{ color: '#1e4a8f' }}>
              Total
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl" style={{ color: '#14356F' }}>
              {data ? data.solicitudes.length : 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs text-yellow-600">
              <Clock className="h-3.5 w-3.5" />
              Pend. Pago
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-yellow-700">
              {data?.totalPendientesPago ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle className="h-3.5 w-3.5" />
              Listos
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-blue-700">
              {data?.totalListosGenerar ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs text-green-600">
              <FileCheck className="h-3.5 w-3.5" />
              Generados
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-green-700">
              {data?.totalGenerados ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Vencidos
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-red-700">
              {data?.totalVencidos ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs text-purple-600">
              <PackageCheck className="h-3.5 w-3.5" />
              Entregados
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-purple-700">
              {data?.totalEntregados ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  Buscar
                </Label>
                <Input
                  placeholder="Folio, matricula, nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <FileCheck className="h-3.5 w-3.5 text-primary" />
                  Estatus
                </Label>
                <Select
                  value={filtros.estatus ?? 'all'}
                  onValueChange={(value) =>
                    setFiltros((prev) => ({
                      ...prev,
                      estatus: value === 'all' ? undefined : (value as EstatusSolicitudDocumento),
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estatus</SelectItem>
                    <SelectItem value="PENDIENTE_PAGO">Pendiente de Pago</SelectItem>
                    <SelectItem value="PAGADO">Listo para Generar</SelectItem>
                    <SelectItem value="GENERADO">Generado</SelectItem>
                    <SelectItem value="VENCIDO">Vencido</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="ENTREGADO">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Desde
                </Label>
                <Input
                  type="date"
                  value={filtros.fechaDesde ?? ''}
                  onChange={(e) =>
                    setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value || undefined }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Hasta
                </Label>
                <Input
                  type="date"
                  value={filtros.fechaHasta ?? ''}
                  onChange={(e) =>
                    setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value || undefined }))
                  }
                  className="h-9"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" size="sm" className="w-full h-9">
                  <X className="mr-1.5 h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes list */}
      <Card>
        <CardHeader className="border-b p-3 sm:p-4" style={{ background: 'linear-gradient(to right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.08))' }}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">Solicitudes de Documentos</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {data?.solicitudes.length ?? 0} solicitudes encontradas
              </CardDescription>
            </div>
            {(data?.totalListosGenerar ?? 0) > 0 && (
              <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 shrink-0">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                {data?.totalListosGenerar} listos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data || data.solicitudes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-2 opacity-50" />
              <p>No se encontraron solicitudes</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.solicitudes.map((solicitud) => {
                const statusConfig = ESTATUS_SOLICITUD_CONFIG[solicitud.estatus]
                const isReady = solicitud.estatus === 'PAGADO'

                return (
                  <div
                    key={solicitud.idSolicitud}
                    className={`p-3 sm:p-4 transition-colors hover:bg-muted/30 ${isReady ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Row 1: Header - Folio, Status, Price */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-sm font-semibold" style={{ color: '#14356F' }}>
                          {solicitud.folioSolicitud}
                        </span>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs shrink-0`}>
                          {getStatusIcon(solicitud.estatus)}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </div>
                      <span className="font-semibold text-sm shrink-0">
                        {formatCurrency(solicitud.precioDocumento)}
                      </span>
                    </div>

                    {/* Row 2: Student info & Document */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1.5 text-sm mb-2">
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">Estudiante</span>
                        <p className="font-medium truncate">{solicitud.nombreEstudiante}</p>
                        <p className="text-xs text-muted-foreground font-mono">{solicitud.matricula}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">Documento</span>
                        <p className="font-medium">{solicitud.tipoDocumento}</p>
                        <p className="text-xs text-muted-foreground">Variante: {solicitud.variante}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Fecha Solicitud</span>
                        <p>{formatDate(solicitud.fechaSolicitud)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Recibo</span>
                        {solicitud.folioRecibo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">{solicitud.folioRecibo}</span>
                            {solicitud.estatusRecibo && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  solicitud.estatusRecibo === 'PAGADO'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-yellow-500 text-yellow-600'
                                }`}
                              >
                                {solicitud.estatusRecibo}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">-</p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Users tracking & Entrega info */}
                    {(solicitud.usuarioGenera || solicitud.usuarioEntrega || solicitud.fechaEntrega) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2 border-t pt-2 mt-1">
                        {solicitud.usuarioGenera && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Generado por: <span className="font-medium text-foreground">{solicitud.usuarioGenera}</span></span>
                            {solicitud.fechaGeneracion && (
                              <span>({formatDate(solicitud.fechaGeneracion)})</span>
                            )}
                          </div>
                        )}
                        {solicitud.usuarioEntrega && (
                          <div className="flex items-center gap-1">
                            <PackageCheck className="h-3 w-3" />
                            <span>Entregado por: <span className="font-medium text-foreground">{solicitud.usuarioEntrega}</span></span>
                            {solicitud.fechaEntrega && (
                              <span>({formatDate(solicitud.fechaEntrega)})</span>
                            )}
                          </div>
                        )}
                        {solicitud.fechaEntrega && !solicitud.usuarioEntrega && (
                          <div className="flex items-center gap-1">
                            <PackageCheck className="h-3 w-3" />
                            <span>Entregado: {formatDate(solicitud.fechaEntrega)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Row 4: Actions */}
                    {(solicitud.puedeGenerar || solicitud.puedeMarcarEntregado) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {solicitud.puedeMarcarEntregado && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarEntregado(solicitud)}
                            className="h-8 border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                            Marcar Entregado
                          </Button>
                        )}
                        {solicitud.puedeGenerar && (
                          <Button
                            size="sm"
                            onClick={() => handleDescargarPdf(solicitud)}
                            disabled={downloadingId === solicitud.idSolicitud}
                            className={`h-8 ${
                              solicitud.estatus === 'PAGADO'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : ''
                            }`}
                            variant={solicitud.estatus === 'GENERADO' ? 'outline' : 'default'}
                            style={
                              solicitud.estatus === 'PAGADO'
                                ? {}
                                : solicitud.estatus !== 'GENERADO'
                                  ? { background: 'linear-gradient(to right, #14356F, #1e4a8f)' }
                                  : {}
                            }
                          >
                            {downloadingId === solicitud.idSolicitud ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {solicitud.estatus === 'PAGADO' ? 'Generar PDF' : 'Descargar'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
