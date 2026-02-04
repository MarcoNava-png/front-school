"use client"

import { useEffect, useState, useRef } from "react"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import {
  ArrowLeft,
  Building2,
  Upload,
  Trash2,
  Loader2,
  Save
} from "lucide-react"
import { toast } from "sonner"

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
import { Skeleton } from "@/components/ui/skeleton"
import { tenantAdminService, type TenantDetail, type PlanLicencia, type UpdateTenantRequest } from "@/services/tenant-admin-service"

export default function EditTenantPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = Number(params.id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [plans, setPlans] = useState<PlanLicencia[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState<UpdateTenantRequest>({})

  useEffect(() => {
    loadData()
  }, [tenantId])

  async function loadData() {
    try {
      setLoading(true)
      const [tenantData, plansData] = await Promise.all([
        tenantAdminService.getById(tenantId),
        tenantAdminService.getPlans()
      ])
      setTenant(tenantData)
      setPlans(plansData)
      setFormData({
        nombre: tenantData.nombre,
        nombreCorto: tenantData.nombreCorto,
        colorPrimario: tenantData.colorPrimario,
        colorSecundario: tenantData.colorSecundario || undefined,
        emailContacto: tenantData.emailContacto || undefined,
        telefonoContacto: tenantData.telefonoContacto || undefined,
        direccionFiscal: tenantData.direccionFiscal || undefined,
        rfc: tenantData.rfc || undefined,
        idPlanLicencia: tenantData.idPlanLicencia,
      })
    } catch (err) {
      toast.error('Error al cargar los datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof UpdateTenantRequest, value: string | number | undefined) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    try {
      setSaving(true)
      await tenantAdminService.update(tenantId, formData)
      toast.success('Escuela actualizada exitosamente')
      router.push('/dashboard/super-admin/tenants')
    } catch (err) {
      toast.error('Error al guardar los cambios')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB')
      return
    }

    try {
      setUploadingLogo(true)
      const result = await tenantAdminService.uploadLogo(tenantId, file)
      setTenant(prev => prev ? { ...prev, logoUrl: result.logoUrl } : null)
      toast.success('Logo actualizado')
    } catch (err) {
      toast.error('Error al subir el logo')
      console.error(err)
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleDeleteLogo() {
    try {
      setUploadingLogo(true)
      await tenantAdminService.deleteLogo(tenantId)
      setTenant(prev => prev ? { ...prev, logoUrl: undefined } : null)
      toast.success('Logo eliminado')
    } catch (err) {
      toast.error('Error al eliminar el logo')
      console.error(err)
    } finally {
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Escuela no encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/super-admin/tenants">Volver</Link>
        </Button>
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
            Editar: {tenant.nombreCorto}
          </h1>
          <p className="text-muted-foreground">
            {tenant.subdominio}.saciusag.com.mx
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Imagen de la institución</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: tenant.colorPrimario + '20' }}
              >
                {uploadingLogo ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : tenant.logoUrl ? (
                  <Image
                    src={tenant.logoUrl}
                    alt={tenant.nombreCorto}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: tenant.colorPrimario }}
                  >
                    {tenant.nombreCorto.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </Button>
                {tenant.logoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteLogo}
                    disabled={uploadingLogo}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Formatos: JPG, PNG, GIF, WEBP<br />
                Tamaño máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Datos principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos de la Escuela</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={tenant.codigo} disabled />
                <p className="text-xs text-muted-foreground">No editable</p>
              </div>

              <div className="space-y-2">
                <Label>Subdominio</Label>
                <Input value={tenant.subdominio} disabled />
                <p className="text-xs text-muted-foreground">No editable</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreCorto">Nombre corto</Label>
                <Input
                  id="nombreCorto"
                  value={formData.nombreCorto || ''}
                  onChange={(e) => handleChange('nombreCorto', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idPlanLicencia">Plan</Label>
                <Select
                  value={String(formData.idPlanLicencia)}
                  onValueChange={(v) => handleChange('idPlanLicencia', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.idPlanLicencia} value={String(plan.idPlanLicencia)}>
                        {plan.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="colorPrimario">Color primario</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.colorPrimario || '#14356F'}
                    onChange={(e) => handleChange('colorPrimario', e.target.value)}
                    className="w-14 h-10 p-1"
                  />
                  <Input
                    value={formData.colorPrimario || ''}
                    onChange={(e) => handleChange('colorPrimario', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorSecundario">Color secundario</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.colorSecundario || '#ffffff'}
                    onChange={(e) => handleChange('colorSecundario', e.target.value)}
                    className="w-14 h-10 p-1"
                  />
                  <Input
                    value={formData.colorSecundario || ''}
                    onChange={(e) => handleChange('colorSecundario', e.target.value)}
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
                  value={formData.emailContacto || ''}
                  onChange={(e) => handleChange('emailContacto', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoContacto">Teléfono</Label>
                <Input
                  id="telefonoContacto"
                  value={formData.telefonoContacto || ''}
                  onChange={(e) => handleChange('telefonoContacto', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionFiscal">Dirección fiscal</Label>
              <Input
                id="direccionFiscal"
                value={formData.direccionFiscal || ''}
                onChange={(e) => handleChange('direccionFiscal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                value={formData.rfc || ''}
                onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                maxLength={13}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/super-admin/tenants">Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
