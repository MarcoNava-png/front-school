export function LoadingState() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando datos iniciales...</p>
        <p className="text-gray-500 text-sm">Planes de estudio, períodos y estudiantes</p>
      </div>
    </div>
  );
}
