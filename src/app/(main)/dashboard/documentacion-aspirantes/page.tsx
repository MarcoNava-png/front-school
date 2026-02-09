'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  ClipboardList,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import documentacionAspirantesService from '@/services/documentacion-aspirantes-service'
import {
  ESTATUS_DOCUMENTACION_CONFIG,
  type AspiranteDocumentoDetalleDto,
  type DocumentacionAspiranteResumenDto,
  type EstatusDocumentacionGeneral,
} from '@/types/documentacion-aspirantes'

export default function DocumentacionAspirantesPage() {
  const [data, setData] = useState<DocumentacionAspiranteResumenDto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstatus, setFiltroEstatus] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [selectedAspirante, setSelectedAspirante] = useState<DocumentacionAspiranteResumenDto | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showProrrogaDialog, setShowProrrogaDialog] = useState(false)
  const [prorrogaDocId, setProrrogaDocId] = useState<number | null>(null)
  const [prorrogaGlobal, setProrrogaGlobal] = useState(false)
  const [fechaProrroga, setFechaProrroga] = useState('')
  const [motivoProrroga, setMotivoProrroga] = useState('')
  const [savingProrroga, setSavingProrroga] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await documentacionAspirantesService.getResumenDocumentacion({
        estatus: filtroEstatus || undefined,
        busqueda: busqueda || undefined,
      })
      setData(response)
    } catch (error) {
      console.error('Error al cargar documentacion:', error)
      toast.error('Error al cargar la documentacion')
    } finally {
      setLoading(false)
    }
  }, [filtroEstatus, busqueda])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = {
    total: data.length,
    completos: data.filter((a) => a.estatusGeneral === 'COMPLETO').length,
    incompletos: data.filter((a) => a.estatusGeneral === 'INCOMPLETO').length,
    prorrogasVencidas: data.filter((a) => a.estatusGeneral === 'PRORROGA_VENCIDA').length,
  }

  const clearFilters = () => {
    setFiltroEstatus('')
    setBusqueda('')
  }

  const openDetail = (aspirante: DocumentacionAspiranteResumenDto) => {
    setSelectedAspirante(aspirante)
    setShowDetail(true)
  }

  const openProrrogaDialog = (docId: number | null, isGlobal: boolean) => {
    setProrrogaDocId(docId)
    setProrrogaGlobal(isGlobal)
    setFechaProrroga('')
    setMotivoProrroga('')
    setShowProrrogaDialog(true)
  }

  const handleAsignarProrroga = async () => {
    if (!fechaProrroga) {
      toast.error('Selecciona una fecha de prorroga')
      return
    }

    try {
      setSavingProrroga(true)

      if (prorrogaGlobal && selectedAspirante) {
        await documentacionAspirantesService.asignarProrrogaGlobal({
          idAspirante: selectedAspirante.idAspirante,
          fechaProrroga,
          motivo: motivoProrroga || undefined,
        })
        toast.success('Prorroga global asignada exitosamente')
      } else if (prorrogaDocId) {
        await documentacionAspirantesService.asignarProrroga({
          idAspiranteDocumento: prorrogaDocId,
          fechaProrroga,
          motivo: motivoProrroga || undefined,
        })
        toast.success('Prorroga asignada exitosamente')
      }

      setShowProrrogaDialog(false)
      setShowDetail(false)
      loadData()
    } catch (error) {
      console.error('Error al asignar prorroga:', error)
      toast.error('Error al asignar la prorroga')
    } finally {
      setSavingProrroga(false)
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

  const getDocStatusIcon = (doc: AspiranteDocumentoDetalleDto) => {
    if (doc.estatus === 'VALIDADO') return <Check className="h-4 w-4 text-green-600" />
    if (doc.estatus === 'SUBIDO') return <CheckCircle className="h-4 w-4 text-blue-600" />
    if (doc.estatus === 'RECHAZADO') return <XCircle className="h-4 w-4 text-red-600" />
    if (doc.prorrogaVencida) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (doc.fechaProrroga) return <Clock className="h-4 w-4 text-blue-600" />
    return <X className="h-4 w-4 text-gray-400" />
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
              <ClipboardList className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Documentacion de Aspirantes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verifica documentacion, marca completo/incompleto y gestiona prorrogas
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Aspirantes</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#14356F' }}>
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Completos
            </CardDescription>
            <CardTitle className="text-3xl text-green-700 dark:text-green-300">
              {stats.completos}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
              Incompletos
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-700 dark:text-yellow-300">
              {stats.incompletos}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Prorrogas Vencidas
            </CardDescription>
            <CardTitle className="text-3xl text-red-700 dark:text-red-300">
              {stats.prorrogasVencidas}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Search className="h-4 w-4 text-primary" />
                Buscar
              </Label>
              <Input
                placeholder="Nombre o matricula..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Estatus Documentacion
              </Label>
              <Select
                value={filtroEstatus || 'all'}
                onValueChange={(value) => setFiltroEstatus(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="COMPLETO">Completo</SelectItem>
                  <SelectItem value="INCOMPLETO">Incompleto</SelectItem>
                  <SelectItem value="CON_PRORROGA">Con Prorroga</SelectItem>
                  <SelectItem value="PRORROGA_VENCIDA">Prorroga Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Aspirantes</CardTitle>
          <CardDescription>{data.length} aspirantes encontrados</CardDescription>
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
                  <TableHead className="text-white font-semibold">Nombre</TableHead>
                  <TableHead className="text-white font-semibold">Matricula</TableHead>
                  <TableHead className="text-white font-semibold">Plan de Estudios</TableHead>
                  <TableHead className="text-white font-semibold">Docs Completos</TableHead>
                  <TableHead className="text-white font-semibold">Estatus</TableHead>
                  <TableHead className="text-white font-semibold">Prorrogas</TableHead>
                  <TableHead className="text-white font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No se encontraron aspirantes
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((aspirante) => {
                    const statusConfig =
                      ESTATUS_DOCUMENTACION_CONFIG[aspirante.estatusGeneral as EstatusDocumentacionGeneral] ??
                      ESTATUS_DOCUMENTACION_CONFIG.INCOMPLETO
                    return (
                      <TableRow
                        key={aspirante.idAspirante}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetail(aspirante)}
                      >
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {aspirante.nombreCompleto}
                        </TableCell>
                        <TableCell className="font-mono">
                          {aspirante.matricula ?? <span className="text-muted-foreground text-xs">Sin matricula</span>}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {aspirante.planEstudios}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {aspirante.documentosCompletos}/{aspirante.totalDocumentos}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {aspirante.documentosConProrroga > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 mr-1">
                              <Clock className="mr-1 h-3 w-3" />
                              {aspirante.documentosConProrroga}
                            </Badge>
                          )}
                          {aspirante.prorrogasVencidas > 0 && (
                            <Badge className="bg-red-100 text-red-700">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {aspirante.prorrogasVencidas}
                            </Badge>
                          )}
                          {aspirante.documentosConProrroga === 0 && aspirante.prorrogasVencidas === 0 && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(aspirante)
                            }}
                          >
                            Ver detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Documentacion - {selectedAspirante?.nombreCompleto}
            </DialogTitle>
            <DialogDescription>
              {selectedAspirante?.planEstudios}
              {selectedAspirante?.matricula && ` | Matricula: ${selectedAspirante.matricula}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAspirante && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedAspirante.documentosCompletos}/{selectedAspirante.totalDocumentos} documentos completos
                  </span>
                  {(() => {
                    const sc =
                      ESTATUS_DOCUMENTACION_CONFIG[selectedAspirante.estatusGeneral as EstatusDocumentacionGeneral] ??
                      ESTATUS_DOCUMENTACION_CONFIG.INCOMPLETO
                    return (
                      <Badge className={`${sc.bgColor} ${sc.color}`}>
                        {sc.label}
                      </Badge>
                    )
                  })()}
                </div>
                {selectedAspirante.documentosPendientes > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => openProrrogaDialog(null, true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Prorroga Global
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {selectedAspirante.documentos.map((doc) => (
                  <div
                    key={doc.idAspiranteDocumento}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      doc.prorrogaVencida
                        ? 'border-red-300 bg-red-50'
                        : doc.estatus === 'VALIDADO'
                          ? 'border-green-200 bg-green-50'
                          : doc.estatus === 'SUBIDO'
                            ? 'border-blue-200 bg-blue-50'
                            : doc.estatus === 'RECHAZADO'
                              ? 'border-red-200 bg-red-50'
                              : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getDocStatusIcon(doc)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.descripcion}</span>
                          <span className="text-xs text-muted-foreground">({doc.clave})</span>
                          {doc.esObligatorio && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                              Obligatorio
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Estatus: {doc.estatus}</span>
                          {doc.fechaSubida && <span>Subido: {formatDate(doc.fechaSubida)}</span>}
                          {doc.fechaProrroga && (
                            <span className={doc.prorrogaVencida ? 'text-red-600 font-semibold' : 'text-blue-600'}>
                              Prorroga: {formatDate(doc.fechaProrroga)}
                              {doc.prorrogaVencida && ' (VENCIDA)'}
                            </span>
                          )}
                          {doc.motivoProrroga && <span>Motivo: {doc.motivoProrroga}</span>}
                        </div>
                        {doc.notas && (
                          <p className="text-xs text-muted-foreground mt-1">Notas: {doc.notas}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.estatus === 'PENDIENTE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => openProrrogaDialog(doc.idAspiranteDocumento, false)}
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          Prorroga
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prorroga Dialog */}
      <Dialog open={showProrrogaDialog} onOpenChange={setShowProrrogaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {prorrogaGlobal ? 'Asignar Prorroga Global' : 'Asignar Prorroga'}
            </DialogTitle>
            <DialogDescription>
              {prorrogaGlobal
                ? 'Se asignara esta prorroga a todos los documentos pendientes del aspirante.'
                : 'Asigna una fecha limite para la entrega de este documento.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha limite de prorroga</Label>
              <Input
                type="date"
                value={fechaProrroga}
                onChange={(e) => setFechaProrroga(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Motivo de la prorroga..."
                value={motivoProrroga}
                onChange={(e) => setMotivoProrroga(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProrrogaDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAsignarProrroga}
                disabled={savingProrroga || !fechaProrroga}
                style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
              >
                {savingProrroga && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar Prorroga
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
