"use client";

import { useEffect, useState } from "react";

import { Users } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { getGroupsList } from "@/services/group-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { AcademicPeriod } from "@/types/academic-period";
import { Group } from "@/types/group";
import { StudyPlan } from "@/types/study-plan";

import { groupsColumns } from "./_components/columns";
import { CreateGroupDialog } from "./_components/create-group-dialog";
import { EmptyGroups } from "./_components/empty";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGroupsList()
      .then((res) => setGroups(res.items ?? []))
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getStudyPlansList()
      .then((res) => setStudyPlans(res.items ?? []))
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));

    getAcademicPeriodsList()
      .then((res) => setAcademicPeriods(res.items ?? []))
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: groups,
    columns: groupsColumns,
    getRowId: (row: Group) => row.idGrupo.toString(),
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <Users className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de grupos académicos
          </p>
        </div>
        <CreateGroupDialog open={open} studyPlans={studyPlans} academicPeriods={academicPeriods} setOpen={setOpen} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Grupos</CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {groups.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Planes de Estudio</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {studyPlans.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Periodos</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {academicPeriods.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando grupos...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : groups.length === 0 ? (
        <EmptyGroups />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <DataTable table={table} columns={groupsColumns} />
        </div>
      )}
    </div>
  );
}
