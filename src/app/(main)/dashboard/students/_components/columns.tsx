"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, GraduationCap, DollarSign, CheckCircle, XCircle, FileText } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { listReceiptsByPeriod } from "@/services/receipts-service";
import { Student } from "@/types/student";

import { EnrollGrupoMateriaModal } from "./enroll-grupomateria-modal";
import { StudentDocumentsModal } from "./student-documents-modal";
import { StudentPaymentsModal } from "./student-payments-modal";

interface ActionsCellProps {
  student: Student;
  onRefresh: () => void;
  currentPeriodId?: number;
}

function ActionsCell({ student, onRefresh, currentPeriodId }: ActionsCellProps) {
  const [openEnroll, setOpenEnroll] = useState(false);
  const [openPayments, setOpenPayments] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [pagosPendientes, setPagosPendientes] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (currentPeriodId) {
      checkPaymentStatus();
    }
  }, [currentPeriodId, student.idEstudiante]);

  const checkPaymentStatus = async () => {
    if (!currentPeriodId) return;

    try {
      const receipts = await listReceiptsByPeriod(currentPeriodId, student.idEstudiante);
      const totalDeuda = receipts.reduce((sum, r) => sum + r.saldo, 0);
      setPagosPendientes(totalDeuda > 0);
    } catch (error) {
      console.error("Error al verificar estado de pagos:", error);
      setPagosPendientes(null);
    }
  };

  return (
    <div className="flex justify-center gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/dashboard/students/${student.idEstudiante}/kardex`)}
        title="Ver kárdex"
        className="h-8 px-2"
      >
        <GraduationCap className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpenPayments(true)}
        title={pagosPendientes === null ? "Ver estado de pagos" : pagosPendientes ? "Tiene pagos pendientes" : "Pagos al día"}
        className={`h-8 px-2 ${
          pagosPendientes === null
            ? "border-gray-300 text-gray-600"
            : pagosPendientes
            ? "border-red-300 text-red-600"
            : "border-green-300 text-green-600"
        }`}
      >
        {pagosPendientes === null ? (
          <DollarSign className="w-3 h-3" />
        ) : pagosPendientes ? (
          <XCircle className="w-3 h-3" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpenEnroll(true)}
        title="Inscribir a materia"
        className="h-8 px-2"
      >
        <BookOpen className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpenDocuments(true)}
        title="Documentos (Constancias/Kardex)"
        className="h-8 px-2"
      >
        <FileText className="w-3 h-3" />
      </Button>
      <EnrollGrupoMateriaModal
        open={openEnroll}
        studentId={student.idEstudiante}
        studentName={student.nombreCompleto}
        onClose={() => setOpenEnroll(false)}
        onEnrollmentSuccess={() => {
          onRefresh();
        }}
      />
      <StudentPaymentsModal
        open={openPayments}
        onClose={() => setOpenPayments(false)}
        studentId={student.idEstudiante}
        studentName={student.nombreCompleto}
        currentPeriodId={currentPeriodId}
      />
      <StudentDocumentsModal
        open={openDocuments}
        onClose={() => setOpenDocuments(false)}
        studentId={student.idEstudiante}
        studentName={student.nombreCompleto}
      />
    </div>
  );
}

export function getStudentsColumns(onRefresh: () => void, currentPeriodId?: number): ColumnDef<Student>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "matricula",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Matrícula" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("matricula")}</div>,
    },
    {
      accessorKey: "nombreCompleto",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <div>{row.getValue("nombreCompleto")}</div>,
    },
    {
      accessorKey: "grupo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Grupo" />,
      cell: () => {
        return <div className="text-center">
          <Badge variant="outline">-</Badge>
        </div>;
      },
    },
    {
      accessorKey: "planEstudios",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plan de estudios" />,
      cell: ({ row }) => <div>{row.getValue("planEstudios")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => <ActionsCell student={row.original} onRefresh={onRefresh} currentPeriodId={currentPeriodId} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
