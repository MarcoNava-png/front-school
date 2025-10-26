"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getCampusList } from "@/services/campus-service";
import { getTeachersList } from "@/services/teacher-service";
import { Campus } from "@/types/campus";
import { Teacher } from "@/types/teacher";

import { CampusSelect } from "./_components/campus-select";
import { teachersColumns } from "./_components/columns";
import { EmptyTeachers } from "./_components/empty";

export default function TeachersPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCampusList().then((res) => setCampuses(res.items ?? []));
  }, []);

  useEffect(() => {
    if (selectedCampus) {
      setLoading(true);
      getTeachersList(selectedCampus)
        .then((res) => setTeachers(res.items ?? []))
        .catch(() => setError("Error de red"))
        .finally(() => setLoading(false));
    } else {
      setTeachers([]);
    }
  }, [selectedCampus]);

  const table = useDataTableInstance({
    data: teachers,
    columns: teachersColumns,
    getRowId: (row: Teacher) => row.idProfesor.toString(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profesores</h1>
      </div>
      <div className="mb-4 w-full">
        <CampusSelect campuses={campuses} value={selectedCampus} onChange={setSelectedCampus} />
      </div>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando profesores...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyTeachers />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={teachersColumns} />
        </div>
      )}
    </div>
  );
}
