"use client";

import { BookOpen, Calendar } from "lucide-react";

import { InscripcionGrupoMateriaResponse } from "@/types/student";

interface InscriptionsListProps {
  inscriptions: InscripcionGrupoMateriaResponse[];
  loading: boolean;
}

function getStatusStyle(estado: string) {
  if (estado === "Inscrito") {
    return "bg-green-100 text-green-800";
  }
  if (estado === "Pendiente") {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-gray-100 text-gray-800";
}

export function InscriptionsList({ inscriptions, loading }: InscriptionsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Cargando inscripciones...
      </div>
    );
  }

  if (inscriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No hay inscripciones registradas</p>
        <p className="text-gray-500 text-sm mt-1">Haz clic en &quot;Nueva Inscripción&quot; para agregar materias</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inscriptions.map((inscription) => (
        <div key={inscription.idInscripcion} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{inscription.nombreMateria}</h3>
              <p className="text-sm text-gray-600">Grupo {inscription.grupo}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(inscription.estado)}`}>
              {inscription.estado}
            </span>
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>
                Inscrito:{" "}
                {new Date(inscription.fechaInscripcion).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
