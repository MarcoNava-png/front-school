"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Receipt, ReceiptStatus } from "@/types/receipt";

const estatusMap: Record<
  ReceiptStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [ReceiptStatus.PENDIENTE]: { label: "Pendiente", variant: "secondary" },
  [ReceiptStatus.PARCIAL]: { label: "Parcial", variant: "outline" },
  [ReceiptStatus.PAGADO]: { label: "Pagado", variant: "default" },
  [ReceiptStatus.VENCIDO]: { label: "Vencido", variant: "destructive" },
  [ReceiptStatus.CANCELADO]: { label: "Cancelado", variant: "destructive" },
  [ReceiptStatus.BONIFICADO]: { label: "Bonificado", variant: "outline" },
};

export function getReceiptsColumns(onViewDetails: (receipt: Receipt) => void): ColumnDef<Receipt>[] {
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
      accessorKey: "fechaEmision",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Emisión" />,
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fechaEmision"));
        return (
          <div>
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
        const hoy = new Date();
        const isVencido = fecha < hoy && row.original.estatus === ReceiptStatus.PENDIENTE;
        return (
          <div className={isVencido ? "text-red-600 font-medium" : ""}>
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
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="font-semibold">
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
          <div className={saldo > 0 ? "font-semibold text-red-600" : "text-green-600"}>
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(saldo)}
          </div>
        );
      },
    },
    {
      accessorKey: "estatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estatus" />,
      cell: ({ row }) => {
        const estatus = row.getValue("estatus");
        const estatusInfo = estatusMap[estatus as ReceiptStatus] ?? { label: "Desconocido", variant: "outline" as const };
        return <Badge variant={estatusInfo.variant}>{estatusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(row.original)}>
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Button>
      ),
    },
  ];
}
