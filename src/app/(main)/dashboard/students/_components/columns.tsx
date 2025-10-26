"use client";

import { useState } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MatterPlan } from "@/types/matter-plan";
import { Student } from "@/types/student";

import { InscribeStudentModal } from "./inscribe-student-modal";

function ActionsCell({ student, matterPlans }: { student: Student; matterPlans: MatterPlan[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Inscribir
      </Button>
      <InscribeStudentModal
        open={open}
        onOpenChange={setOpen}
        studentId={student.idEstudiante}
        matterPlans={matterPlans}
      />
    </div>
  );
}

export function getStudentsColumns(matterPlans: MatterPlan[]): ColumnDef<Student>[] {
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
      accessorKey: "telefono",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => <div>{row.getValue("telefono") ?? "-"}</div>,
    },
    {
      accessorKey: "planEstudios",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plan de estudios" />,
      cell: ({ row }) => <div>{row.getValue("planEstudios")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => <ActionsCell student={row.original} matterPlans={matterPlans} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
