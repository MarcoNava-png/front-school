import { z } from "zod";

export const createStudentSchema = z.object({
  matricula: z.string().min(3, "La matrícula es obligatoria y debe tener al menos 3 caracteres."),
  nombreCompleto: z.string().min(3, "El nombre completo es obligatorio."),
  telefono: z.string().optional(),
  planEstudios: z.string().min(3, "El plan de estudios es obligatorio."),
  fechaIngreso: z.string().min(1, "La fecha de ingreso es obligatoria."),
  activo: z.boolean({ required_error: "Debes indicar si está activo." }),
});
