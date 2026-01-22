import { Check, X, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function OutputPanel() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue") || "";
  const { user } = useAuth();
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !issueId) return;
    const num = issueId.replace("#", "");
    setOutput(null);
    setLoading(true);
    const ref = doc(db, "users", user.uid, "importedIssues", String(num));
    const unsub = onSnapshot(ref, (snap) => {
      try {
        if (!snap.exists()) {
          setOutput(null);
          setLoading(false);
          return;
        }
        const data: any = snap.data();
        const gen = data.generatedOutput ?? null;
        if (!gen) {
          setOutput(null);
        } else if (typeof gen === "string") {
          setOutput(gen);
        } else if (typeof gen === "object") {
          const reviewer = gen.reviewer ?? gen.reviewerOutput ?? gen.spec ?? null;
          const builder = gen.builder ?? gen.builderOutput ?? null;
          if (reviewer && builder) {
            setOutput(`Builder:\n${builder}\n\nReviewer:\n${reviewer}`);
          } else if (reviewer) {
            setOutput(String(reviewer));
          } else if (builder) {
            setOutput(String(builder));
          } else {
            try {
              setOutput(JSON.stringify(gen, null, 2));
            } catch (e) {
              setOutput(String(gen));
            }
          }
        } else {
          setOutput(String(gen));
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [issueId, user]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied to clipboard", description: "Requirements copied." });
  };

  const handleApprove = () => {
    if (!user || !issueId) {
      toast({ title: "No issue", description: "Open an issue before approving." });
      return;
    }
    const num = issueId.replace("#", "");
    const ref = doc(db, "users", user.uid, "importedIssues", String(num));
    updateDoc(ref, { requirementsApproved: true, approvedAt: serverTimestamp(), status: "completed" })
      .then(() => toast({ title: "Requirements Approved", description: "Marked as approved." }))
      .catch((err) => toast({ title: "Approval failed", description: String(err) }));
  };

  const handleReject = () => {
    if (!user || !issueId) {
      toast({ title: "No issue", description: "Open an issue before rejecting." });
      return;
    }
    const num = issueId.replace("#", "");
    const ref = doc(db, "users", user.uid, "importedIssues", String(num));
    updateDoc(ref, { requirementsApproved: false, requirementsGenerated: false, status: "new" })
      .then(() => toast({ title: "Requirements Rejected", description: "Sent back to agents.", variant: "destructive" }))
      .catch((err) => toast({ title: "Reject failed", description: String(err), variant: "destructive" }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Final Requirements</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1.5" disabled={!output}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" disabled={!output}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-border font-mono text-xs whitespace-pre-wrap leading-relaxed">
          {loading ? "Loading..." : output ?? "No generated output yet. Run the agents to produce requirements."}
        </div>
      </div>

      <div className="p-4 border-t border-border flex gap-3">
        <Button onClick={handleApprove} className="flex-1 gradient-success text-success-foreground" disabled={!output}>
          <Check className="w-4 h-4 mr-2" />
          Approve
        </Button>
        <Button onClick={handleReject} variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10" disabled={!output}>
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>
    </div>
  );
}
