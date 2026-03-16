import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, PieChart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, type IssueCategory } from "@/lib/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  road_damage: "hsl(0 72% 51%)",
  garbage: "hsl(142 70% 40%)",
  streetlight: "hsl(42 100% 45%)",
  water_leak: "hsl(199 89% 48%)",
  graffiti: "hsl(280 60% 55%)",
  other: "hsl(220 10% 45%)",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "hsl(142 70% 40%)",
  medium: "hsl(42 100% 45%)",
  high: "hsl(25 95% 53%)",
  critical: "hsl(0 72% 51%)",
};

interface IssueRow {
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const Analytics = () => {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("issues")
        .select("category, status, priority, created_at, updated_at");
      setIssues((data as IssueRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  // Category breakdown
  const categoryData = Object.entries(
    issues.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([key, value]) => ({
    name: categoryLabels[key as IssueCategory] || key,
    value,
    fill: CATEGORY_COLORS[key] || CATEGORY_COLORS.other,
  }));

  // Priority distribution
  const priorityData = ["low", "medium", "high", "critical"].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    count: issues.filter((i) => i.priority === p).length,
    fill: PRIORITY_COLORS[p],
  }));

  // Monthly trend (last 6 months)
  const trendData = (() => {
    const months: { label: string; reported: number; resolved: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const reported = issues.filter((iss) => {
        const c = new Date(iss.created_at);
        return c.getFullYear() === y && c.getMonth() === m;
      }).length;
      const resolved = issues.filter((iss) => {
        if (iss.status !== "resolved") return false;
        const u = new Date(iss.updated_at);
        return u.getFullYear() === y && u.getMonth() === m;
      }).length;
      months.push({ label, reported, resolved });
    }
    return months;
  })();

  // Avg resolution time
  const resolvedIssues = issues.filter((i) => i.status === "resolved");
  const avgResolutionDays =
    resolvedIssues.length > 0
      ? (
          resolvedIssues.reduce((sum, i) => {
            return sum + (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime());
          }, 0) /
          resolvedIssues.length /
          86400000
        ).toFixed(1)
      : "—";

  const categoryChartConfig: ChartConfig = Object.fromEntries(
    categoryData.map((d) => [d.name, { label: d.name, color: d.fill }])
  );

  const trendChartConfig: ChartConfig = {
    reported: { label: "Reported", color: "hsl(199 89% 48%)" },
    resolved: { label: "Resolved", color: "hsl(142 70% 40%)" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-mono">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold font-heading text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground font-mono">Issue trends & insights</p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Issues", value: issues.length, icon: BarChart3 },
            { label: "Resolved", value: resolvedIssues.length, icon: PieChart },
            { label: "Avg Resolution", value: `${avgResolutionDays}d`, icon: Clock },
            { label: "Resolution Rate", value: issues.length > 0 ? `${Math.round((resolvedIssues.length / issues.length) * 100)}%` : "—", icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs font-mono">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category breakdown pie */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Issues by Category</h3>
            {categoryData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
            ) : (
              <ChartContainer config={categoryChartConfig} className="h-[280px]">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPie>
              </ChartContainer>
            )}
          </motion.div>

          {/* Priority distribution bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Priority Distribution</h3>
            <ChartContainer config={{ count: { label: "Issues" } }} className="h-[280px]">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </motion.div>

          {/* Monthly trend line */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6 md:col-span-2"
          >
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Monthly Trend (Last 6 Months)</h3>
            <ChartContainer config={trendChartConfig} className="h-[280px]">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="reported" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" stroke="hsl(142 70% 40%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
