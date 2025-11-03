"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getApplicantTrackingLogs } from "@/services/applicants-service";
import { Applicant, TrackingLog } from "@/types/applicant";

import { CreateLogModal } from "./create-log-modal";

interface ApplicantLogsModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
}

export function ApplicantLogsModal(props: ApplicantLogsModalProps) {
  const { open, applicant, onClose } = props;
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchLogs = () => {
    if (open && applicant?.idAspirante) {
      setLoading(true);
      getApplicantTrackingLogs(applicant.idAspirante)
        .then((res) => setLogs(res))
        .finally(() => setLoading(false));
    } else {
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [open, applicant]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar seguimiento para: {applicant?.nombreCompleto}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button className="mb-2" variant="default" size="sm" onClick={() => setCreateModalOpen(true)}>
            Crear registro
          </Button>
          {applicant?.idAspirante && (
            <CreateLogModal
              open={createModalOpen}
              applicantId={applicant.idAspirante}
              onClose={() => setCreateModalOpen(false)}
              onCreated={fetchLogs}
            />
          )}
          {loading ? (
            <div className="text-center text-sm">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground text-sm">No logs found.</div>
          ) : (
            <ul className="space-y-2">
              {logs.map((b: TrackingLog, idx: number) => (
                <li key={idx} className="bg-muted/40 rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold">
                      {new Date(b.fecha).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs">{b.medioContacto}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Usuario que atiende:</span> {b.usuarioAtiendeNombre}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Resumen:</span> {b.resumen}
                  </div>
                  <div>
                    <span className="font-medium">Próxima acción:</span> {b.proximaAccion}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
