"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, ClipboardList, Download, FileSpreadsheet, FileText, GraduationCap, Mail, MoreVertical, RefreshCw, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import { PanelHeader } from "@/components/estudiante-panel/panel-header";
import { PanelStatsCards } from "@/components/estudiante-panel/panel-stats-cards";
import { BecasTab } from "@/components/estudiante-panel/tabs/becas-tab";
import { DatosPersonalesTab } from "@/components/estudiante-panel/tabs/datos-personales-tab";
import { DocumentosPersonalesTab } from "@/components/estudiante-panel/tabs/documentos-personales-tab";
import { DocumentosTab } from "@/components/estudiante-panel/tabs/documentos-tab";
import { RecibosTab } from "@/components/estudiante-panel/tabs/recibos-tab";
import { SeguimientoAcademicoTab } from "@/components/estudiante-panel/tabs/seguimiento-academico-tab";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  actualizarEstatusEstudiante,
  descargarYGuardarBoleta,
  descargarYGuardarConstancia,
  descargarYGuardarExpediente,
  descargarYGuardarKardex,
  enviarRecordatorioPago,
  obtenerPanelEstudiante,
} from "@/services/estudiante-panel-service";
import type { EstudiantePanelDto } from "@/types/estudiante-panel";

export default function PanelEstudiantePage() {
  const params = useParams();
  const router = useRouter();
  const idEstudiante = Number(params.id);

  const [panel, setPanel] = useState<EstudiantePanelDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("datos");

  const cargarPanel = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const data = await obtenerPanelEstudiante(idEstudiante);
      setPanel(data);

      if (showToast) {
        toast.success("Información actualizada");
      }
    } catch (error) {
      console.error("Error al cargar panel:", error);
      toast.error("Error al cargar la información del estudiante");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [idEstudiante]);

  useEffect(() => {
    if (idEstudiante) {
      cargarPanel();
    }
  }, [idEstudiante, cargarPanel]);

  const handleDescargarKardex = async () => {
    if (!panel) return;
    try {
      toast.loading("Generando Kardex...");
      await descargarYGuardarKardex(panel.idEstudiante, panel.matricula);
      toast.dismiss();
      toast.success("Kardex descargado exitosamente");
    } catch (error) {
      toast.dismiss();
      toast.error("Error al descargar el Kardex");
      console.error(error);
    }
  };

  const handleDescargarConstancia = async () => {
    if (!panel) return;
    try {
      toast.loading("Generando Constancia...");
      await descargarYGuardarConstancia(panel.idEstudiante, panel.matricula);
      toast.dismiss();
      toast.success("Constancia descargada exitosamente");
    } catch (error) {
      toast.dismiss();
      toast.error("Error al descargar la Constancia");
      console.error(error);
    }
  };

  const handleDescargarExpediente = async () => {
    if (!panel) return;
    try {
      toast.loading("Generando Expediente...");
      await descargarYGuardarExpediente(panel.idEstudiante, panel.matricula);
      toast.dismiss();
      toast.success("Expediente descargado exitosamente");
    } catch (error) {
      toast.dismiss();
      toast.error("Error al descargar el Expediente");
      console.error(error);
    }
  };

  const handleDescargarBoleta = async () => {
    if (!panel) return;
    try {
      toast.loading("Generando Boleta...");
      await descargarYGuardarBoleta(panel.idEstudiante, panel.matricula);
      toast.dismiss();
      toast.success("Boleta descargada exitosamente");
    } catch (error) {
      toast.dismiss();
      toast.error("Error al descargar la Boleta");
      console.error(error);
    }
  };

  const handleEnviarRecordatorio = async () => {
    if (!panel) return;
    try {
      const result = await enviarRecordatorioPago(panel.idEstudiante);
      if (result.exitoso) {
        toast.success(result.mensaje);
      } else {
        toast.error(result.mensaje);
      }
    } catch (error) {
      toast.error("Error al enviar el recordatorio");
      console.error(error);
    }
  };

  const handleCambiarEstatus = async () => {
    if (!panel) return;
    const nuevoEstatus = !panel.activo;
    const accion = nuevoEstatus ? "activar" : "desactivar";

    try {
      const result = await actualizarEstatusEstudiante(
        panel.idEstudiante,
        nuevoEstatus,
        `Cambio de estatus desde panel administrativo`
      );

      if (result.exitoso) {
        toast.success(result.mensaje);
        cargarPanel(true);
      } else {
        toast.error(result.mensaje);
      }
    } catch (error) {
      toast.error(`Error al ${accion} al estudiante`);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Estudiante no encontrado</h2>
          <p className="text-gray-500 mt-2">No se pudo cargar la información del estudiante.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#14356F" }}>
              Panel del Estudiante
            </h1>
            <p className="text-sm text-gray-500">
              Gestión completa de información académica y administrativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => cargarPanel(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
              >
                <Download className="w-4 h-4 mr-2" />
                Documentos
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleDescargarConstancia}>
                <FileText className="w-4 h-4 mr-2" />
                Constancia de Estudios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDescargarKardex}>
                <GraduationCap className="w-4 h-4 mr-2" />
                Kardex Académico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDescargarBoleta}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Boleta de Calificaciones
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDescargarExpediente}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Expediente Completo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleEnviarRecordatorio}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Recordatorio de Pago
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCambiarEstatus}
                className={panel.activo ? "text-red-600" : "text-green-600"}
              >
                {panel.activo ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Dar de Baja
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Reactivar Estudiante
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PanelHeader panel={panel} />

      <PanelStatsCards panel={panel} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="datos">Datos Personales</TabsTrigger>
          <TabsTrigger value="academico">Seguimiento Académico</TabsTrigger>
          <TabsTrigger value="recibos">Pagos y Recibos</TabsTrigger>
          <TabsTrigger value="becas">Becas</TabsTrigger>
          <TabsTrigger value="expediente">Expediente</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="datos" className="m-0">
            <DatosPersonalesTab
              panel={panel}
              onUpdate={() => cargarPanel(true)}
            />
          </TabsContent>

          <TabsContent value="academico" className="m-0">
            <SeguimientoAcademicoTab
              idEstudiante={panel.idEstudiante}
              resumenKardex={panel.resumenKardex}
            />
          </TabsContent>

          <TabsContent value="recibos" className="m-0">
            <RecibosTab
              idEstudiante={panel.idEstudiante}
              resumenRecibos={panel.resumenRecibos}
            />
          </TabsContent>

          <TabsContent value="becas" className="m-0">
            <BecasTab
              idEstudiante={panel.idEstudiante}
              becas={panel.becas}
              onUpdate={() => cargarPanel(true)}
            />
          </TabsContent>

          <TabsContent value="expediente" className="m-0">
            <DocumentosPersonalesTab idEstudiante={panel.idEstudiante} />
          </TabsContent>

          <TabsContent value="documentos" className="m-0">
            <DocumentosTab
              idEstudiante={panel.idEstudiante}
              documentos={panel.documentos}
              matricula={panel.matricula}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
