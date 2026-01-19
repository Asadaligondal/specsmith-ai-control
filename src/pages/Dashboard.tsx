import {
  FileText,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProcessingChart } from "@/components/dashboard/ProcessingChart";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [generated, setGenerated] = useState(0);
  const [pendingApproval, setPendingApproval] = useState(0);

  useEffect(() => {
    if (!user) {
      setTotal(0);
      setGenerated(0);
      setPendingApproval(0);
      return;
    }
    const col = collection(db, "users", user.uid, "importedIssues");
    const q = query(col);
    const unsub = onSnapshot(q, (snap) => {
      let t = 0;
      let g = 0;
      let p = 0;
      snap.docs.forEach((d) => {
        const data: any = d.data();
        t++;
        if (data.requirementsGenerated) g++;
        if (data.requirementsGenerated && !data.requirementsApproved) p++;
      });
      setTotal(t);
      setGenerated(g);
      setPendingApproval(p);
    });
    return () => unsub();
  }, [user]);

  const metrics = [
    {
      title: "Total Issues Imported",
      value: total,
      change: "",
      changeType: "positive" as const,
      icon: FileText,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Requirements Generated",
      value: generated,
      change: "",
      changeType: "positive" as const,
      icon: CheckCircle2,
      iconColor: "bg-success/10 text-success",
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      change: "",
      changeType: "neutral" as const,
      icon: Clock,
      iconColor: "bg-warning/10 text-warning",
    },
    {
      title: "Time Saved (Hours)",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Zap,
      iconColor: "bg-agent-reviewer/10 text-agent-reviewer",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your AI agent activity and requirements generation</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProcessingChart />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
