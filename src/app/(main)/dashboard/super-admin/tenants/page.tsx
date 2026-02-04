"use client"

import { useEffect, useState } from "react"

import Link from "next/link"

import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Power,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { tenantAdminService, type TenantListItem } from "@/services/tenant-admin-service"

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'Active': { label: 'Activo', variant: 'default' },
    'Pending': { label: 'Pendiente', variant: 'secondary' },
    'Suspended': { label: 'Suspendido', variant: 'destructive' },
    'Maintenance': { label: 'Mantenimiento', variant: 'outline' },
    'Inactive': { label: 'Inactivo', variant: 'outline' },
  }
  const config = statusMap[status] || { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<TenantListItem[]>([])
  const [filteredTenants, setFilteredTenants] = useState<TenantListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    filterTenants()
  }, [tenants, searchTerm, statusFilter])

  async function loadTenants() {
    try {
      setLoading(true)
      const data = await tenantAdminService.getAll()
      setTenants(data)
    } catch (err) {
      toast.error('Error al cargar las escuelas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function filterTenants() {
    let filtered = [...tenants]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t =>
        t.nombre.toLowerCase().includes(term) ||
        t.codigo.toLowerCase().includes(term) ||
        t.subdominio.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    setFilteredTenants(filtered)
  }

  async function handleStatusChange(tenant: TenantListItem, newStatus: number) {
    try {
      await tenantAdminService.changeStatus(tenant.idTenant, newStatus)
      toast.success(`Estado de ${tenant.nombreCorto} actualizado`)
      loadTenants()
    } catch (err) {
      toast.error('Error al cambiar el estado')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Escuelas
          </h1>
          <p className="text-muted-foreground">
            {tenants.length} escuelas registradas en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/super-admin/tenants/import">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar Excel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/super-admin/tenants/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Escuela
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o subdominio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Active">Activos</SelectItem>
                <SelectItem value="Pending">Pendientes</SelectItem>
                <SelectItem value="Suspended">Suspendidos</SelectItem>
                <SelectItem value="Maintenance">Mantenimiento</SelectItem>
                <SelectItem value="Inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadTenants}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Subdominio</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contratación</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron escuelas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.idTenant}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ backgroundColor: tenant.colorPrimario || '#14356F' }}
                          >
                            {tenant.nombreCorto.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{tenant.nombreCorto}</p>
                            <p className="text-xs text-muted-foreground">{tenant.codigo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://${tenant.subdominio}.saciusag.com.mx`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {tenant.subdominio}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tenant.plan}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{formatDate(tenant.fechaContratacion)}</TableCell>
                      <TableCell>{formatDate(tenant.lastAccessAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/super-admin/tenants/${tenant.idTenant}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/super-admin/tenants/${tenant.idTenant}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                            {tenant.status !== 'Active' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tenant, 1)}>
                                <Power className="h-4 w-4 mr-2 text-green-600" />
                                Activar
                              </DropdownMenuItem>
                            )}
                            {tenant.status !== 'Suspended' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tenant, 2)}>
                                <Power className="h-4 w-4 mr-2 text-red-600" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            {tenant.status !== 'Maintenance' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(tenant, 3)}>
                                <Power className="h-4 w-4 mr-2 text-amber-600" />
                                Poner en mantenimiento
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
