"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getMatterPlanList } from "@/services/matter-plan-service";
import { MatterPlan } from "@/types/matter-plan";

import { subjectsColumns } from "./_components/columns";
import { EmptySubjects } from "./_components/empty";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<MatterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMatterPlanList()
      .then((res) => setSubjects(res ?? []))
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: subjects,
    columns: subjectsColumns,
    getRowId: (row: MatterPlan) => row.idMateriaPlan.toString(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Materias</h1>
      </div>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando materias...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : subjects.length === 0 ? (
        <EmptySubjects />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={subjectsColumns} />
        </div>
      )}
    </div>
  );
}
