"use client";

import { Users, UserPlus } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AlreadyInGroupModal } from "./_components/already-in-group-modal";
import { AvailableGroupsSection } from "./_components/available-groups-section";
import { EnrollmentResultModal } from "./_components/enrollment-result-modal";
import { FiltersSection } from "./_components/filters-section";
import { ForceEnrollDialog } from "./_components/force-enroll-dialog";
import { LoadingState } from "./_components/loading-state";
import { SelectedStudentBanner } from "./_components/selected-student-banner";
import { StudentsWithoutGroupList } from "./_components/students-without-group-list";
import { useGroupEnrollment } from "./_components/use-group-enrollment";

export default function GroupEnrollmentPage() {
  const {
    students,
    studyPlans,
    academicPeriods,
    availableGroups,
    selectedPlanId,
    setSelectedPlanId,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedStudentId,
    setSelectedStudentId,
    cuatrimestreFilter,
    setCuatrimestreFilter,
    loading,
    initialLoading,
    enrolling,
    enrollingGroupId,
    showResultModal,
    setShowResultModal,
    enrollmentResult,
    selectedStudent,
    selectedPlan,
    loadAvailableGroups,
    handleEnrollStudent,
    showForceEnrollDialog,
    handleForceEnrollConfirm,
    handleForceEnrollCancel,
    pendingEnrollment,
    showAlreadyInGroupModal,
    setShowAlreadyInGroupModal,
    alreadyInGroupInfo,
  } = useGroupEnrollment();

  if (initialLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            Inscripción a Grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Inscribe estudiantes nuevos a grupos completos (todas las materias del cuatrimestre)
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Estudiantes Pendientes</CardDescription>
            <CardTitle className="text-4xl text-blue-700 dark:text-blue-300">
              {students.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Grupos Disponibles</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {availableGroups.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Planes de Estudio</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {studyPlans.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">Periodos</CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              {academicPeriods.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filtros de Selección
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <FiltersSection
            studyPlans={studyPlans}
            academicPeriods={academicPeriods}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            selectedPeriodId={selectedPeriodId}
            setSelectedPeriodId={setSelectedPeriodId}
            cuatrimestreFilter={cuatrimestreFilter}
            setCuatrimestreFilter={setCuatrimestreFilter}
            loading={loading}
            loadAvailableGroups={loadAvailableGroups}
          />
        </div>
      </Card>
      <SelectedStudentBanner selectedStudent={selectedStudent} onClearSelection={() => setSelectedStudentId(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="border-b bg-muted/40">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Estudiantes sin Grupo
              </CardTitle>
              <CardDescription>
                {students.length} estudiantes pendientes de inscripción
              </CardDescription>
            </CardHeader>
            <div className="p-0">
              <StudentsWithoutGroupList
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                planName={selectedPlan?.nombrePlanEstudios}
              />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b bg-muted/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Grupos Disponibles
                  </CardTitle>
                  <CardDescription>
                    {availableGroups.length} grupos encontrados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="p-4">
              <AvailableGroupsSection
                availableGroups={availableGroups}
                selectedPlanId={selectedPlanId}
                selectedPeriodId={selectedPeriodId}
                loading={loading}
                cuatrimestreFilter={cuatrimestreFilter}
                selectedStudentId={selectedStudentId}
                enrolling={enrolling}
                enrollingGroupId={enrollingGroupId}
                onEnroll={handleEnrollStudent}
              />
            </div>
          </Card>
        </div>
      </div>
      {enrollmentResult && (
        <EnrollmentResultModal
          open={showResultModal}
          onOpenChange={setShowResultModal}
          result={enrollmentResult}
        />
      )}
      <ForceEnrollDialog
        open={showForceEnrollDialog}
        onConfirm={handleForceEnrollConfirm}
        onCancel={handleForceEnrollCancel}
        studentName={selectedStudent?.nombreCompleto}
        groupCode={pendingEnrollment?.codigoGrupo}
      />
      <AlreadyInGroupModal
        open={showAlreadyInGroupModal}
        onOpenChange={setShowAlreadyInGroupModal}
        studentName={alreadyInGroupInfo?.studentName}
        groupCode={alreadyInGroupInfo?.groupCode}
      />
    </div>
  );
}
