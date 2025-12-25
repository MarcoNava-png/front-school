"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  DollarSign,
  UserCheck,
  FileText,
  ArrowRight,
  School,
  ClipboardList,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  link: string;
  gradient: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const stats: StatCard[] = [
    {
      title: "Estudiantes",
      value: "1,234",
      description: "Estudiantes activos",
      icon: <GraduationCap className="h-6 w-6" />,
      trend: "+12%",
      trendUp: true,
      link: "/dashboard/students",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Aspirantes",
      value: "89",
      description: "Solicitudes pendientes",
      icon: <UserCheck className="h-6 w-6" />,
      trend: "+5%",
      trendUp: true,
      link: "/dashboard/applicants",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Profesores",
      value: "156",
      description: "Docentes activos",
      icon: <Users className="h-6 w-6" />,
      trend: "+3%",
      trendUp: true,
      link: "/dashboard/teachers",
      gradient: "from-violet-500 to-violet-600",
    },
    {
      title: "Grupos",
      value: "48",
      description: "Grupos activos",
      icon: <School className="h-6 w-6" />,
      trend: "+8%",
      trendUp: true,
      link: "/dashboard/groups",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Colegiaturas",
      value: "$458K",
      description: "Recaudado este mes",
      icon: <DollarSign className="h-6 w-6" />,
      trend: "+15%",
      trendUp: true,
      link: "/dashboard/payments",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Asistencias",
      value: "94.5%",
      description: "Promedio este periodo",
      icon: <ClipboardList className="h-6 w-6" />,
      trend: "+2.1%",
      trendUp: true,
      link: "/dashboard/attendances",
      gradient: "from-cyan-500 to-cyan-600",
    },
  ];

  const quickActions = [
    { label: "Inscribir Estudiante", icon: <GraduationCap className="h-4 w-4" />, link: "/dashboard/inscriptions" },
    { label: "Registrar Pago", icon: <DollarSign className="h-4 w-4" />, link: "/dashboard/payments" },
    { label: "Capturar Calificaciones", icon: <FileText className="h-4 w-4" />, link: "/dashboard/grades" },
    { label: "Ver Horarios", icon: <Calendar className="h-4 w-4" />, link: "/dashboard/schedules" },
  ];

  const recentActivities = [
    {
      title: "Nueva inscripción",
      description: "Juan Pérez inscrito en Ing. Sistemas",
      time: "Hace 5 minutos",
      type: "success",
    },
    {
      title: "Pago registrado",
      description: "Colegiatura de María García procesada",
      time: "Hace 15 minutos",
      type: "success",
    },
    {
      title: "Calificaciones capturadas",
      description: "Prof. López actualizó calificaciones de Matemáticas",
      time: "Hace 1 hora",
      type: "info",
    },
    {
      title: "Periodo académico",
      description: "Nuevo periodo iniciará en 5 días",
      time: "Hace 2 horas",
      type: "warning",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, <span className="font-medium text-foreground">{user?.nombres || "Usuario"}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{currentTime.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="text-sm text-muted-foreground">{currentTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-600 dark:hover:border-l-blue-400 cursor-pointer overflow-hidden relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  {stat.trend && (
                    <Badge variant={stat.trendUp ? "default" : "destructive"} className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Accede a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Button
                  variant="ghost"
                  className="w-full justify-between group hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      {action.icon}
                    </span>
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-4 last:pb-0 border-b last:border-0">
                  <div className={`
                    w-2 h-2 rounded-full mt-2 flex-shrink-0
                    ${activity.type === "success" ? "bg-emerald-500" : ""}
                    ${activity.type === "info" ? "bg-blue-500" : ""}
                    ${activity.type === "warning" ? "bg-amber-500" : ""}
                  `} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Period Info */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Periodo Académico Actual</CardTitle>
              <CardDescription className="text-base">Ciclo Escolar 2024-2025</CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
              Cuatrimestre 3
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha de inicio</p>
              <p className="text-lg font-semibold">15 de Septiembre, 2024</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha de término</p>
              <p className="text-lg font-semibold">15 de Diciembre, 2024</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Días restantes</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">45 días</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
