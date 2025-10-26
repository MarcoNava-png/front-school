"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { MatterPlan } from "@/types/matter-plan";

export const subjectsColumns: ColumnDef<MatterPlan>[] = [
  {
    accessorKey: "idMateriaPlan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("idMateriaPlan")}</div>,
  },
  {
    accessorKey: "materia",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Materia" />,
    cell: ({ row }) => <div>{row.getValue("materia")}</div>,
  },
  {
    accessorKey: "nombrePlanEstudios",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plan de estudios" />,
    cell: ({ row }) => <div>{row.getValue("nombrePlanEstudios")}</div>,
  },
  {
    accessorKey: "cuatrimestre",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuatrimestre" />,
    cell: ({ row }) => <div>{row.getValue("cuatrimestre")}</div>,
  },
  {
    accessorKey: "esOptativa",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Optativa" />,
    cell: ({ row }) => <div>{row.getValue("esOptativa") ? "Sí" : "No"}</div>,
  },
];
