"use client";

import Link from "next/link";

import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  link?: string;
  gradient?: string;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
  link,
  gradient = "from-blue-500 to-blue-600",
  className,
  valuePrefix = "",
  valueSuffix = "",
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-600 dark:hover:border-l-blue-400 overflow-hidden relative",
        link && "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          gradient
        )}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div
            className={cn(
              "p-2 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
              gradient
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {valuePrefix}
              {typeof value === "number" ? value.toLocaleString("es-MX") : value}
              {valueSuffix}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          {trend && (
            <Badge variant={trendUp ? "default" : "destructive"} className="gap-1">
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 3, className }: StatGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={cn("grid gap-4", gridCols[columns], className)}>{children}</div>;
}
