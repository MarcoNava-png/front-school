"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getStudyPlansList } from "@/services/study-plans-service";
import { StudyPlan } from "@/types/study-plan";

import { studyPlansColumns } from "./_components/columns";
import { EmptyStudyPlans } from "./_components/empty";

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudyPlansList()
      .then((res) => {
        if (res && Array.isArray(res.items)) setPlans(res.items);
        else setPlans([]);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: plans,
    columns: studyPlansColumns,
    getRowId: (row: StudyPlan) => row.idPlanEstudios.toString(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Planes de estudio</h1>
      </div>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando planes de estudio...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : plans.length === 0 ? (
        <EmptyStudyPlans />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={studyPlansColumns} />
        </div>
      )}
    </div>
  );
}
