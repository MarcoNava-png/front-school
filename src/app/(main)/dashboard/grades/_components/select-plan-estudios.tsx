"use client";

import { useState, useEffect } from "react";

import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudyPlansList } from "@/services/study-plans-service";
import type { StudyPlan } from "@/types/study-plan";

interface SelectPlanEstudiosProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function SelectPlanEstudios({ value, onChange }: SelectPlanEstudiosProps) {
  const [loading, setLoading] = useState(false);
  const [planes, setPlanes] = useState<StudyPlan[]>([]);

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    setLoading(true);
    try {
      const result = await getStudyPlansList();
      setPlanes(result.items);
    } catch (error) {
      console.error("Error loading planes de estudio:", error);
      toast.error("Error al cargar los planes de estudio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={value?.toString()} onValueChange={(val) => onChange(parseInt(val))} disabled={loading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Cargando..." : "Selecciona un plan de estudios"} />
      </SelectTrigger>
      <SelectContent>
        {planes.length === 0 && !loading && (
          <div className="p-2 text-sm text-gray-500 text-center">
            No hay planes de estudio disponibles
          </div>
        )}
        {planes.map((plan) => (
          <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
            {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
