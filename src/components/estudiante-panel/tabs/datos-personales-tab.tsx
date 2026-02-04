"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save, X, User, Phone, Mail, MapPin, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { actualizarDatosEstudiante } from "@/services/estudiante-panel-service";
import type { EstudiantePanelDto, ActualizarDatosEstudianteRequest } from "@/types/estudiante-panel";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellidoPaterno: z.string().min(2, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  curp: z.string().length(18, "El CURP debe tener 18 caracteres").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  genero: z.string().optional(),
  direccion: z.string().optional(),
  nombreContactoEmergencia: z.string().optional(),
  telefonoContactoEmergencia: z.string().optional(),
  parentescoContactoEmergencia: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DatosPersonalesTabProps {
  panel: EstudiantePanelDto;
  onUpdate: () => void;
}

export function DatosPersonalesTab({ panel, onUpdate }: DatosPersonalesTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const nombreParts = panel.nombreCompleto.split(" ");
  const apellidoPaterno = nombreParts.length > 1 ? nombreParts[nombreParts.length - 2] : "";
  const apellidoMaterno = nombreParts.length > 2 ? nombreParts[nombreParts.length - 1] : "";
  const nombre = nombreParts.slice(0, nombreParts.length - 2).join(" ") || nombreParts[0] || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: nombre,
      apellidoPaterno: apellidoPaterno,
      apellidoMaterno: apellidoMaterno,
      email: panel.email || "",
      telefono: panel.telefono || "",
      curp: panel.curp || "",
      fechaNacimiento: panel.fechaNacimiento?.split("T")[0] || "",
      genero: "",
      direccion: "",
      nombreContactoEmergencia: panel.contactoEmergencia?.nombre || "",
      telefonoContactoEmergencia: panel.contactoEmergencia?.telefono || "",
      parentescoContactoEmergencia: panel.contactoEmergencia?.parentesco || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);

      const request: ActualizarDatosEstudianteRequest = {
        nombre: values.nombre,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno || "",
        email: values.email,
        telefono: values.telefono || null,
        curp: values.curp || null,
        fechaNacimiento: values.fechaNacimiento || null,
        genero: values.genero || null,
        direccion: values.direccion || null,
        nombreContactoEmergencia: values.nombreContactoEmergencia || null,
        telefonoContactoEmergencia: values.telefonoContactoEmergencia || null,
        parentescoContactoEmergencia: values.parentescoContactoEmergencia || null,
      };

      const result = await actualizarDatosEstudiante(panel.idEstudiante, request);

      if (result.exitoso) {
        toast.success("Datos actualizados correctamente");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(result.mensaje);
      }
    } catch (error) {
      toast.error("Error al guardar los cambios");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: "#14356F" }} />
            Información Personal
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre(s)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Nombre(s)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apellidoPaterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Paterno</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Apellido Paterno"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apellidoMaterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Materno</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Apellido Materno"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="curp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CURP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="CURP (18 caracteres)"
                          maxLength={18}
                          className="font-mono uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: "#14356F" }} />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={!isEditing}
                            placeholder="correo@ejemplo.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="(000) 000-0000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!isEditing}
                            placeholder="Calle, número, colonia, ciudad, estado, CP"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: "#14356F" }} />
                  Contacto de Emergencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nombreContactoEmergencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Contacto</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="Nombre completo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentescoContactoEmergencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parentesco</FormLabel>
                        <Select
                          disabled={!isEditing}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Padre">Padre</SelectItem>
                            <SelectItem value="Madre">Madre</SelectItem>
                            <SelectItem value="Hermano(a)">Hermano(a)</SelectItem>
                            <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                            <SelectItem value="Tutor">Tutor</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefonoContactoEmergencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Emergencia</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="(000) 000-0000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID del Estudiante</p>
              <p className="font-medium">{panel.idEstudiante}</p>
            </div>
            <div>
              <p className="text-gray-500">Matrícula</p>
              <p className="font-medium font-mono">{panel.matricula}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de Consulta</p>
              <p className="font-medium">
                {new Date(panel.fechaConsulta).toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
