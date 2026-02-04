"use client";

import Link from "next/link";

import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Users,
  Gift,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinanzasDashboard as FinanzasDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { QuickActions } from "../shared/quick-actions";
import { StatCard, StatGrid } from "../shared/stat-card";

interface FinanzasDashboardProps {
  data: FinanzasDashboardType;
}

export function FinanzasDashboard({ data }: FinanzasDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
              Panel de Finanzas
            </h1>
            <p className="text-muted-foreground mt-1">Control financiero y cobranza</p>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-600">
            <DollarSign className="h-3 w-3 mr-1" />
            Finanzas
          </Badge>
        </div>
        <Separator />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Ingresos
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Ingresos Hoy"
            value={`$${data.ingresosDia.toLocaleString("es-MX")}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-emerald-600"
            link="/dashboard/cashier"
          />
          <StatCard
            title="Ingresos Semana"
            value={`$${data.ingresosSemana.toLocaleString("es-MX")}`}
            icon={TrendingUp}
            gradient="from-green-500 to-green-600"
            link="/dashboard/payments"
          />
          <StatCard
            title="Ingresos Mes"
            value={`$${data.ingresosMes.toLocaleString("es-MX")}`}
            icon={CreditCard}
            gradient="from-teal-500 to-teal-600"
            link="/dashboard/payments"
          />
          <StatCard
            title="Pagos Hoy"
            value={data.pagosHoy}
            description="Transacciones"
            icon={Receipt}
            gradient="from-cyan-500 to-cyan-600"
            link="/dashboard/cashier"
          />
        </StatGrid>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Cartera Vencida
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Deuda Total"
            value={`$${data.deudaTotal.toLocaleString("es-MX")}`}
            icon={AlertTriangle}
            gradient="from-red-500 to-red-600"
            link="/dashboard/invoices"
          />
          <StatCard
            title="Estudiantes Morosos"
            value={data.totalMorosos}
            icon={Users}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/invoices"
          />
          <StatCard
            title="Estudiantes con Beca"
            value={data.estudiantesConBeca}
            description={`$${data.totalBecasDelMes.toLocaleString("es-MX")} en becas`}
            icon={Gift}
            gradient="from-purple-500 to-purple-600"
          />
        </StatGrid>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Estado de Recibos
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Pendientes"
            value={data.recibosPendientes}
            icon={Clock}
            gradient="from-blue-500 to-blue-600"
            link="/dashboard/invoices"
          />
          <StatCard
            title="Vencidos"
            value={data.recibosVencidos}
            icon={XCircle}
            gradient="from-red-500 to-red-600"
            link="/dashboard/invoices"
          />
          <StatCard
            title="Pagados (Mes)"
            value={data.recibosPagados}
            icon={CheckCircle}
            gradient="from-emerald-500 to-emerald-600"
            link="/dashboard/invoices"
          />
        </StatGrid>
      </div>

      {data.topMorosos.length > 0 && (
        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  Top 10 Morosos
                </CardTitle>
                <CardDescription>Estudiantes con mayor adeudo</CardDescription>
              </div>
              <Link href="/dashboard/invoices">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto Adeudado</TableHead>
                  <TableHead className="text-right">Dias Vencido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topMorosos.map((moroso) => (
                  <TableRow key={moroso.idEstudiante}>
                    <TableCell className="font-mono">{moroso.matricula}</TableCell>
                    <TableCell>{moroso.nombreCompleto}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      ${moroso.montoAdeudado.toLocaleString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={moroso.diasVencido > 30 ? "destructive" : "secondary"}>
                        {moroso.diasVencido} dias
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard
          alerts={data.alertas}
          title="Alertas Financieras"
          description="Recibos y situaciones por atender"
        />
        <QuickActions actions={data.accionesRapidas} />
      </div>
    </div>
  );
}
