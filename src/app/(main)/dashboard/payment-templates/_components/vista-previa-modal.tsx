"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/payment-utils";
import { PlantillaCobro } from "@/types/receipt";

interface Props {
  plantilla: PlantillaCobro;
  open: boolean;
  onClose: () => void;
}

export function VistaPreviaModal({ plantilla, open, onClose }: Props) {
  // Calcular vista previa de recibos
  const generarVistaPreviaRecibos = () => {
    const recibos = [];

    // Obtener fecha base del periodo o usar fecha actual
    let fechaBase: Date;
    if (plantilla.fechaVigenciaInicio) {
      // Parsear fecha evitando problemas de timezone
      const fechaParte = plantilla.fechaVigenciaInicio.split("T")[0];
      const [year, month, day] = fechaParte.split("-").map(Number);
      fechaBase = new Date(year, month - 1, day);
    } else {
      fechaBase = new Date();
    }

    for (let i = 0; i < plantilla.numeroRecibos; i++) {
      // Calcular fecha de vencimiento para este recibo
      const mes = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + i, plantilla.diaVencimiento);

      // Filtrar conceptos que aplican a este recibo
      // aplicaEnRecibo: null = todos, 1 = primero, -1 = último, N = recibo específico
      const numeroRecibo = i + 1;
      const conceptos = plantilla.detalles
        ?.filter((detalle) => {
          const aplicaEn = detalle.aplicaEnRecibo;
          // null o undefined = aplica a todos los recibos
          if (aplicaEn === null || aplicaEn === undefined) return true;
          // 1 = primer recibo
          if (aplicaEn === 1 && numeroRecibo === 1) return true;
          // -1 = último recibo
          if (aplicaEn === -1 && numeroRecibo === plantilla.numeroRecibos) return true;
          // Número específico
          if (aplicaEn === numeroRecibo) return true;
          return false;
        })
        .map((detalle) => ({
          nombre: detalle.descripcion || detalle.nombreConcepto || "Concepto",
          monto: detalle.importe ?? (detalle.cantidad * detalle.precioUnitario),
        })) || [];

      const total = conceptos.reduce((sum, c) => sum + (c.monto || 0), 0);

      recibos.push({
        numero: numeroRecibo,
        fecha: mes,
        conceptos,
        total,
      });
    }

    return recibos;
  };

  const recibos = generarVistaPreviaRecibos();
  const totalGeneral = recibos.reduce((sum, r) => sum + r.total, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa de Recibos</DialogTitle>
          <DialogDescription>{plantilla.nombrePlantilla}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{plantilla.numeroRecibos}</div>
                  <div className="text-sm text-muted-foreground">Recibos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {plantilla.detalles?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Conceptos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(totalGeneral)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Periodo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Recibos */}
          <div className="space-y-3">
            {recibos.map((recibo) => (
              <Card key={recibo.numero}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>Recibo #{recibo.numero}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Vence: {recibo.fecha.toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(recibo.total)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {recibo.conceptos.map((concepto, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm">{concepto.nombre}</span>
                        <span className="font-medium">{formatCurrency(concepto.monto)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Final */}
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total del Periodo Completo</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalGeneral)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
