"use client";

import { useState, useEffect } from "react";

import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAcademicManagement, getGroupSubjects } from "@/services/groups-service";

interface SelectGrupoMateriaProps {
  value: number | null;
  onChange: (value: number) => void;
  planEstudiosId?: number;
}

interface GrupoMateriaOption {
  idGrupoMateria: number;
  label: string;
  nombreGrupo: string;
  nombreMateria: string;
  cuatrimestre: string;
}

export function SelectGrupoMateria({ value, onChange, planEstudiosId }: SelectGrupoMateriaProps) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<GrupoMateriaOption[]>([]);

  useEffect(() => {
    if (planEstudiosId) {
      loadGruposConMaterias();
    } else {
      setOptions([]);
    }
  }, [planEstudiosId]);

  const loadGruposConMaterias = async () => {
    if (!planEstudiosId) return;

    setLoading(true);
    try {
      const gestionAcademica = await getAcademicManagement(planEstudiosId);

      const allOptions: GrupoMateriaOption[] = [];

      for (const cuatrimestre of gestionAcademica.gruposPorCuatrimestre) {
        const nombreCuatrimestre = `${cuatrimestre.numeroCuatrimestre}° Cuatrimestre`;

        for (const grupo of cuatrimestre.grupos) {
          try {
            const materias = await getGroupSubjects(grupo.idGrupo);

            materias.forEach((materia) => {
              allOptions.push({
                idGrupoMateria: materia.idGrupoMateria,
                label: `${nombreCuatrimestre} - Grupo ${grupo.nombreGrupo} - ${materia.nombreMateria}`,
                nombreGrupo: grupo.nombreGrupo,
                nombreMateria: materia.nombreMateria,
                cuatrimestre: nombreCuatrimestre,
              });
            });
          } catch (error) {
            console.error(`Error loading subjects for grupo ${grupo.idGrupo}:`, error);
          }
        }
      }

      setOptions(allOptions);
    } catch (error) {
      console.error("Error loading grupos:", error);
      toast.error("Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={value?.toString()} onValueChange={(val) => onChange(parseInt(val))} disabled={loading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Cargando grupos..." : "Selecciona grupo y materia"} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 && !loading && (
          <div className="p-2 text-sm text-gray-500 text-center">
            No hay grupos con materias asignadas
          </div>
        )}
        {options.map((option) => (
          <SelectItem key={option.idGrupoMateria} value={option.idGrupoMateria.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
