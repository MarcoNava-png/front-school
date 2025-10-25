"use client";

import { useEffect, useState } from "react";

import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef } from "@tanstack/react-table";

import { CustomModalDialog } from "@/app/(main)/dashboard/applicants/_components/create-applicant-modal";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";
import { Button } from "@/components/ui/button";
import { getApplicantsList } from "@/services/applicants-service";
import { Applicant } from "@/types/applicant";

const columns: ColumnDef<Applicant>[] = withDndColumn([
  {
    accessorKey: "idAspirante",
    header: "ID",
  },
  {
    accessorKey: "nombreCompleto",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    accessorKey: "aspiranteEstatus",
    header: "Estatus",
  },
  {
    accessorKey: "fechaRegistro",
    header: "Registro",
  },
]);

export default function Page() {
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getApplicantsList(pageIndex + 1, pageSize)
      .then((res) => {
        setData(res.items);
      })
      .finally(() => setLoading(false));
  }, [pageIndex, pageSize]);

  const table = useReactTable<Applicant>({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">Aspirantes</h2>
        <DataTableViewOptions table={table} />
        <Button onClick={() => setOpen(true)} variant="default">
          Crear aspirante
        </Button>
        <CustomModalDialog
          open={open}
          setOpen={setOpen}
          title="Crear aspirante"
          description="Aquí puedes crear un nuevo aspirante."
          actionText="Aceptar"
          cancelText="Cancelar"
        />
      </div>
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
      {loading && <div className="text-center">Cargando...</div>}
    </div>
  );
}
