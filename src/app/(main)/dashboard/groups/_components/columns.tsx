"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Group } from "@/types/group";

export const groupsColumns: ColumnDef<Group>[] = [
  {
    accessorKey: "idGrupo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("idGrupo")}</div>,
  },
  {
    accessorKey: "planEstudios",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plan de estudios" />,
    cell: ({ row }) => <div>{row.getValue("planEstudios")}</div>,
  },
  {
    accessorKey: "periodoAcademico",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Periodo académico" />,
    cell: ({ row }) => <div>{row.getValue("periodoAcademico")}</div>,
  },
  {
    accessorKey: "numeroGrupo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Grupo" />,
    cell: ({ row }) => <div>{row.getValue("numeroGrupo")}</div>,
  },
  {
    accessorKey: "turno",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Turno" />,
    cell: ({ row }) => <div>{row.getValue("turno")}</div>,
  },
  {
    accessorKey: "capacidadMaxima",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Capacidad" />,
    cell: ({ row }) => <div>{row.getValue("capacidadMaxima")}</div>,
  },
];
