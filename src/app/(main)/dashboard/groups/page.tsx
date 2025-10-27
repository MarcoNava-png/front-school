"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grupos</h1>
        <CreateGroupDialog open={open} studyPlans={studyPlans} academicPeriods={academicPeriods} setOpen={setOpen} />
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
