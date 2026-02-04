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
import { Users } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { withDndColumn } from "@/components/data-table/table-utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Campus } from "@/types/campus";
import { ApplicantStatus, CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
import { State } from "@/types/location";
import { StudyPlan } from "@/types/study-plan";

import { ApplicantLogsModal } from "./_components/applicant-logs-modal";
import { ConveniosAspiranteModal } from "./_components/convenios-aspirante-modal";
import { CreateApplicantModal } from "./_components/create-applicant-modal";
import { DocumentsManagementModal } from "./_components/documents-management-modal";
import { EnrollStudentModal } from "./_components/enroll-student-modal";
import { ReceiptsManagementModal } from "./_components/receipts-management-modal";

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

const getStatusBadgeClass = (estatus: string) => {
  if (estatus === "Inscrito") return "bg-green-100 text-green-700";
  if (estatus === "Aceptado") return "bg-blue-100 text-blue-700";
  if (estatus === "Rechazado") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const getPaymentStatusBadgeClass = (estatus?: string) => {
  if (estatus === "PAGADO") return "bg-green-100 text-green-700";
  if (estatus === "PARCIAL") return "bg-yellow-100 text-yellow-700";
  if (estatus === "PENDIENTE") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-700";
};

const getDocumentStatusBadgeClass = (estatus?: string) => {
  if (estatus === "VALIDADO") return "bg-green-100 text-green-700";
  if (estatus === "COMPLETO") return "bg-blue-100 text-blue-700";
  return "bg-orange-100 text-orange-700";
};

function Page() {
  const [data, setData] = useState<Applicant[]>([]);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [applicantToEnroll, setApplicantToEnroll] = useState<Applicant | null>(null);
  const [bitacorasModalOpen, setBitacorasModalOpen] = useState(false);
  const [applicantForBitacoras, setApplicantForBitacoras] = useState<Applicant | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [applicantForDocuments, setApplicantForDocuments] = useState<Applicant | null>(null);
  const [receiptsModalOpen, setReceiptsModalOpen] = useState(false);
  const [applicantForReceipts, setApplicantForReceipts] = useState<Applicant | null>(null);
  const [conveniosModalOpen, setConveniosModalOpen] = useState(false);
  const [applicantForConvenios, setApplicantForConvenios] = useState<Applicant | null>(null);
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

  const loadApplicants = () => {
    const filterToSend: string | undefined = debouncedFilter.trim() === "" ? undefined : debouncedFilter;
    setLoading(true);
    getApplicantsList({ page: pageIndex + 1, pageSize, filter: filterToSend })
      .then((res: ApplicantsResponse) => {
        setData(res.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      loadApplicants();
    }, 500);
    return () => clearTimeout(handler);
  }, [pageIndex, pageSize, debouncedFilter]);

  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        const [genresData, civilStatusData, campusData, studyPlansData, contactMethodsData, schedulesData, applicantStatusData, statesData] = await Promise.all([
          getGenresList(),
          getCivilStatus(),
          getCampusList(),
          getStudyPlansList(),
          getContactMethods(),
          getSchedules(),
          getApplicantStatus(),
          getStates(),
        ]);

        setGenres(genresData);
        setCivilStatus(civilStatusData);
        setCampus(campusData.items);
        setStudyPlans(studyPlansData.items);
        setContactMethods(contactMethodsData);
        setSchedules(schedulesData);
        setApplicantStatus(applicantStatusData);
        setStates(statesData);
      } catch (error) {
        console.error("Error loading catalogs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <Users className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Aspirantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los aspirantes del proceso de admisión
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre o email"
            className="min-w-[220px] rounded-lg border px-3 py-2 text-sm focus-visible:ring-[#14356F]"
          />
          <Button
            onClick={() => setOpen(true)}
            className="text-white"
            style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
          >
            Crear aspirante
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Aspirantes</CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {data.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Inscriptos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {data.filter(a => a.aspiranteEstatus === "Inscrito").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Aceptados</CardDescription>
            <CardTitle className="text-4xl text-blue-700 dark:text-blue-300">
              {data.filter(a => a.aspiranteEstatus === "Aceptado").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 dark:text-yellow-400">Pendientes</CardDescription>
            <CardTitle className="text-4xl text-yellow-700 dark:text-yellow-300">
              {data.filter(a => a.aspiranteEstatus !== "Inscrito" && a.aspiranteEstatus !== "Aceptado" && a.aspiranteEstatus !== "Rechazado").length}
            </CardTitle>
          </CardHeader>
        </Card>
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
        onApplicantCreated={() => {
          loadApplicants();
        }}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead
              className="border-b"
              style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
            >
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white w-[50px]">ID</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white min-w-[180px]">Nombre</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white min-w-[150px]">Plan de Estudios</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white w-[95px]">Teléfono</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white w-[100px]">Estatus</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white w-[120px]">Registrado Por</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-white w-[85px]">Registro</th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-white w-[90px]">Pagos</th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-white w-[95px]">Documentos</th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-white w-[220px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {data.filter(applicant => applicant.aspiranteEstatus !== "Admitido").map((applicant) => (
              <tr key={applicant.idAspirante} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 text-gray-900 font-medium text-xs">{applicant.idAspirante}</td>
                <td className="px-2 py-2 text-gray-900">
                  <div className="font-medium text-xs leading-tight">{applicant.nombreCompleto}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{applicant.email}</div>
                </td>
                <td className="px-2 py-2 text-gray-700 text-xs">{applicant.planEstudios}</td>
                <td className="px-2 py-2 text-gray-700 text-xs">{applicant.telefono}</td>
                <td className="px-2 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(applicant.aspiranteEstatus)}`}>
                    {applicant.aspiranteEstatus}
                  </span>
                </td>
                <td className="px-2 py-2 text-gray-700 text-xs">
                  {applicant.usuarioRegistroNombre ? (
                    <span className="truncate block" title={applicant.usuarioRegistroNombre}>
                      {applicant.usuarioRegistroNombre}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-[10px]" title="No se tiene registro del usuario que creó este aspirante">
                      Sistema
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-gray-700 text-[10px]">{new Date(applicant.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                <td className="px-2 py-2 text-center">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getPaymentStatusBadgeClass(applicant.estatusPago)}`}>
                    {applicant.estatusPago ?? "SIN"}
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getDocumentStatusBadgeClass(applicant.estatusDocumentos)}`}>
                    {applicant.estatusDocumentos ?? "INCOMP"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setApplicantForDocuments(applicant);
                        setDocumentsModalOpen(true);
                      }}
                      title="Gestionar documentos"
                      className="h-6 px-1.5 text-[10px]"
                    >
                      Docs
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setApplicantForReceipts(applicant);
                        setReceiptsModalOpen(true);
                      }}
                      title="Ver recibos y pagos"
                      className="h-6 px-1.5 text-[10px]"
                    >
                      Pagos
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setApplicantForBitacoras(applicant);
                        setBitacorasModalOpen(true);
                      }}
                      title="Ver seguimiento"
                      className="h-6 px-1.5 text-[10px]"
                    >
                      Seg
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setApplicantForConvenios(applicant);
                        setConveniosModalOpen(true);
                      }}
                      title="Gestionar convenios/promociones"
                      className="h-6 px-1.5 text-[10px]"
                    >
                      Conv
                    </Button>

                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setApplicantToEnroll(applicant);
                        setEnrollModalOpen(true);
                      }}
                      title="Inscribir como estudiante"
                      className="h-6 px-1.5 text-[10px] text-white"
                      style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
                    >
                      Inscribir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EnrollStudentModal
        open={enrollModalOpen}
        applicant={applicantToEnroll}
        onClose={() => {
          setEnrollModalOpen(false);
          setApplicantToEnroll(null);
        }}
        onEnrollmentSuccess={() => {
          loadApplicants();
        }}
      />
      <ApplicantLogsModal
        open={bitacorasModalOpen}
        applicant={applicantForBitacoras}
        onClose={() => {
          setBitacorasModalOpen(false);
          setApplicantForBitacoras(null);
        }}
      />

      <DocumentsManagementModal
        open={documentsModalOpen}
        applicant={applicantForDocuments}
        onClose={() => {
          setDocumentsModalOpen(false);
          setApplicantForDocuments(null);
        }}
      />

      <ReceiptsManagementModal
        open={receiptsModalOpen}
        applicant={applicantForReceipts}
        onClose={() => {
          setReceiptsModalOpen(false);
          setApplicantForReceipts(null);
        }}
        onPaymentRegistered={() => {
          loadApplicants();
        }}
      />

      <ConveniosAspiranteModal
        open={conveniosModalOpen}
        applicant={applicantForConvenios}
        onClose={() => {
          setConveniosModalOpen(false);
          setApplicantForConvenios(null);
        }}
        onConvenioChanged={() => {
          loadApplicants();
        }}
      />

      <DataTablePagination table={table} />
      {loading && <div className="text-center">Cargando...</div>}
    </div>
  );
}

export default Page;
