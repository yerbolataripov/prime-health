"use client";

import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "./ui/Card";

export function ChartCard({
  title,
  description,
  height = 240,
  children,
  actions,
}: {
  title: string;
  description?: string;
  height?: number;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardBody>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children as any}
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

export function ChartTooltipContent({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-bg-card px-3 py-2 shadow-card text-xs">
      <div className="font-medium text-fg mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-fg-muted">{p.name}:</span>
          <span className="font-medium text-fg">
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
