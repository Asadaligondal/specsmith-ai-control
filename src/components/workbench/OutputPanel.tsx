import { Check, X, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { Octokit } from "@octokit/rest";
import { db } from "@/lib/firebase";

export function OutputPanel() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue") || "";
  const { user } = useAuth();
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

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

  const parseOwnerRepo = (url: string) => {
    if (!url) return { owner: "", repo: "" };
    const clean = url.replace(/\.git$/i, "");
    try {
      // https://github.com/owner/repo or https://github.com/owner/repo/issues/1
      if (clean.includes("github.com")) {
        const parts = clean.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "github.com");
        const owner = parts[idx + 1];
        const repo = parts[idx + 2];
        return { owner: owner ?? "", repo: repo ?? "" };
      }
      // git@github.com:owner/repo.git
      if (clean.includes(":")) {
        const after = clean.split(":").pop() || "";
        const parts = after.split("/");
        return { owner: parts[0] ?? "", repo: parts[1] ?? "" };
      }
      const parts = clean.split("/").filter(Boolean);
      return { owner: parts[parts.length - 2] ?? "", repo: parts[parts.length - 1] ?? "" };
    } catch (e) {
      return { owner: "", repo: "" };
    }
  };

  const postCommentToGitHub = async (repoOwner: string, repoName: string, issueNumber: number | string, finalRequirementsText: string) => {
    if (!user) {
      toast({ title: "Not signed in", description: "Sign in to export to GitHub." });
      return false;
    }
    try {
      const settingsRef = doc(db, "users", user.uid, "settings", "integrations");
      const sSnap = await getDoc(settingsRef);
      if (!sSnap.exists()) {
        toast({ title: "No integration", description: "Connect GitHub in Settings first." });
        return false;
      }
      const s: any = sSnap.data();
      const pat = s.pat ?? null;
      if (!pat) {
        toast({ title: "Missing PAT", description: "Add a GitHub Personal Access Token in Settings." });
        return false;
      }

      const octokit = new Octokit({ auth: pat });
      const body = `**🚀 AI Generated Specifications**\n\n${finalRequirementsText}`;
      await octokit.rest.issues.createComment({ owner: repoOwner, repo: repoName, issue_number: Number(issueNumber), body });
      return true;
    } catch (err: any) {
      toast({ title: "Export failed", description: err?.message ?? String(err) });
      return false;
    }
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
          <Button
            variant={exported ? "outline" : "default"}
            size="sm"
            className="h-7 text-xs"
            onClick={async () => {
              if (!output) return;
              setExporting(true);
              try {
                const num = issueId.replace("#", "");
                const ref = doc(db, "users", user!.uid, "importedIssues", String(num));
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                  toast({ title: "Issue not found", description: "Import the issue first." });
                  setExporting(false);
                  return;
                }
                const data: any = snap.data();
                // determine owner/repo
                let owner = "";
                let repo = "";
                if (data.html_url) {
                  const parsed = parseOwnerRepo(data.html_url);
                  owner = parsed.owner; repo = parsed.repo;
                }
                if ((!owner || !repo) && user) {
                  const settingsRef = doc(db, "users", user.uid, "settings", "integrations");
                  const sSnap = await getDoc(settingsRef);
                  if (sSnap.exists()) {
                    const s: any = sSnap.data();
                    const parsed = parseOwnerRepo(s.repoUrl ?? "");
                    owner = owner || parsed.owner;
                    repo = repo || parsed.repo;
                  }
                }

                if (!owner || !repo) {
                  toast({ title: "Repository unknown", description: "Configure repository in Settings or ensure issue has html_url." });
                  setExporting(false);
                  return;
                }

                const ok = await postCommentToGitHub(owner, repo, data.number ?? num, output);
                if (ok) {
                  toast({ title: "Exported", description: "Requirements posted to GitHub." });
                  setExported(true);
                }
              } finally {
                setExporting(false);
              }
            }}
            disabled={!output || exporting || exported}
          >
            {exporting ? "Exporting..." : exported ? "Exported!" : "Export to GitHub"}
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
