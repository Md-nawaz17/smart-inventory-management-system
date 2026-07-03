import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function ChartCard({ title, icon: Icon, subtitle, children }) {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Props:
 * stockByCategory = [{ category: "Electronics", quantity: 120 }]
 * stockTrend = [{ date: "Jun 1", value: 4200 }]
 * categoryDistribution = [{ category: "Electronics", value: 40 }]
 */
export default function AnalyticsCharts({
  stockByCategory = [],
  stockMovement = [],
  categoryDistribution = [],
}) {
  const axisTick = { fill: "#94a3b8", fontSize: 12 };
  const movement = useMemo(
    () =>
      stockMovement.map((item) => ({
        ...item,
        date: new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })),
    [stockMovement]
  );

  const distribution = useMemo(
    () => (categoryDistribution.length ? categoryDistribution : stockByCategory.map((d) => ({
      category: d.category,
      value: d.quantity,
    }))),
    [categoryDistribution, stockByCategory]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <ChartCard
        title="Stock by Category"
        subtitle="Current quantity across categories"
        icon={BarChart3}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stockByCategory} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <XAxis dataKey="category" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
            <Bar dataKey="quantity" name="Quantity" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Stock Movement"
        subtitle="Stock in and out over the last 30 days"
        icon={TrendingUp}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={movement} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="stockInFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stockOutFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="stockIn"
              name="Stock in"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#stockInFill)"
            />
            <Area
              type="monotone"
              dataKey="stockOut"
              name="Stock out"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#stockOutFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Category Distribution"
        subtitle="Share of total inventory"
        icon={PieChartIcon}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="category"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {distribution.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-slate-500 dark:text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
