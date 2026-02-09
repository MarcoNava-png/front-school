"use client";

import { useEffect, useState } from "react";

import { Pencil, Trash2, Search, UserPlus, KeyRound } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers, deleteUser } from "@/services/users-service";
import type { User } from "@/types/user";

import { CreateUserModal } from "./_components/create-user-modal";
import { EditUserModal } from "./_components/edit-user-modal";
import { ResetPasswordModal } from "./_components/reset-password-modal";

const getRoleBadgeColor = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    director: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    coordinador: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    docente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    alumno: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    controlescolar: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    finanzas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    admisiones: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    superadmin: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return roleMap[role.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
};

const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    director: "Director",
    coordinador: "Coordinador",
    docente: "Docente",
    alumno: "Alumno",
    controlescolar: "Control Escolar",
    finanzas: "Finanzas",
    admisiones: "Admisiones",
    superadmin: "Super Admin",
  };
  return roleLabels[role.toLowerCase()] || role;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      toast.error("Error al cargar usuarios", {
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast.success("Usuario eliminado", {
        description: `${selectedUser.nombres} ${selectedUser.apellidos} ha sido eliminado`,
      });
      loadUsers();
    } catch {
      toast.error("Error al eliminar usuario", {
        description: "No se pudo eliminar el usuario",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #14356F, #1e4a8f)',
              }}
            >
              Gestion de Usuarios
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-white shadow-lg"
            style={{
              background: 'linear-gradient(to right, #14356F, #1e4a8f)',
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Button>
        </div>
        <Separator />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Buscar Usuarios</CardTitle>
          <CardDescription>
            Filtra usuarios por nombre, apellido o correo electronico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-visible:ring-[#14356F]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-[#14356F]"
              style={{ color: '#14356F' }}
            >
              {users.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                  style={{ borderColor: '#14356F' }}
                ></div>
                <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden shadow-md">
              <Table>
                <TableHeader>
                  <TableRow
                    className="border-b-0"
                    style={{
                      background: 'linear-gradient(to bottom, #14356F, #0f2850)',
                    }}
                  >
                    <TableHead className="font-semibold text-white">Nombre</TableHead>
                    <TableHead className="font-semibold text-white">Email</TableHead>
                    <TableHead className="font-semibold text-white">Rol</TableHead>
                    <TableHead className="font-semibold text-white">Telefono</TableHead>
                    <TableHead className="font-semibold text-white">Biografia</TableHead>
                    <TableHead className="text-right font-semibold text-white">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="hover:brightness-95 transition-all"
                      style={{
                        background: index % 2 === 0
                          ? 'linear-gradient(to bottom, #FFFFFF, #F0F4F8)'
                          : 'linear-gradient(to bottom, #E8EEF5, #D6E0EC)'
                      }}
                    >
                      <TableCell className="font-medium">
                        {user.nombres} {user.apellidos}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.roles && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className={getRoleBadgeColor(role)}
                              >
                                {getRoleLabel(role)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin rol</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.telefono || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {user.biografia || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPasswordClick(user)}
                            className="hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                            title="Restablecer contraseña"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            className="hover:bg-[#14356F]/10 hover:text-[#14356F] dark:hover:bg-[#14356F]/30 dark:hover:text-[#5a8fd4]"
                            title="Editar usuario"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                            className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            title="Eliminar usuario"
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

      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadUsers}
      />

      {selectedUser && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          user={selectedUser}
          onSuccess={loadUsers}
        />
      )}

      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onOpenChange={setIsResetPasswordModalOpen}
        user={selectedUser}
        onSuccess={loadUsers}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el usuario{" "}
              <span className="font-semibold">
                {selectedUser?.nombres} {selectedUser?.apellidos}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
