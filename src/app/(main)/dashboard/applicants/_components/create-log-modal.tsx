"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  const [medioContacto, setMedioContacto] = useState("");
  const [resumen, setResumen] = useState("");
  const [proximaAccion, setProximaAccion] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useCurrentUser();

  const handleCreate = async () => {
    setLoading(true);
    const payload: PayloadTrackingLog = {
      aspiranteId: Number(applicantId),
      usuarioAtiendeId: currentUser?.userId ?? "",
      medioContacto,
      resumen,
      proximaAccion,
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
        <div className="space-y-2">
          <Input
            value={medioContacto}
            onChange={(e) => setMedioContacto(e.target.value)}
            placeholder="Contact method"
          />
          <Input value={resumen} onChange={(e) => setResumen(e.target.value)} placeholder="Summary" />
          <Input value={proximaAccion} onChange={(e) => setProximaAccion(e.target.value)} placeholder="Next action" />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Saving..." : "Save log"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
