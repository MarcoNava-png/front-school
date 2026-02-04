"use client";

import { useEffect, useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getInitials } from "@/lib/utils";
import { updateUserProfile } from "@/services/users-service";

const formSchema = z.object({
  email: z.string().email("Email invalido"),
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  telefono: z.string().optional(),
  biografia: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const getRoleBadgeColor = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    director: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    coordinador: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    docente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    alumno: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    controlescolar: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  return roleMap[role?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
};

const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    director: "Director",
    coordinador: "Coordinador",
    docente: "Docente",
    alumno: "Alumno",
    controlescolar: "Control Escolar",
  };
  return roleLabels[role?.toLowerCase()] || role;
};

export default function ProfilePage() {
  const { user, isLoading, refreshProfile } = useCurrentUser();
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const formInitialized = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      nombres: "",
      apellidos: "",
      telefono: "",
      biografia: "",
    },
  });

  useEffect(() => {
    if (user && !formInitialized.current) {
      formInitialized.current = true;
      form.reset({
        email: user.email || "",
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        biografia: user.biografia || "",
      });
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Error", {
          description: "El archivo debe ser menor a 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Error", {
          description: "El archivo debe ser una imagen",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);

      await updateUserProfile(values, photoFile);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = {
          ...parsedUser,
          nombres: values.nombres,
          apellidos: values.apellidos,
          telefono: values.telefono || null,
          biografia: values.biografia || null,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      refreshProfile();

      setPhotoFile(null);
      setPhotoPreview(null);

      toast.success("Perfil actualizado", {
        description: "Tu informacion ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar perfil", {
        description: "No se pudo actualizar tu informacion. Verifica que el servidor esté disponible.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        email: user.email || "",
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        biografia: user.biografia || "",
      });
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#14356F' }}></div>
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">No se encontró información del usuario</p>
          <Button onClick={() => window.location.href = "/auth/v2/login"}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <User className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Mi Cuenta
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra tu informacion personal y foto de perfil
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="border-2 md:col-span-1"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}
        >
          <CardHeader
            style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}
          >
            <CardTitle className="text-lg" style={{ color: '#14356F' }}>Foto de Perfil</CardTitle>
            <CardDescription>
              Actualiza tu foto de perfil (Max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar
                className="h-32 w-32 rounded-xl ring-4"
                style={{ '--tw-ring-color': 'rgba(20, 53, 111, 0.2)' } as React.CSSProperties}
              >
                <AvatarImage
                  src={photoPreview || user.photoUrl || ""}
                  alt={user.nombres || "Usuario"}
                />
                <AvatarFallback
                  className="rounded-xl text-white text-2xl font-bold"
                  style={{ background: 'linear-gradient(to bottom right, #14356F, #1e4a8f)' }}
                >
                  {getInitials(`${user.nombres || ""} ${user.apellidos || ""}`)}
                </AvatarFallback>
              </Avatar>

              <div className="w-full">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    style={{ borderColor: '#14356F', color: '#14356F' }}
                    onClick={() => document.getElementById("photo-upload")?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Seleccionar Foto
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  JPG, PNG o GIF (max. 5MB)
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rol:</span>
                <Badge
                  variant="outline"
                  className={getRoleBadgeColor(user.role || "")}
                >
                  {getRoleLabel(user.role || "")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ID de Usuario:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {user.userId ? `${user.userId.substring(0, 8)}...` : "N/A"}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-2 md:col-span-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}
        >
          <CardHeader
            style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}
          >
            <CardTitle className="text-lg" style={{ color: '#14356F' }}>Informacion Personal</CardTitle>
            <CardDescription>
              Actualiza tu informacion de contacto y detalles personales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nombres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre(s) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresa tu nombre"
                            className="focus-visible:ring-[#14356F]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellidos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresa tus apellidos"
                            className="focus-visible:ring-[#14356F]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled
                          placeholder="tu@email.com"
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription>
                        El email no puede ser modificado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="(555) 123-4567"
                          className="focus-visible:ring-[#14356F]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biografia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Cuentanos un poco sobre ti..."
                          className="min-h-[100px] focus-visible:ring-blue-500 resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Breve descripcion sobre ti (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="text-white"
                    style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
