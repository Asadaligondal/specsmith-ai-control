import { Bot, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "builder" | "reviewer" | "system";
  message: string;
  time: string;
  status?: "success" | "warning" | "info";
}

const activities: Activity[] = [
  {
    id: "1",
    type: "builder",
    message: "Builder Agent analyzed Issue #402 and generated 5 requirements",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    type: "reviewer",
    message: "Reviewer Agent flagged ambiguity in Issue #309",
    time: "15 minutes ago",
    status: "warning",
  },
  {
    id: "3",
    type: "builder",
    message: "Builder Agent completed processing Issue #401",
    time: "32 minutes ago",
    status: "success",
  },
  {
    id: "4",
    type: "system",
    message: "New issue #403 imported from GitLab",
    time: "1 hour ago",
    status: "info",
  },
  {
    id: "5",
    type: "reviewer",
    message: "Reviewer Agent approved requirements for Issue #398",
    time: "2 hours ago",
    status: "success",
  },
];

export function ActivityFeed() {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                "p-2 rounded-lg shrink-0",
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
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
            {activity.status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            )}
            {activity.status === "warning" && (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
