"use client";

export default function TeachersPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profesores</h1>
      </div>
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Contenido de profesores próximamente...</div>
      </div>
    </div>
  );
}
