"use client";

import Link from "next/link";

import { AlertCircle, AlertTriangle, CheckCircle, Info, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Alerta } from "@/types/dashboard";

interface AlertCardProps {
  alerts: Alerta[];
  title?: string;
  description?: string;
  maxAlerts?: number;
  className?: string;
}

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const alertColors = {
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  success: "bg-emerald-500",
};

const alertBgColors = {
  warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
};

export function AlertCard({
  alerts,
  title = "Alertas",
  description = "Notificaciones importantes",
  maxAlerts = 5,
  className,
}: AlertCardProps) {
  const displayAlerts = alerts.slice(0, maxAlerts);

  if (alerts.length === 0) {
    return (
      <Card className={cn("border-2", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
            <p className="text-muted-foreground">No hay alertas pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          {title}
          {alerts.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {alerts.length} {alerts.length === 1 ? "alerta" : "alertas"}
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.map((alert, index) => {
          const Icon = alertIcons[alert.tipo];
          const content = (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border transition-all",
                alertBgColors[alert.tipo],
                alert.link && "cursor-pointer hover:shadow-md group"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", alertColors[alert.tipo])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium leading-none">{alert.titulo}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.mensaje}</p>
                  {alert.fecha && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.fecha).toLocaleDateString("es-MX")}
                    </p>
                  )}
                </div>
                {alert.link && (
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </div>
            </div>
          );

          if (alert.link) {
            return (
              <Link key={index} href={alert.link}>
                {content}
              </Link>
            );
          }

          return content;
        })}
        {alerts.length > maxAlerts && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{alerts.length - maxAlerts} alertas adicionales
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertBadgeProps {
  type: Alerta["tipo"];
  children: React.ReactNode;
}

export function AlertBadge({ type, children }: AlertBadgeProps) {
  const Icon = alertIcons[type];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        type === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        type === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        type === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      )}
    >
      <Icon className="h-3 w-3" />
      {children}
    </div>
  );
}
