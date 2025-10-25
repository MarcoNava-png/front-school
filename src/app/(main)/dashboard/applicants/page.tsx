"use client";

import { useEffect, useState } from "react";

import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, Table } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";
import { Button } from "@/components/ui/button";
import { getApplicantsList } from "@/services/applicants-service";
import { getCampusList } from "@/services/campus-service";
import { getCivilStatus, getContactMethods, getGenresList, getSchedules } from "@/services/catalogs-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { Applicant } from "@/types/applicant";
import { Campus } from "@/types/campus";
import { CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
import { StudyPlan } from "@/types/study-plan";

import { CreateApplicantModal } from "./_components/create-applicant-modal";

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
  const [genres, setGenres] = useState<Genres[]>([]);
  const [civilStatus, setCivilStatus] = useState<CivilStatus[]>([]);
  const [campus, setCampus] = useState<Campus[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getApplicantsList({ page: pageIndex + 1, pageSize, filter: "" })
      .then((res) => {
        setData(res.items);
      })
      .finally(() => setLoading(false));

    getGenresList()
      .then((res: Genres[]) => {
        setGenres(res);
      })
      .finally(() => setLoading(false));

    getCivilStatus()
      .then((res) => {
        setCivilStatus(res);
      })
      .finally(() => setLoading(false));

    getCampusList()
      .then((res) => {
        setCampus(res.items);
      })
      .finally(() => setLoading(false));

    getStudyPlansList()
      .then((res) => {
        setStudyPlans(res.items);
      })
      .finally(() => setLoading(false));

    getContactMethods()
      .then((res) => {
        setContactMethods(res);
      })
      .finally(() => setLoading(false));

    getSchedules()
      .then((res) => {
        setSchedules(res);
      })
      .finally(() => setLoading(false));
  }, [pageIndex, pageSize]);

  const filteredData: Applicant[] = filter
    ? data.filter(
        (item) =>
          item.nombreCompleto?.toLowerCase().includes(filter.toLowerCase()) ||
          item.email?.toLowerCase().includes(filter.toLowerCase()),
      )
    : data;

  const table: Table<Applicant> = useReactTable<Applicant>({
    data: filteredData,
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
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por nombre o email"
          className="rounded border px-2 py-1 text-sm"
        />
        <CreateApplicantModal
          open={open}
          genres={genres}
          civilStatus={civilStatus}
          campus={campus}
          studyPlans={studyPlans}
          contactMethods={contactMethods}
          schedules={schedules}
          onOpenChange={setOpen}
        />
      </div>
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
      {loading && <div className="text-center">Cargando...</div>}
    </div>
  );
}
