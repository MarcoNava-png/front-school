"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { tenantAdminService, type PlanLicencia, type CreateTenantRequest, type CreateTenantResponse } from "@/services/tenant-admin-service"

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

export default function NewTenantPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<PlanLicencia[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [result, setResult] = useState<CreateTenantResponse | null>(null)

  const [formData, setFormData] = useState<CreateTenantRequest>({
    codigo: '',
    nombre: '',
    nombreCorto: '',
    subdominio: '',
    colorPrimario: '#14356F',
    emailContacto: '',
    telefonoContacto: '',
    idPlanLicencia: 0,
    adminEmail: '',
    adminNombre: '',
    adminPassword: generatePassword(),
  })

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    try {
      const data = await tenantAdminService.getPlans()
      setPlans(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, idPlanLicencia: data[0].idPlanLicencia }))
      }
    } catch (err) {
      toast.error('Error al cargar los planes')
    } finally {
      setLoadingPlans(false)
    }
  }

  function handleChange(field: keyof CreateTenantRequest, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (field === 'codigo') {
      const subdomain = String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
      setFormData(prev => ({ ...prev, subdominio: subdomain }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.codigo || !formData.nombre || !formData.nombreCorto) {
      toast.error('Completa los datos de la escuela')
      return
    }
    if (!formData.adminEmail || !formData.adminNombre || !formData.adminPassword) {
      toast.error('Completa los datos del administrador')
      return
    }
    if (!formData.idPlanLicencia) {
      toast.error('Selecciona un plan')
      return
    }

    try {
      setLoading(true)
      const response = await tenantAdminService.create(formData)
      setResult(response)

      if (response.exitoso) {
        toast.success('Escuela creada exitosamente')
      } else {
        toast.error(response.mensaje)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'Error al crear la escuela')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const selectedPlan = plans.find(p => p.idPlanLicencia === formData.idPlanLicencia)

  if (result?.exitoso) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              Escuela Creada Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Datos de acceso</AlertTitle>
              <AlertDescription className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">URL de acceso</p>
                    <p className="font-mono">{result.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.url || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Email del administrador</p>
                    <p className="font-mono">{result.adminEmail}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.adminEmail || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Contraseña temporal</p>
                    <p className="font-mono">{result.passwordTemporal}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.passwordTemporal || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              Guarda estos datos y compártelos con el administrador de la escuela.
              Se recomienda cambiar la contraseña en el primer inicio de sesión.
            </p>

            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard/super-admin/tenants">
                  Ver todas las escuelas
                </Link>
              </Button>
              <Button variant="outline" onClick={() => {
                setResult(null)
                setFormData({
                  codigo: '',
                  nombre: '',
                  nombreCorto: '',
                  subdominio: '',
                  colorPrimario: '#14356F',
                  emailContacto: '',
                  telefonoContacto: '',
                  idPlanLicencia: plans[0]?.idPlanLicencia || 0,
                  adminEmail: '',
                  adminNombre: '',
                  adminPassword: generatePassword(),
                })
              }}>
                Crear otra escuela
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/super-admin/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Nueva Escuela
          </h1>
          <p className="text-muted-foreground">
            Registra una nueva institución en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Datos de la escuela */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Datos de la Escuela</CardTitle>
              <CardDescription>Información básica de la institución</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    placeholder="ESCUELA1"
                    value={formData.codigo}
                    onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">Identificador único (sin espacios)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdominio">Subdominio *</Label>
                  <div className="flex">
                    <Input
                      id="subdominio"
                      placeholder="escuela1"
                      value={formData.subdominio}
                      onChange={(e) => handleChange('subdominio', e.target.value.toLowerCase())}
                      className="rounded-r-none"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
                      .saciusag.com.mx
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Universidad / Colegio / Instituto..."
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombreCorto">Nombre corto *</Label>
                  <Input
                    id="nombreCorto"
                    placeholder="ESCUELA1"
                    value={formData.nombreCorto}
                    onChange={(e) => handleChange('nombreCorto', e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorPrimario">Color principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorPrimario"
                      type="color"
                      value={formData.colorPrimario}
                      onChange={(e) => handleChange('colorPrimario', e.target.value)}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={formData.colorPrimario}
                      onChange={(e) => handleChange('colorPrimario', e.target.value)}
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emailContacto">Email de contacto</Label>
                  <Input
                    id="emailContacto"
                    type="email"
                    placeholder="contacto@escuela.edu.mx"
                    value={formData.emailContacto}
                    onChange={(e) => handleChange('emailContacto', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefonoContacto">Teléfono</Label>
                  <Input
                    id="telefonoContacto"
                    placeholder="(33) 1234-5678"
                    value={formData.telefonoContacto}
                    onChange={(e) => handleChange('telefonoContacto', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <CardTitle className="text-base">Administrador Inicial</CardTitle>
              <CardDescription>Usuario que tendrá acceso total a la escuela</CardDescription>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminNombre">Nombre completo *</Label>
                  <Input
                    id="adminNombre"
                    placeholder="Juan Pérez García"
                    value={formData.adminNombre}
                    onChange={(e) => handleChange('adminNombre', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@escuela.edu.mx"
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Contraseña temporal *</Label>
                <div className="flex gap-2">
                  <Input
                    id="adminPassword"
                    value={formData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleChange('adminPassword', generatePassword())}
                  >
                    Generar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan de Licencia</CardTitle>
                <CardDescription>Selecciona el plan para esta escuela</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingPlans ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map(plan => (
                      <div
                        key={plan.idPlanLicencia}
                        onClick={() => handleChange('idPlanLicencia', plan.idPlanLicencia)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.idPlanLicencia === plan.idPlanLicencia
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{plan.nombre}</p>
                            <p className="text-xs text-muted-foreground">{plan.descripcion}</p>
                          </div>
                          <p className="font-bold text-sm">{formatCurrency(plan.precioMensual)}/mes</p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {plan.maxEstudiantes.toLocaleString()} estudiantes · {plan.maxUsuarios} usuarios
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen del Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Estudiantes</span>
                    <span className="font-medium">{selectedPlan.maxEstudiantes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuarios admin</span>
                    <span className="font-medium">{selectedPlan.maxUsuarios}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Campus</span>
                    <span className="font-medium">{selectedPlan.maxCampus}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Soporte</span>
                    <span>{selectedPlan.incluyeSoporte ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reportes</span>
                    <span>{selectedPlan.incluyeReportes ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API</span>
                    <span>{selectedPlan.incluyeAPI ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facturación</span>
                    <span>{selectedPlan.incluyeFacturacion ? '✓' : '✗'}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando escuela...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Crear Escuela
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
