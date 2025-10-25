"use client";

import { useEffect, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  Table,
  Updater,
  PaginationState,
} from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";
import { Button } from "@/components/ui/button";
import { getApplicantsList } from "@/services/applicants-service";
import { getCampusList } from "@/services/campus-service";
import {
  getApplicantStatus,
  getCivilStatus,
  getContactMethods,
  getGenresList,
  getSchedules,
} from "@/services/catalogs-service";
import { getStates } from "@/services/location-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { Applicant, ApplicantsResponse } from "@/types/applicant";
import { Campus, CampusResponse } from "@/types/campus";
import { ApplicantStatus, CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
import { State } from "@/types/location";
import { StudyPlan, StudyPlansResponse } from "@/types/study-plan";

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
  const [applicantStatus, setApplicantStatus] = useState<ApplicantStatus[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      const filterToSend: string | undefined = debouncedFilter.trim() === "" ? undefined : debouncedFilter;
      setLoading(true);
      getApplicantsList({ page: pageIndex + 1, pageSize, filter: filterToSend })
        .then((res: ApplicantsResponse) => {
          setData(res.items);
        })
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(handler);
  }, [pageIndex, pageSize, debouncedFilter]);

  useEffect(() => {
    setLoading(true);

    getGenresList()
      .then((res: Genres[]) => {
        setGenres(res);
      })
      .finally(() => setLoading(false));

    getCivilStatus()
      .then((res: CivilStatus[]) => {
        setCivilStatus(res);
      })
      .finally(() => setLoading(false));

    getCampusList()
      .then((res: CampusResponse) => {
        setCampus(res.items);
      })
      .finally(() => setLoading(false));

    getStudyPlansList()
      .then((res: StudyPlansResponse) => {
        setStudyPlans(res.items);
      })
      .finally(() => setLoading(false));

    getContactMethods()
      .then((res: ContactMethod[]) => {
        setContactMethods(res);
      })
      .finally(() => setLoading(false));

    getSchedules()
      .then((res: Schedule[]) => {
        setSchedules(res);
      })
      .finally(() => setLoading(false));

    getApplicantStatus()
      .then((res: ApplicantStatus[]) => {
        setApplicantStatus(res);
      })
      .finally(() => setLoading(false));

    getStates()
      .then((res: State[]) => {
        setStates(res);
      })
      .finally(() => setLoading(false));
  }, []);

  const table: Table<Applicant> = useReactTable<Applicant>({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater: Updater<PaginationState>) => {
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
          applicantStatus={applicantStatus}
          states={states}
          onOpenChange={setOpen}
        />
      </div>
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
      {loading && <div className="text-center">Cargando...</div>}
    </div>
  );
}
