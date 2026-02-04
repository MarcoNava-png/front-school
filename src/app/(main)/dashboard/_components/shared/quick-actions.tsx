"use client";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Phone,
  PlusCircle,
  Receipt,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccionRapida } from "@/types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  "user-plus": UserPlus,
  dollar: DollarSign,
  receipt: Receipt,
  alert: AlertTriangle,
  file: FileText,
  book: BookOpen,
  clipboard: ClipboardList,
  check: CheckSquare,
  phone: Phone,
  chart: BarChart3,
  settings: Settings,
  "graduation-cap": GraduationCap,
  plus: PlusCircle,
};

interface QuickActionsProps {
  actions: AccionRapida[];
  title?: string;
  description?: string;
  className?: string;
}

export function QuickActions({
  actions,
  title = "Acciones Rapidas",
  description = "Accede a las funciones mas utilizadas",
  className,
}: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icono] || FileText;

          return (
            <Link key={index} href={action.link}>
              <Button
                variant="ghost"
                className="w-full justify-between group hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Icon className="h-4 w-4" />
                  </span>
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface QuickActionButtonProps {
  label: string;
  icon: string;
  link: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function QuickActionButton({
  label,
  icon,
  link,
  variant = "outline",
  size = "default",
}: QuickActionButtonProps) {
  const Icon = iconMap[icon] || FileText;

  return (
    <Link href={link}>
      <Button variant={variant} size={size} className="gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}

interface QuickActionGridProps {
  actions: AccionRapida[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActionGrid({ actions, columns = 2, className }: QuickActionGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {actions.map((action, index) => {
        const Icon = iconMap[action.icono] || FileText;

        return (
          <Link key={index} href={action.link}>
            <Card className="group hover:shadow-md transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
