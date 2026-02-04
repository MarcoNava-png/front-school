"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createApplicant } from "@/services/applicants-service";
import { PayloadCreateApplicant } from "@/types/applicant";
import { Campus } from "@/types/campus";
import { ApplicantStatus, CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
import { State } from "@/types/location";
import { StudyPlan } from "@/types/study-plan";

import { ApplicantCreateForm } from "./applicant-create-form";
import { createApplicantSchema } from "./schema-create-applicant";

interface CreateApplicantModalProps {
  open: boolean;
  genres: Genres[];
  civilStatus: CivilStatus[];
  campus: Campus[];
  studyPlans: StudyPlan[];
  contactMethods: ContactMethod[];
  schedules: Schedule[];
  applicantStatus: ApplicantStatus[];
  states: State[];
  onOpenChange: (open: boolean) => void;
  onApplicantCreated?: () => void;
}

export function CreateApplicantModal({
  open,
  onOpenChange,
  genres,
  civilStatus,
  campus,
  studyPlans,
  contactMethods,
  schedules,
  applicantStatus,
  states,
  onApplicantCreated,
}: CreateApplicantModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<PayloadCreateApplicant>({
    resolver: zodResolver(createApplicantSchema),
    defaultValues: {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: "",
      generoId: 0,
      correo: "",
      telefono: "",
      curp: "",
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      codigoPostalId: 0,
      idEstadoCivil: 0,
      campusId: 0,
      planEstudiosId: 0,
      aspiranteStatusId: 0,
      medioContactoId: 0,
      notas: "",
      atendidoPorUsuarioId: "",
      horarioId: 0,
      stateId: "",
      municipalityId: "",
    },
  });

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const safeClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      form.reset();
      onOpenChange(false);
    }, 50);
  }, [form, onOpenChange]);

  const onSubmit = async (data: PayloadCreateApplicant) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createApplicant(data);
      toast.success("Aspirante creado correctamente");
      safeClose();
      onApplicantCreated?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data || "Intenta nuevamente.";
      toast.error("Error al crear aspirante", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      safeClose();
    } else if (newOpen) {
      onOpenChange(true);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      safeClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full !max-w-5xl overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900">
            Crear Nuevo Aspirante
          </DialogTitle>
          <DialogDescription>
            Complete el formulario con la información del aspirante. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <ApplicantCreateForm
          form={form}
          open={open}
          genres={genres}
          civilStatus={civilStatus}
          campus={campus}
          studyPlans={studyPlans}
          contactMethods={contactMethods}
          schedules={schedules}
          applicantStatus={applicantStatus}
          states={states}
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
