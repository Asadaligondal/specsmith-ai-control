import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

function getLastNDaysLabels(n: number) {
  const res: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    res.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }
  return res;
}

export function ProcessingChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<Array<{ date: string; processed: number; generated: number }>>(
    []
  );

  useEffect(() => {
    if (!user) {
      setChartData([]);
      return;
    }

    const labels = getLastNDaysLabels(7);
    const col = collection(db, "users", user.uid, "importedIssues");
    const q = query(col);
    const unsub = onSnapshot(q, (snap) => {
      const today = new Date();
      const baseDates = labels.map((l, idx) => {
        const d = new Date();
        d.setDate(today.getDate() - (labels.length - 1 - idx));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const newCounts = baseDates.map(() => ({ processed: 0, generated: 0 }));

      snap.docs.forEach((d) => {
        const data: any = d.data();
        if (data.importedAt && data.importedAt.toDate) {
          const imp = data.importedAt.toDate();
          baseDates.forEach((bd, idx) => {
            const next = new Date(bd);
            next.setDate(bd.getDate() + 1);
            if (imp >= bd && imp < next) {
              newCounts[idx].processed += 1;
            }
          });
        }
        if ((data.generatedAt && data.generatedAt.toDate) || data.requirementsGenerated) {
          const genDate = data.generatedAt && data.generatedAt.toDate ? data.generatedAt.toDate() : (data.generatedAt ? new Date(data.generatedAt) : null);
          if (genDate) {
            baseDates.forEach((bd, idx) => {
              const next = new Date(bd);
              next.setDate(bd.getDate() + 1);
              if (genDate >= bd && genDate < next) {
                newCounts[idx].generated += 1;
              }
            });
          }
        }
      });

      const out = labels.map((label, idx) => ({ date: label, processed: newCounts[idx].processed, generated: newCounts[idx].generated }));
      setChartData(out);
    });

    return () => unsub();
  }, [user]);

  const labels = getLastNDaysLabels(7);

  return (
    <div className="github-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-foreground">Issues Processed Over Time</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground font-medium">Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground font-medium">Requirements</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.length ? chartData : labels.map((l) => ({ date: l, processed: 0, generated: 0 }))}>
            <defs>
              <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(212, 92%, 43%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(212, 92%, 43%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(137, 55%, 15%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(137, 55%, 15%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area type="monotone" dataKey="processed" stroke="hsl(212, 92%, 43%)" strokeWidth={2} fillOpacity={1} fill="url(#colorProcessed)" />
            <Area type="monotone" dataKey="generated" stroke="hsl(137, 55%, 15%)" strokeWidth={2} fillOpacity={1} fill="url(#colorGenerated)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}