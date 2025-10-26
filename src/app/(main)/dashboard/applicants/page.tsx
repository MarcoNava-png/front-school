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

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { AssignStudentModal } from "./_components/assign-student-modal";
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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [applicantToAssign, setApplicantToAssign] = useState<Applicant | null>(null);
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
    <div className="@container/main flex flex-col gap-4 space-y-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <h2 className="text-xl font-bold">Aspirantes</h2>
        <div className="ml-auto flex items-center gap-2">
          {/* <DataTableViewOptions table={table} /> */}
          <Input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre o email"
            className="min-w-[220px] rounded-[10px] border px-2 py-1 text-sm"
          />
          <Button onClick={() => setOpen(true)} variant="default">
            Crear aspirante
          </Button>
        </div>
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

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Estatus</th>
              <th className="px-4 py-2">Registro</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((applicant) => (
              <tr key={applicant.idAspirante}>
                <td className="px-4 py-2">{applicant.idAspirante}</td>
                <td className="px-4 py-2">{applicant.nombreCompleto}</td>
                <td className="px-4 py-2">{applicant.email}</td>
                <td className="px-4 py-2">{applicant.telefono}</td>
                <td className="px-4 py-2">{applicant.aspiranteEstatus}</td>
                <td className="px-4 py-2">{applicant.fechaRegistro}</td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setApplicantToAssign(applicant);
                      setAssignModalOpen(true);
                    }}
                  >
                    Asignar estudiante
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applicantToAssign && (
        <AssignStudentModal
          open={assignModalOpen}
          applicant={applicantToAssign}
          studyPlans={studyPlans}
          onClose={() => {
            setAssignModalOpen(false);
            setApplicantToAssign(null);
          }}
          onAssign={(studentData) => {
            setAssignModalOpen(false);
            setApplicantToAssign(null);
          }}
        />
      )}
      <DataTablePagination table={table} />
      {loading && <div className="text-center">Cargando...</div>}
    </div>
  );
}
