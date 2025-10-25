import { z } from "zod";

export const createApplicantSchema = z.object({
  nombre: z.string().min(1),
  apellidoPaterno: z.string().min(1),
  apellidoMaterno: z.string().min(1),
  fechaNacimiento: z.string().min(1),
  generoId: z.coerce.number().int().positive(),
  correo: z.string().email(),
  telefono: z.string().min(1),
  curp: z.string().min(1),
  calle: z.string().min(1),
  numeroExterior: z.string().min(1),
  numeroInterior: z.string().optional(),
  codigoPostalId: z.coerce.number().int().positive(),
  idEstadoCivil: z.coerce.number().int().positive(),
  campusId: z.coerce.number().int().positive(),
  planEstudiosId: z.coerce.number().int().positive(),
  aspiranteStatusId: z.coerce.number().int().positive(),
  medioContactoId: z.coerce.number().int().positive(),
  notas: z.string().optional(),
  horarioId: z.coerce.number().int().positive(),
});
