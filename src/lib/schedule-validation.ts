import type { HorarioMateria, DiaSemana } from "@/types/group";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return (
    (s1 >= s2 && s1 < e2) ||
    (e1 > s2 && e1 <= e2) ||
    (s1 <= s2 && e1 >= e2)
  );
}

export function findScheduleConflicts(horarios: HorarioMateria[]): {
  hasConflicts: boolean;
  conflicts: Array<{
    horario1: HorarioMateria;
    horario2: HorarioMateria;
    mensaje: string;
  }>;
} {
  const conflicts: Array<{
    horario1: HorarioMateria;
    horario2: HorarioMateria;
    mensaje: string;
  }> = [];

  for (let i = 0; i < horarios.length; i++) {
    for (let j = i + 1; j < horarios.length; j++) {
      const h1 = horarios[i];
      const h2 = horarios[j];

      if (h1.dia === h2.dia) {
        if (hasTimeOverlap(h1.horaInicio, h1.horaFin, h2.horaInicio, h2.horaFin)) {
          conflicts.push({
            horario1: h1,
            horario2: h2,
            mensaje: `Conflicto en ${h1.dia}: ${h1.horaInicio}-${h1.horaFin} se solapa con ${h2.horaInicio}-${h2.horaFin}`,
          });
        }
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

export function validateNewSchedule(
  newHorario: HorarioMateria,
  existingHorarios: HorarioMateria[]
): {
  valid: boolean;
  error?: string;
} {
  if (newHorario.horaInicio >= newHorario.horaFin) {
    return {
      valid: false,
      error: "La hora de inicio debe ser menor que la hora de fin",
    };
  }

  const duracion =
    timeToMinutes(newHorario.horaFin) - timeToMinutes(newHorario.horaInicio);
  if (duracion < 30) {
    return {
      valid: false,
      error: "La duración mínima de una clase debe ser 30 minutos",
    };
  }

  if (duracion > 240) {
    return {
      valid: false,
      error: "La duración máxima de una clase es 4 horas",
    };
  }

  for (const horario of existingHorarios) {
    if (horario.dia === newHorario.dia) {
      if (
        hasTimeOverlap(
          newHorario.horaInicio,
          newHorario.horaFin,
          horario.horaInicio,
          horario.horaFin
        )
      ) {
        return {
          valid: false,
          error: `Este horario se solapa con ${horario.horaInicio}-${horario.horaFin} en ${horario.dia}`,
        };
      }
    }
  }

  return { valid: true };
}

export function generateScheduleSummary(horarios: HorarioMateria[]): string {
  if (horarios.length === 0) return "Sin horario configurado";

  const horariosPorDia: Record<DiaSemana, HorarioMateria[]> = {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
    Domingo: [],
  };

  horarios.forEach((h) => {
    horariosPorDia[h.dia].push(h);
  });

  const dias: DiaSemana[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const resumen: string[] = [];

  dias.forEach((dia) => {
    const horariosDelDia = horariosPorDia[dia];
    if (horariosDelDia.length > 0) {
      const rangos = horariosDelDia
        .map((h) => `${h.horaInicio}-${h.horaFin}`)
        .join(", ");
      resumen.push(`${dia}: ${rangos}`);
    }
  });

  return resumen.join(" | ");
}

export function groupConsecutiveSchedules(
  horarios: HorarioMateria[]
): Array<{
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  aulas: string[];
}> {
  const horariosPorDia: Record<DiaSemana, HorarioMateria[]> = {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
    Domingo: [],
  };

  horarios.forEach((h) => {
    horariosPorDia[h.dia].push(h);
  });

  const grupos: Array<{
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    aulas: string[];
  }> = [];

  const dias: DiaSemana[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  dias.forEach((dia) => {
    const horariosDelDia = horariosPorDia[dia].sort(
      (a, b) => timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio)
    );

    if (horariosDelDia.length > 0) {
      let grupoActual = {
        dia,
        horaInicio: horariosDelDia[0].horaInicio,
        horaFin: horariosDelDia[0].horaFin,
        aulas: [horariosDelDia[0].aula],
      };

      for (let i = 1; i < horariosDelDia.length; i++) {
        const horarioActual = horariosDelDia[i];

        if (grupoActual.horaFin === horarioActual.horaInicio) {
          grupoActual.horaFin = horarioActual.horaFin;
          grupoActual.aulas.push(horarioActual.aula);
        } else {
          grupos.push(grupoActual);
          grupoActual = {
            dia,
            horaInicio: horarioActual.horaInicio,
            horaFin: horarioActual.horaFin,
            aulas: [horarioActual.aula],
          };
        }
      }

      grupos.push(grupoActual);
    }
  });

  return grupos;
}

export function calculateWeeklyHours(horarios: HorarioMateria[]): number {
  let totalMinutes = 0;

  horarios.forEach((horario) => {
    const inicio = timeToMinutes(horario.horaInicio);
    const fin = timeToMinutes(horario.horaFin);
    totalMinutes += fin - inicio;
  });

  return Math.round((totalMinutes / 60) * 10) / 10;
}

export function getClassDays(horarios: HorarioMateria[]): DiaSemana[] {
  const dias = new Set<DiaSemana>();
  horarios.forEach((h) => dias.add(h.dia));

  const ordenDias: DiaSemana[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  return ordenDias.filter((dia) => dias.has(dia));
}
