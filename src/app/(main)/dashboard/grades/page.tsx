"use client";

import { useState } from "react";

import { Award, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { GruposAcordeon } from "./_components/grupos-acordeon";
import { SelectPlanEstudios } from "./_components/select-plan-estudios";

export default function GradesPage() {
  const [selectedPlanEstudios, setSelectedPlanEstudios] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <GraduationCap className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Calificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Captura y gestión de calificaciones por materia y parcial
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1" style={{ color: '#1e4a8f' }}>
              <BookOpen className="h-4 w-4" />
              Plan Seleccionado
            </CardDescription>
            <CardTitle className="text-lg truncate" style={{ color: '#14356F' }}>
              {selectedPlanEstudios ? "Activo" : "Ninguno"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <Award className="h-4 w-4" />
              Parciales
            </CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              3
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Escala
            </CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              0-10
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Aprobación
            </CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              7.0
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Seleccionar Plan de Estudios
          </CardTitle>
          <CardDescription>
            Selecciona el plan de estudios para ver los grupos y materias disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <SelectPlanEstudios
            value={selectedPlanEstudios}
            onChange={setSelectedPlanEstudios}
          />
        </CardContent>
      </Card>
      {selectedPlanEstudios ? (
        <GruposAcordeon planEstudiosId={selectedPlanEstudios} />
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  Selecciona un plan de estudios para comenzar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Los grupos se organizarán por cuatrimestre y podrás expandir cada uno para ver sus materias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
