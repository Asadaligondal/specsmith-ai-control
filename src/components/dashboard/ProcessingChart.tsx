import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "Mon", processed: 0, generated: 0 },
  { date: "Tue", processed: 0, generated: 0 },
  { date: "Wed", processed: 0, generated: 0 },
  { date: "Thu", processed: 0, generated: 0 },
  { date: "Fri", processed: 0, generated: 0 },
  { date: "Sat", processed: 0, generated: 0 },
  { date: "Sun", processed: 0, generated: 0 },
];

export function ProcessingChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Issues Processed vs. Time</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Requirements</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(238, 84%, 67%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(238, 84%, 67%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="processed"
              stroke="hsl(238, 84%, 67%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProcessed)"
            />
            <Area
              type="monotone"
              dataKey="generated"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGenerated)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
