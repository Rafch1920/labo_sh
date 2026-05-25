"use client";

import { useEffect, useState } from "react";
import { getAnalytics, getAuditLogs } from "@/features/admin/actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

export function AnalyticsDashboard() {
  const [data, setData] = useState<{
    total: number;
    ongoing: number;
    completed: number;
    rejected: number;
    genderDistribution: Record<string, number>;
    monthlyTrend: Record<number, number>;
  } | null>(null);

  const [logs, setLogs] = useState<{ id: string; created_at: string; profiles?: { full_name: string | null } | null; action: string }[]>([]);

  useEffect(() => {
    getAnalytics().then(setData);
    getAuditLogs().then(setLogs);
  }, []);

  if (!data) {
    return <p className="text-muted-foreground">Chargement...</p>;
  }

  const genderData = [
    { name: "Hommes", value: data.genderDistribution.male ?? 0 },
    { name: "Femmes", value: data.genderDistribution.female ?? 0 },
  ];

  const monthlyData = Object.entries(data.monthlyTrend).map(([month, count]) => ({
    month: MONTHS[parseInt(month)] ?? month,
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">En cours</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{data.ongoing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Terminées</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{data.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejetées</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{data.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendance mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par genre</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal d&apos;audit (100 derniers)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm max-h-64 overflow-y-auto space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 py-1 border-b last:border-0">
                <span className="text-muted-foreground shrink-0">
                  {new Date(log.created_at).toLocaleString("fr-FR")}
                </span>
                <span className="font-medium">{log.profiles?.full_name ?? "Système"}</span>
                <span className="text-muted-foreground">{log.action}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-muted-foreground">Aucune entrée d&apos;audit.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
