"use client";

import { useEffect, useState } from "react";

import { FileText, Upload, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getApplicantDocuments,
  getDocumentRequirements,
  uploadApplicantDocument,
  changeDocumentStatus,
} from "@/services/applicants-service";
import {
  AspiranteDocumentoDto,
  DocumentoRequisitoDto,
  EstatusDocumentoEnum,
  Applicant,
} from "@/types/applicant";

interface DocumentsManagementModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
}

interface DocumentRequirementCardProps {
  requirement: DocumentoRequisitoDto;
  document: AspiranteDocumentoDto | undefined;
  onUpload: (idDocumentoRequisito: number) => void;
  onValidate: (idDocumento: number, validar: boolean) => void;
  uploadingDocId: number | null;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  notas: string;
  setNotas: (notas: string) => void;
  getStatusIcon: (estatus: EstatusDocumentoEnum) => JSX.Element;
  getStatusText: (estatus: EstatusDocumentoEnum) => string;
}

function getStatusBadgeClass(estatus: EstatusDocumentoEnum): string {
  switch (estatus) {
    case EstatusDocumentoEnum.VALIDADO:
      return "bg-green-100 text-green-700";
    case EstatusDocumentoEnum.RECHAZADO:
      return "bg-red-100 text-red-700";
    case EstatusDocumentoEnum.SUBIDO:
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

interface DocumentActionsProps {
  doc: AspiranteDocumentoDto | undefined;
  reqId: number;
  isUploading: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  notas: string;
  setNotas: (notas: string) => void;
  onUpload: (id: number) => void;
  onValidate: (idDoc: number, valid: boolean) => void;
}

function DocumentActions({
  doc,
  reqId,
  isUploading,
  selectedFile,
  setSelectedFile,
  notas,
  setNotas,
  onUpload,
  onValidate,
}: DocumentActionsProps) {
  const isPending = !doc || doc.estatus === EstatusDocumentoEnum.PENDIENTE;
  const isSubido = doc?.estatus === EstatusDocumentoEnum.SUBIDO;

  if (isPending) {
    return (
      <div className="space-y-2">
        <Input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          disabled={isUploading}
          className="text-sm"
        />
        <Textarea
          placeholder="Notas (opcional)"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={isUploading}
          rows={2}
          className="text-sm"
        />
        <Button
          onClick={() => onUpload(reqId)}
          disabled={!selectedFile || isUploading}
          size="sm"
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Subiendo..." : "Subir"}
        </Button>
      </div>
    );
  }

  if (isSubido && doc) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => onValidate(doc.idAspiranteDocumento, true)}
          size="sm"
          variant="outline"
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Validar
        </Button>
        <Button
          onClick={() => onValidate(doc.idAspiranteDocumento, false)}
          size="sm"
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <XCircle className="mr-1 h-4 w-4" />
          Rechazar
        </Button>
      </div>
    );
  }

  if (doc?.urlArchivo) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <a href={doc.urlArchivo} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-1 h-4 w-4" />
            Ver
          </a>
        </Button>
      </div>
    );
  }

  return null;
}

function DocumentRequirementCard({
  requirement: req,
  document: doc,
  onUpload,
  onValidate,
  uploadingDocId,
  selectedFile,
  setSelectedFile,
  notas,
  setNotas,
  getStatusIcon,
  getStatusText,
}: DocumentRequirementCardProps) {
  const isUploading = uploadingDocId === req.idDocumentoRequisito;

  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {doc && getStatusIcon(doc.estatus)}
            <h4 className="font-semibold">
              {req.descripcion}
              {req.esObligatorio && <span className="ml-1 text-red-500">*</span>}
            </h4>
          </div>
          <p className="text-sm text-gray-500">Clave: {req.clave}</p>

          {doc && (
            <div className="mt-2">
              <p className="text-sm">
                <span className="font-medium">Estatus:</span>{" "}
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(doc.estatus)}`}>
                  {getStatusText(doc.estatus)}
                </span>
              </p>
              {doc.notas && (
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Notas:</span> {doc.notas}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col gap-2">
          <DocumentActions
            doc={doc}
            reqId={req.idDocumentoRequisito}
            isUploading={isUploading}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            notas={notas}
            setNotas={setNotas}
            onUpload={onUpload}
            onValidate={onValidate}
          />
        </div>
      </div>
    </div>
  );
}

export function DocumentsManagementModal({ open, applicant, onClose }: DocumentsManagementModalProps) {
  const [requirements, setRequirements] = useState<DocumentoRequisitoDto[]>([]);
  const [documents, setDocuments] = useState<AspiranteDocumentoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (open && applicant) {
      loadData();
    }
  }, [open, applicant]);

  const loadData = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      const [reqs, docs] = await Promise.all([
        getDocumentRequirements(),
        getApplicantDocuments(applicant.idAspirante),
      ]);
      setRequirements(reqs);
      setDocuments(docs);
    } catch (error) {
      toast.error("Error al cargar documentos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (idDocumentoRequisito: number) => {
    if (!selectedFile || !applicant) return;

    setUploadingDocId(idDocumentoRequisito);
    try {
      await uploadApplicantDocument({
        idAspirante: applicant.idAspirante,
        idDocumentoRequisito,
        archivo: selectedFile,
        notas: notas || undefined,
      });

      toast.success("Documento cargado exitosamente");
      setSelectedFile(null);
      setNotas("");
      loadData();
    } catch (error) {
      toast.error("Error al cargar documento");
      console.error(error);
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleValidate = async (idDocumento: number, validar: boolean) => {
    try {
      await changeDocumentStatus(idDocumento, {
        estatus: validar ? EstatusDocumentoEnum.VALIDADO : EstatusDocumentoEnum.RECHAZADO,
        notas: null,
      });

      toast.success(validar ? "Documento validado" : "Documento rechazado");
      loadData();
    } catch (error) {
      toast.error("Error al actualizar estatus");
      console.error(error);
    }
  };

  const getDocumentStatus = (reqId: number): AspiranteDocumentoDto | undefined => {
    return documents.find((d) => d.idDocumentoRequisito === reqId);
  };

  const getStatusIcon = (estatus: EstatusDocumentoEnum) => {
    switch (estatus) {
      case EstatusDocumentoEnum.VALIDADO:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case EstatusDocumentoEnum.RECHAZADO:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case EstatusDocumentoEnum.SUBIDO:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (estatus: EstatusDocumentoEnum) => {
    switch (estatus) {
      case EstatusDocumentoEnum.VALIDADO:
        return "Validado";
      case EstatusDocumentoEnum.RECHAZADO:
        return "Rechazado";
      case EstatusDocumentoEnum.SUBIDO:
        return "Subido";
      default:
        return "Pendiente";
    }
  };

  if (!applicant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Documentos - {applicant.nombreCompleto}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Cargando documentos...</div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <DocumentRequirementCard
                key={req.idDocumentoRequisito}
                requirement={req}
                document={getDocumentStatus(req.idDocumentoRequisito)}
                onUpload={handleUpload}
                onValidate={handleValidate}
                uploadingDocId={uploadingDocId}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                notas={notas}
                setNotas={setNotas}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}

            {requirements.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No hay requisitos de documentos configurados
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
