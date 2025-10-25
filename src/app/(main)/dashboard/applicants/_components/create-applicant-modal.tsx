"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createApplicant } from "@/services/applicants-service";
import { PayloadCreateApplicant } from "@/types/applicant";
import { Campus } from "@/types/campus";
import { CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
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
  onOpenChange: (open: boolean) => void;
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
}: CreateApplicantModalProps) {
  const form = useForm({
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
    },
  });

  const onSubmit = async (data: PayloadCreateApplicant) => {
    try {
      console.log(data);
      await createApplicant(data);
      toast.success("Aspirante creado correctamente");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const err = error as { message?: string };
      toast.error("Error al crear aspirante", { description: err.message ?? "Intenta nuevamente." });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full !max-w-7xl overflow-y-auto"
        aria-describedby="create-applicant-description"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crear aspirante</DialogTitle>
        </DialogHeader>
        <div id="create-applicant-description" className="sr-only">
          Complete el formulario para crear un nuevo aspirante.
        </div>
        <ApplicantCreateForm
          form={form}
          open={open}
          genres={genres}
          civilStatus={civilStatus}
          campus={campus}
          studyPlans={studyPlans}
          contactMethods={contactMethods}
          schedules={schedules}
          onSubmit={onSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
