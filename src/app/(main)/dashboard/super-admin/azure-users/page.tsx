"use client"

import { useState, useEffect, useCallback } from "react"

import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Key,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Building,
  Phone,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import microsoftGraphService, {
  UserInfoDto,
  CreateUserRequest,
} from "@/services/microsoft-graph-service"

export default function AzureUsersPage() {
  const [users, setUsers] = useState<UserInfoDto[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfoDto | null>(null)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState<CreateUserRequest>({
    displayName: "",
    givenName: "",
    surname: "",
    userPrincipalName: "",
    password: "",
    mailNickname: "",
    jobTitle: "",
    department: "",
    officeLocation: "",
    mobilePhone: "",
    forceChangePasswordNextSignIn: true,
  })
  const [selectedDomain, setSelectedDomain] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersData, domainsData] = await Promise.all([
        microsoftGraphService.getUsers(200),
        microsoftGraphService.getDomains(),
      ])
      setUsers(usersData)
      setDomains(domainsData)
      if (domainsData.length > 0 && !selectedDomain) {
        setSelectedDomain(domainsData[0])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar datos"
      setError(message)
      toast.error("Error al cargar usuarios de Azure AD")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDomain])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userPrincipalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      displayName: "",
      givenName: "",
      surname: "",
      userPrincipalName: "",
      password: "",
      mailNickname: "",
      jobTitle: "",
      department: "",
      officeLocation: "",
      mobilePhone: "",
      forceChangePasswordNextSignIn: true,
    })
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  const handleCreateUser = async () => {
    if (!formData.displayName || !formData.mailNickname || !formData.password) {
      toast.error("Por favor complete los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const userPrincipalName = `${formData.mailNickname}@${selectedDomain}`
      const result = await microsoftGraphService.createUser({
        ...formData,
        userPrincipalName,
      })

      if (result.success) {
        toast.success("Usuario creado exitosamente")
        setCreateDialogOpen(false)
        resetForm()
        loadData()
      } else {
        toast.error(result.message || "Error al crear usuario")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear usuario"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await microsoftGraphService.updateUser(selectedUser.id, {
        displayName: formData.displayName,
        givenName: formData.givenName,
        surname: formData.surname,
        jobTitle: formData.jobTitle,
        department: formData.department,
        officeLocation: formData.officeLocation,
        mobilePhone: formData.mobilePhone,
      })

      toast.success("Usuario actualizado exitosamente")
      setEditDialogOpen(false)
      setSelectedUser(null)
      resetForm()
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al actualizar usuario"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await microsoftGraphService.deleteUser(selectedUser.id)
      toast.success("Usuario eliminado exitosamente")
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al eliminar usuario"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const result = await microsoftGraphService.resetPassword(selectedUser.id)
      setNewPassword(result.password)
      toast.success("Contrasena restablecida exitosamente")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al restablecer contrasena"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copiado al portapapeles")
  }

  const openEditDialog = (user: UserInfoDto) => {
    setSelectedUser(user)
    setFormData({
      displayName: user.displayName || "",
      givenName: user.givenName || "",
      surname: user.surname || "",
      userPrincipalName: user.userPrincipalName,
      password: "",
      mailNickname: "",
      jobTitle: user.jobTitle || "",
      department: user.department || "",
      officeLocation: user.officeLocation || "",
      mobilePhone: user.mobilePhone || "",
      forceChangePasswordNextSignIn: false,
    })
    setEditDialogOpen(true)
  }

  const openPasswordDialog = (user: UserInfoDto) => {
    setSelectedUser(user)
    setNewPassword(null)
    setPasswordDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios Azure AD</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios corporativos y correos Office 365
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : users.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                users.filter((u) => u.accountEnabled).length
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dominios</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : domains.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {domains.slice(0, 2).join(", ")}
              {domains.length > 2 && `...`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Usuarios registrados en Azure Active Directory
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.givenName} {user.surname}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {user.email || user.userPrincipalName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.department || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.jobTitle || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.accountEnabled ? "default" : "secondary"}
                        >
                          {user.accountEnabled ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordDialog(user)}
                            title="Restablecer Contrasena"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario en Azure AD con correo corporativo Office 365
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">Nombre</Label>
                <Input
                  id="givenName"
                  value={formData.givenName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, givenName: e.target.value }))
                  }
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Apellido</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, surname: e.target.value }))
                  }
                  placeholder="Perez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                Nombre para mostrar <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
                placeholder="Juan Perez"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>
                Correo Corporativo <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={formData.mailNickname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mailNickname: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
                    }))
                  }
                  placeholder="juan.perez"
                  className="flex-1"
                />
                <span className="flex items-center px-3 bg-muted rounded-md text-sm">
                  @
                </span>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Dominio" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.mailNickname && selectedDomain && (
                <p className="text-sm text-muted-foreground">
                  Correo: {formData.mailNickname}@{selectedDomain}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Contrasena <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimo 8 caracteres"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generar
                </Button>
                {formData.password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(formData.password)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Force change password */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Cambiar contrasena en primer inicio</Label>
                <p className="text-sm text-muted-foreground">
                  El usuario debera cambiar la contrasena al iniciar sesion
                </p>
              </div>
              <Switch
                checked={formData.forceChangePasswordNextSignIn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    forceChangePasswordNextSignIn: checked,
                  }))
                }
              />
            </div>

            {/* Work Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Cargo
                </Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
                  }
                  placeholder="Profesor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">
                  <Building className="h-4 w-4 inline mr-1" />
                  Departamento
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, department: e.target.value }))
                  }
                  placeholder="Academico"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeLocation">Ubicacion</Label>
                <Input
                  id="officeLocation"
                  value={formData.officeLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      officeLocation: e.target.value,
                    }))
                  }
                  placeholder="Edificio A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobilePhone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Telefono
                </Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobilePhone: e.target.value }))
                  }
                  placeholder="+52 123 456 7890"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la informacion del usuario {selectedUser?.displayName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editGivenName">Nombre</Label>
                <Input
                  id="editGivenName"
                  value={formData.givenName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, givenName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSurname">Apellido</Label>
                <Input
                  id="editSurname"
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, surname: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDisplayName">Nombre para mostrar</Label>
              <Input
                id="editDisplayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editJobTitle">Cargo</Label>
                <Input
                  id="editJobTitle"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Departamento</Label>
                <Input
                  id="editDepartment"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, department: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editOfficeLocation">Ubicacion</Label>
                <Input
                  id="editOfficeLocation"
                  value={formData.officeLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      officeLocation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMobilePhone">Telefono</Label>
                <Input
                  id="editMobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobilePhone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setSelectedUser(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de eliminar al usuario{" "}
              <strong>{selectedUser?.displayName}</strong>?
              <br />
              <br />
              Esta accion eliminara permanentemente la cuenta de Azure AD y el
              correo corporativo asociado. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedUser(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer Contrasena</DialogTitle>
            <DialogDescription>
              {newPassword
                ? "La contrasena ha sido restablecida exitosamente."
                : `Restablecer la contrasena de ${selectedUser?.displayName}`}
            </DialogDescription>
          </DialogHeader>

          {newPassword ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Guarde esta contrasena de forma segura. No se mostrara de nuevo.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <code className="flex-1 text-lg font-mono">{newPassword}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(newPassword)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Se generara una nueva contrasena aleatoria para el usuario. El
                usuario debera cambiar esta contrasena en su proximo inicio de
                sesion.
              </p>
            </div>
          )}

          <DialogFooter>
            {newPassword ? (
              <Button
                onClick={() => {
                  setPasswordDialogOpen(false)
                  setSelectedUser(null)
                  setNewPassword(null)
                }}
              >
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordDialogOpen(false)
                    setSelectedUser(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleResetPassword} disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Restablecer
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
