import { ExternalLink, User, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface IssuePanelProps {
  issueId: string;
}

export function IssuePanel({ issueId }: IssuePanelProps) {
  const { user } = useAuth();
  const [issue, setIssue] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIssue(null);
      if (!user) return;
      // issueId expected like "#123"
      const num = issueId?.replace("#", "");
      if (!num) return;
      setLoading(true);
      try {
        const ref = doc(db, "users", user.uid, "importedIssues", String(num));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setIssue(snap.data());
        } else {
          setIssue(null);
        }
      } catch (e) {
        setIssue(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [issueId, user]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Source Issue</h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <ExternalLink className="w-3 h-3" />
          View on GitHub
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading issue...</p>
        ) : !issue ? (
          <div className="text-sm text-muted-foreground">No imported issue found. Use GitHub Integration panel to import an issue first.</div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary">#{issue.number}</span>
            </div>

            <h2 className="text-lg font-semibold leading-tight">{issue.title}</h2>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {issue.user}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap leading-relaxed">
                {issue.body ?? "(no description)"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
