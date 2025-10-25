"use client";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getCampusList } from "@/services/campus-service";
import { CampusResponse } from "@/types/campus";

import { campusColumns } from "./_components/columns";

export default function Page() {
  const [campus, setCampus] = useState<CampusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCampusList()
      .then((res) => {
        if (res.items) {
          setCampus(res);
        } else {
          setError("Error al cargar campus");
        }
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: campus?.items ?? [],
    columns: campusColumns,
    getRowId: (row) => row.idCampus.toString(),
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Cargando campus...</div>
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
        <h1 className="text-2xl font-bold">Campus</h1>
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table} columns={campusColumns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
