"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { StudyPlan } from "@/types/study-plan";

export const studyPlansColumns: ColumnDef<StudyPlan>[] = [
  {
    accessorKey: "idPlanEstudios",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("idPlanEstudios")}</div>,
  },
  {
    accessorKey: "clavePlanEstudios",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clave" />,
    cell: ({ row }) => <div>{row.getValue("clavePlanEstudios")}</div>,
  },
  {
    accessorKey: "nombrePlanEstudios",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div>{row.getValue("nombrePlanEstudios")}</div>,
  },
  {
    accessorKey: "rvoe",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RVOE" />,
    cell: ({ row }) => <div>{row.getValue("rvoe")}</div>,
  },
  {
    accessorKey: "version",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Versión" />,
    cell: ({ row }) => <div>{row.getValue("version")}</div>,
  },
  {
    accessorKey: "duracionMeses",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duración (meses)" />,
    cell: ({ row }) => <div>{row.getValue("duracionMeses")}</div>,
  },
];
