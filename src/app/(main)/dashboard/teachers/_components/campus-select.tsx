"use client";

import { FormItem } from "@/components/ui/form";
import { Campus } from "@/types/campus";

interface CampusSelectProps {
  campuses: Campus[];
  value: number | null;
  onChange: (id: number) => void;
}

export function CampusSelect({ campuses, value, onChange }: CampusSelectProps) {
  return (
    <div className="w-full">
      <FormItem>
        <label className="mb-1 block text-sm font-medium">Campus</label>
        <select
          className="block w-full rounded-[10px] border px-3 py-2 focus:ring focus:outline-none"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          required
        >
          <option value="" disabled>
            Selecciona campus
          </option>
          {campuses.map((campus: Campus) => (
            <option key={campus.idCampus} value={campus.idCampus}>
              {campus.nombre}
            </option>
          ))}
        </select>
      </FormItem>
    </div>
  );
}
