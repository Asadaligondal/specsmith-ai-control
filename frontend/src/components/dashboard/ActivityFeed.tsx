import { Bot, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Activity {
  id: string;
  type: "builder" | "reviewer" | "system";
  message: string;
  time: string;
  status?: "success" | "warning" | "info";
}

export function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      return;
    }

    const col = collection(db, "users", user.uid, "importedIssues");
    const q = query(col, orderBy("importedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Activity[] = [];
      snap.docs.forEach((d) => {
        const data: any = d.data();
        const id = d.id;
        const num = data.number ?? id;

        if (data.importedAt) {
          const t = data.importedAt.toDate ? data.importedAt.toDate().toLocaleString() : String(data.importedAt);
          items.push({ id: `import-${id}`, type: "system", message: `Imported issue #${num}: ${data.title ?? "(no title)"}`, time: t, status: "info" });
        }

        if (data.generatedAt || data.requirementsGenerated) {
          const t = (data.generatedAt && data.generatedAt.toDate) ? data.generatedAt.toDate().toLocaleString() : (data.generatedAt ? String(data.generatedAt) : new Date().toLocaleString());
          items.push({ id: `gen-${id}`, type: "builder", message: `Requirements generated for #${num}`, time: t, status: "success" });
        }

        if (data.requirementsApproved) {
          const t = data.approvedAt && data.approvedAt.toDate ? data.approvedAt.toDate().toLocaleString() : new Date().toLocaleString();
          items.push({ id: `app-${id}`, type: "reviewer", message: `Requirements approved for #${num}`, time: t, status: "success" });
        }
      });

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(items.slice(0, 10));
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="github-card animate-slide-up">
      <h3 className="text-base font-semibold mb-4 text-foreground">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        )}
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
            <div
              className={cn(
                "p-2 rounded-md shrink-0",
                activity.type === "builder" && "bg-agent-builder/10 text-agent-builder",
                activity.type === "reviewer" && "bg-agent-reviewer/10 text-agent-reviewer",
                activity.type === "system" && "bg-muted text-muted-foreground"
              )}
            >
              {activity.type === "system" ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
            {activity.status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            )}
            {activity.status === "warning" && (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}