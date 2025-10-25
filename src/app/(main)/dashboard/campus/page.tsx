"use client";

import { useEffect, useState } from "react";

import { getCampusList } from "@/services/campus-service";
import { CampusData } from "@/types/campus";

export default function Page() {
  const [campus, setCampus] = useState<CampusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Cargando campus...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1>Campus</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Clave campus</th>
          </tr>
        </thead>
        <tbody>
          {campus?.items.map((c) => (
            <tr key={c.idCampus}>
              <td>{c.idCampus}</td>
              <td>{c.nombre}</td>
              <td>{c.direccion}</td>
              <td>{c.claveCampus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
