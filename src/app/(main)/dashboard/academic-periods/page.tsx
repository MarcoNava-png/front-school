"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { AcademicPeriod } from "@/types/academic-period";

import { academicPeriodsColumns } from "./_components/columns";
import { EmptyAcademicPeriods } from "./_components/empty";

export default function AcademicPeriodsPage() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAcademicPeriodsList()
      .then((res) => {
        if (res && Array.isArray(res.items)) setPeriods(res.items);
        else setPeriods([]);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: periods,
    columns: academicPeriodsColumns,
    getRowId: (row: AcademicPeriod) => row.idPeriodoAcademico.toString(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Periodos académicos</h1>
      </div>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando periodos académicos...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : periods.length === 0 ? (
        <EmptyAcademicPeriods />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={academicPeriodsColumns} />
        </div>
      )}
    </div>
  );
}
