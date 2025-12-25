"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { updateUser } from "@/services/users-service";
import type { User, UpdateUserRequest } from "@/types/user";

const formSchema = z.object({
  email: z.string().email("Email invalido"),
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  telefono: z.string().optional(),
  biografia: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email || "",
      nombres: user.nombres || "",
      apellidos: user.apellidos || "",
      telefono: user.telefono || "",
      biografia: user.biografia || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        biografia: user.biografia || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const userData: UpdateUserRequest = {
        ...values,
        telefono: values.telefono || undefined,
        biografia: values.biografia || undefined,
      };

      await updateUser(user.id, userData);

      toast.success("Usuario actualizado", {
        description: `${values.nombres} ${values.apellidos} ha sido actualizado`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error al actualizar usuario", {
        description: error?.response?.data?.message || "No se pudo actualizar el usuario",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <Pencil className="h-5 w-5" />
            </div>
            Editar Usuario
          </DialogTitle>
          <DialogDescription>
            Modifica la informacion del usuario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600">Informacion de Cuenta</Badge>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo Electronico <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        className="focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600">Informacion Personal</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre(s) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Carlos"
                          className="focus-visible:ring-blue-500"
                          {...field}
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
                      <FormLabel>
                        Apellidos <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Perez Garcia"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="5551234567"
                        className="focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
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
                        placeholder="Informacion adicional sobre el usuario..."
                        className="resize-none focus-visible:ring-blue-500"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
