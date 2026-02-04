"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, RotateCcw } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ReciboExtendido } from "@/services/receipts-service";

const estatusColors: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Pendiente: { label: "Pendiente", variant: "secondary" },
  Parcial: { label: "Parcial", variant: "outline" },
  Pagado: { label: "Pagado", variant: "default" },
  Vencido: { label: "Vencido", variant: "destructive" },
  Cancelado: { label: "Cancelado", variant: "destructive" },
  Bonificado: { label: "Bonificado", variant: "outline" },
};

export function getReceiptsColumns(
  onViewDetails: (receipt: ReciboExtendido) => void,
  onCancelar?: (receipt: ReciboExtendido) => void,
  onReversar?: (receipt: ReciboExtendido) => void
): ColumnDef<ReciboExtendido>[] {
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
      accessorKey: "folio",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Folio" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("folio") ?? "-"}</div>,
    },
    {
      accessorKey: "matricula",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Matrícula" />,
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("matricula") ?? "-"}</div>
      ),
    },
    {
      accessorKey: "nombreCompleto",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estudiante" />,
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{row.getValue("nombreCompleto") ?? "-"}</div>
          {row.original.carrera && (
            <div className="text-xs text-muted-foreground truncate">{row.original.carrera}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "fechaEmision",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Emisión" />,
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fechaEmision"));
        return (
          <div className="text-sm">
            {fecha.toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "fechaVencimiento",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimiento" />,
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fechaVencimiento"));
        const isVencido = row.original.estaVencido;
        return (
          <div className={isVencido ? "text-red-600 font-medium text-sm" : "text-sm"}>
            {fecha.toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {isVencido && row.original.diasVencido > 0 && (
              <div className="text-xs">({row.original.diasVencido} días)</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="font-semibold text-right">
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(total)}
          </div>
        );
      },
    },
    {
      accessorKey: "saldo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Saldo" />,
      cell: ({ row }) => {
        const saldo = parseFloat(row.getValue("saldo"));
        return (
          <div className={`font-semibold text-right ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(saldo)}
          </div>
        );
      },
    },
    {
      accessorKey: "estatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estatus" />,
      cell: ({ row }) => {
        const estatus = row.getValue("estatus") as string;
        const estatusInfo = estatusColors[estatus] ?? { label: estatus, variant: "outline" as const };
        return <Badge variant={estatusInfo.variant}>{estatusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const estatus = row.original.estatus?.toLowerCase() || "";
        const puedeReversar = estatus === "pagado" || estatus === "parcial";
        const puedeCancelar = estatus !== "cancelado" && estatus !== "pagado";

        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(row.original)} title="Ver detalles">
              <Eye className="w-4 h-4" />
            </Button>
            {puedeReversar && onReversar && (
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                onClick={() => onReversar(row.original)}
                title="Reversar pago"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {puedeCancelar && onCancelar && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => onCancelar(row.original)}
                title="Cancelar recibo"
              >
                <Ban className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
