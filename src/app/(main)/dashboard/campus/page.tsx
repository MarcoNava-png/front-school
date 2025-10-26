"use client";
import { useEffect, useState } from "react";

import { Edit } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getCampusList } from "@/services/campus-service";
import { getStates } from "@/services/location-service";
import { Campus, CampusResponse } from "@/types/campus";
import { State } from "@/types/location";

import { campusColumns } from "./_components/columns";
import { CreateCampusModal } from "./_components/create-campus-modal";
import { EditCampusModal } from "./_components/edit-campus-modal";

export default function Page() {
  const [campus, setCampus] = useState<CampusResponse | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [campusToEdit, setCampusToEdit] = useState<Campus | null>(null);

  useEffect(() => {
    getCampusList()
      .then((res) => {
        if (res.items) {
          setCampus(res);
        } else {
          setError("Error al cargar campus");
        }
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getStates()
      .then((res) => {
        if (res) {
          setStates(res);
        } else {
          setError("Error al cargar estados");
        }
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: campus?.items ?? [],
    columns: campusColumns,
    getRowId: (row) => row.idCampus.toString(),
  });

  const handleCreateCampus = async (campusCreated: Campus) => {
    try {
      setCampus((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: [...prev.items, campusCreated],
        };
      });
    } catch (err) {
      setError("Error al crear campus");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Cargando campus...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campus</h1>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={() => setModalOpen(true)} variant="default">
              Crear campus
            </Button>
            <CreateCampusModal
              open={modalOpen}
              states={states}
              onClose={() => setModalOpen(false)}
              onCreate={handleCreateCampus}
            />
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Clave</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Dirección</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campus?.items.map((c) => (
              <tr key={c.idCampus}>
                <td className="px-4 py-2">{c.claveCampus}</td>
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.direccion}</td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCampusToEdit(c);
                      setEditModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campusToEdit && (
          <EditCampusModal
            open={editModalOpen}
            campus={campusToEdit}
            states={states}
            onClose={() => {
              setEditModalOpen(false);
              setCampusToEdit(null);
            }}
            onUpdate={(updated) => {
              setCampus((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  items: prev.items.map((item) => (item.idCampus === updated.idCampus ? updated : item)),
                };
              });
              setEditModalOpen(false);
              setCampusToEdit(null);
            }}
          />
        )}
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
