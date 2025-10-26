"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { addApplicantTrackingLog } from "@/services/applicants-service";
import { PayloadTrackingLog } from "@/types/applicant";

interface CreateLogModalProps {
  open: boolean;
  applicantId: number | string;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateLogModal({ open, applicantId, onClose, onCreated }: CreateLogModalProps) {
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const form = useForm<Pick<PayloadTrackingLog, "medioContacto" | "resumen" | "proximaAccion">>({
    defaultValues: {
      medioContacto: "",
      resumen: "",
      proximaAccion: "",
    },
  });

  const handleSubmit = async (values: { medioContacto: string; resumen: string; proximaAccion: string }) => {
    setLoading(true);
    const payload: PayloadTrackingLog = {
      aspiranteId: Number(applicantId),
      usuarioAtiendeId: currentUser?.userId ?? "",
      medioContacto: values.medioContacto,
      resumen: values.resumen,
      proximaAccion: values.proximaAccion,
      fecha: new Date().toISOString(),
    };
    await addApplicantTrackingLog(payload);
    setLoading(false);
    if (onCreated) onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create applicant log</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="medioContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact method</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proximaAccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next action</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save log"}
              </Button>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
