"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Teacher } from "@/types/teacher";

export const teachersColumns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "idProfesor",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("idProfesor")}</div>,
  },
  {
    accessorKey: "noEmpleado",
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Empleado" />,
    cell: ({ row }) => <div>{row.getValue("noEmpleado")}</div>,
  },
  {
    accessorKey: "nombreCompleto",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div>{row.getValue("nombreCompleto")}</div>,
  },
  {
    accessorKey: "emailInstitucional",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email institucional" />,
    cell: ({ row }) => <div>{row.getValue("emailInstitucional")}</div>,
  },
];
