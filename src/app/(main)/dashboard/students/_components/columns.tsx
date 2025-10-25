"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Student } from "@/types/student";

export const studentsColumns: ColumnDef<Student>[] = [
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
];
