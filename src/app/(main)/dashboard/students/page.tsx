"use client";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getMatterPlanList } from "@/services/matter-plan-service";
import { getStudentsList } from "@/services/students-service";
import { MatterPlan } from "@/types/matter-plan";
import { StudentsResponse } from "@/types/student";

import { getStudentsColumns } from "./_components/columns";
import { CreateStudentModal } from "./_components/create-student-modal";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<StudentsResponse | null>(null);
  const [matterPlans, setMatterPlans] = useState<MatterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentsList()
      .then((res) => {
        setStudents(res);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getMatterPlanList()
      .then((res) => {
        setMatterPlans(res);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: students?.items ?? [],
    columns: getStudentsColumns(matterPlans),
    getRowId: (row) => row.idEstudiante.toString(),
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Cargando estudiantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inscripciones</h1>
        <div className="flex gap-2">
          {/* <Button onClick={() => setOpen(true)} variant="default">
            Crear estudiante
          </Button> */}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <CreateStudentModal open={open} onOpenChange={setOpen} />
      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table} columns={getStudentsColumns(matterPlans)} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
