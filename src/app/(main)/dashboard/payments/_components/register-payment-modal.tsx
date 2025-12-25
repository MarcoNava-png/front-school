"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getPaymentMethods } from "@/services/catalogs-service";
import { registrarPago, RegistrarPagoDto } from "@/services/payments-service";
import { PaymentMethod } from "@/types/catalog";

interface RegisterPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RegisterPaymentModal({ open, onOpenChange, onSuccess }: RegisterPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [formData, setFormData] = useState<RegistrarPagoDto>({
    fechaPagoUtc: new Date().toISOString(),
    idMedioPago: 1,
    monto: 0,
    moneda: "MXN",
    referencia: "",
    notas: "",
    estatus: 0,
  });

  useEffect(() => {
    if (open) {
      loadPaymentMethods();
      setFormData({
        fechaPagoUtc: new Date().toISOString(),
        idMedioPago: 1,
        monto: 0,
        moneda: "MXN",
        referencia: "",
        notas: "",
        estatus: 0,
      });
    }
  }, [open]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error("Error al cargar medios de pago");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);

    try {
      await registrarPago(formData);
      toast.success("Pago registrado exitosamente");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error registering payment:", error);
      toast.error("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>Registra un nuevo pago en el sistema</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha del Pago</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={new Date(formData.fechaPagoUtc).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaPagoUtc: new Date(e.target.value).toISOString(),
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monto: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medioPago">Medio de Pago</Label>
              <Select
                value={formData.idMedioPago.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    idMedioPago: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un medio" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.idMedioPago} value={method.idMedioPago.toString()}>
                      {method.descripcion ?? method.clave}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referencia">Referencia (opcional)</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referencia: e.target.value,
                  })
                }
                placeholder="Número de transacción, folio, etc."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notas: e.target.value,
                  })
                }
                placeholder="Información adicional del pago"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
