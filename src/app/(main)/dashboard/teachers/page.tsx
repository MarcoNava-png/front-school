"use client";

import { useEffect, useState } from "react";

import { CreateTeacherDialog } from "@/app/(main)/dashboard/teachers/_components/create-teacher-dialog";
import { UpdateTeacherDialog } from "@/app/(main)/dashboard/teachers/_components/update-teacher-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getCampusList } from "@/services/campus-service";
import { getCivilStatus, getGenresList } from "@/services/catalogs-service";
import { getStates } from "@/services/location-service";
import { getTeachersList } from "@/services/teacher-service";
import { Campus } from "@/types/campus";
import { CivilStatus, Genres } from "@/types/catalog";
import { State } from "@/types/location";
import { Teacher } from "@/types/teacher";

import { CampusSelect } from "./_components/campus-select";
import { teachersColumns } from "./_components/columns";
import { EmptyTeachers } from "./_components/empty";

export default function TeachersPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [civilStatus, setCivilStatus] = useState<CivilStatus[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [genres, setGenres] = useState<Genres[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    getCampusList().then((res) => setCampuses(res.items ?? []));
  }, []);

  useEffect(() => {
    if (selectedCampus) {
      setLoading(true);
      getTeachersList(selectedCampus)
        .then((res) => setTeachers(res.items ?? []))
        .catch(() => setError("Error de red"))
        .finally(() => setLoading(false));
    } else {
      setTeachers([]);
    }
  }, [selectedCampus]);

  useEffect(() => {
    getCivilStatus().then((res) => {
      setCivilStatus(res);
    });

    getStates().then((res) => {
      setStates(res);
    });

    getGenresList().then((res) => {
      setGenres(res);
    });
  }, []);

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpenUpdateDialog(true);
  };

  const table = useDataTableInstance({
    data: teachers,
    columns: teachersColumns(handleEdit),
    getRowId: (row: Teacher) => row.idProfesor.toString(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profesores</h1>
        {selectedCampus && (
          <Button type="button" onClick={() => setOpenCreateDialog(true)}>
            Nuevo Profesor
          </Button>
        )}
      </div>

      <div className="mb-4 w-full">
        <CampusSelect campuses={campuses} value={selectedCampus} onChange={setSelectedCampus} />
      </div>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando profesores...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyTeachers />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={teachersColumns(handleEdit)} />
        </div>
      )}
      <CreateTeacherDialog
        open={openCreateDialog}
        campusId={selectedCampus}
        genres={genres}
        states={states}
        civilStatus={civilStatus}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={(data) => {
          setOpenCreateDialog(false);
        }}
      />
      <UpdateTeacherDialog
        open={openUpdateDialog}
        teacher={selectedTeacher}
        campusId={selectedCampus}
        genres={genres}
        states={states}
        civilStatus={civilStatus}
        onClose={() => {
          setOpenUpdateDialog(false);
          setSelectedTeacher(null);
        }}
        onUpdate={(data) => {
          setOpenUpdateDialog(false);
          setSelectedTeacher(null);
        }}
      />
    </div>
  );
}
