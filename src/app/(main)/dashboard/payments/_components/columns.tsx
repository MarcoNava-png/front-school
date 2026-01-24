"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, User } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PagoDto } from "@/services/payments-service";

const estatusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Confirmado", variant: "default" },
  1: { label: "Rechazado", variant: "destructive" },
  2: { label: "Cancelado", variant: "destructive" },
};

export function getPaymentsColumns(
  onRefresh: () => void,
  onApplyPayment?: (pago: PagoDto) => void,
): ColumnDef<PagoDto>[] {
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
      accessorKey: "idPago",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <div className="font-medium">#{row.getValue("idPago")}</div>,
    },
    {
      accessorKey: "fechaPagoUtc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fechaPagoUtc"));
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
      id: "estudiante",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estudiante" />,
      cell: ({ row }) => {
        const matricula = row.original.matricula;
        const nombre = row.original.nombreEstudiante;

        if (!matricula && !nombre) {
          return <div className="text-muted-foreground text-sm">Sin asignar</div>;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-full">
              <User className="w-3 h-3 text-blue-700" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate max-w-[180px]" title={nombre ?? ""}>
                {nombre || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {matricula || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "concepto",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Concepto" />,
      cell: ({ row }) => {
        const concepto = row.original.concepto;
        const folioRecibo = row.original.folioRecibo;
        return (
          <div className="min-w-0">
            <div className="text-sm truncate max-w-[200px]" title={concepto ?? ""}>
              {concepto || "-"}
            </div>
            {folioRecibo && (
              <div className="text-xs text-muted-foreground font-mono">
                {folioRecibo}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "monto",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Monto" />,
      cell: ({ row }) => {
        const monto = parseFloat(row.getValue("monto"));
        const moneda = row.original.moneda || "MXN";
        return (
          <div className="font-semibold text-green-700">
            ${monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })} {moneda}
          </div>
        );
      },
    },
    {
      accessorKey: "idMedioPago",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Medio" />,
      cell: ({ row }) => {
        const medioPagoMap: Record<number, string> = {
          1: "Efectivo",
          2: "Tarjeta",
          3: "Transferencia",
          4: "Cheque",
        };
        const idMedioPago = row.getValue("idMedioPago");
        return <div className="text-sm">{medioPagoMap[idMedioPago as number] ?? "N/A"}</div>;
      },
    },
    {
      accessorKey: "estatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estatus" />,
      cell: ({ row }) => {
        const estatus = row.getValue("estatus");
        const estatusInfo = estatusMap[estatus as number] ?? { label: "Desconocido", variant: "outline" as const };
        return <Badge variant={estatusInfo.variant}>{estatusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <>
          {onApplyPayment && row.original.estatus === 0 && !row.original.matricula && (
            <Button variant="ghost" size="sm" onClick={() => onApplyPayment(row.original)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Aplicar a Recibo
            </Button>
          )}
          {row.original.matricula && (
            <Badge variant="outline" className="text-xs">
              Aplicado
            </Badge>
          )}
        </>
      ),
    },
  ];
}
