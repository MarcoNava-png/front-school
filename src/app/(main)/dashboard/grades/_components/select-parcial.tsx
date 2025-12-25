"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Parcial } from "@/types/calificaciones";

interface SelectParcialProps {
  parciales: Parcial[];
  value: number | null;
  onChange: (value: number) => void;
  loading?: boolean;
}

export function SelectParcial({ parciales, value, onChange, loading }: SelectParcialProps) {
  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
      disabled={loading || parciales.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Cargando..." : "Selecciona un parcial"} />
      </SelectTrigger>
      <SelectContent>
        {parciales.map((parcial) => (
          <SelectItem key={parcial.id} value={parcial.id.toString()}>
            {parcial.name} (Orden: {parcial.orden})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
