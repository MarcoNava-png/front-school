"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { AcademicPeriod } from "@/types/academic-period";

export const academicPeriodsColumns: ColumnDef<AcademicPeriod>[] = [
  {
    accessorKey: "idPeriodoAcademico",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("idPeriodoAcademico")}</div>,
  },
  {
    accessorKey: "clave",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clave" />,
    cell: ({ row }) => <div>{row.getValue("clave")}</div>,
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div>{row.getValue("nombre")}</div>,
  },
  {
    accessorKey: "periodicidad",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Periodicidad" />,
    cell: ({ row }) => <div>{row.getValue("periodicidad")}</div>,
  },
  {
    accessorKey: "fechaInicio",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Inicio" />,
    cell: ({ row }) => <div>{row.getValue("fechaInicio")}</div>,
  },
  {
    accessorKey: "fechaFin",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fin" />,
    cell: ({ row }) => <div>{row.getValue("fechaFin")}</div>,
  },
];
