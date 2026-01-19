import React, { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { setDoc, doc, serverTimestamp, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ExternalLink, PlusSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface RepoItem {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
}

interface IssueItem {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  user: { login: string };
}

export function GitHubManager() {
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const { user } = useAuth();
  const [importedNumbers, setImportedNumbers] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIssue, setConfirmIssue] = useState<IssueItem | null>(null);

  const connect = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token) {
      toast({ title: "Token required", description: "Please enter a GitHub token." });
      return;
    }

    try {
      setLoadingRepos(true);
      const client = new Octokit({ auth: token });
      setOctokit(client);

      // list repos for authenticated user
      const res = await client.rest.repos.listForAuthenticatedUser({ per_page: 100 });
      const items = res.data.map((r: any) => ({ id: r.id, full_name: r.full_name, name: r.name, owner: { login: r.owner.login } }));
      setRepos(items);
      if (items.length === 0) {
        toast({ title: "No repositories", description: "No repositories found for this account." });
      }
    } catch (err: any) {
      toast({ title: "Bad Credentials", description: err?.message ?? "Unable to authenticate with GitHub." });
      setOctokit(null);
      setRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  };

  const importIssue = async (issue: IssueItem) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to import issues." });
      return;
    }
    try {
      setImporting(issue.number);
      const uid = user.uid;
      const ref = doc(db, "users", uid, "importedIssues", String(issue.number));
      await setDoc(ref, {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        html_url: issue.html_url,
        user: issue.user.login,
        importedAt: serverTimestamp(),
      });
      toast({ title: "Imported", description: `Issue #${issue.number} saved.` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err?.message ?? "Unable to import issue." });
    } finally {
      setImporting(null);
    }
  };

  useEffect(() => {
    // clear issues when repo changes
    setIssues([]);
  }, [selectedRepo]);

  useEffect(() => {
    if (!user) {
      setImportedNumbers(new Set());
      return;
    }
    const col = collection(db, "users", user.uid, "importedIssues");
    const unsub = onSnapshot(col, (snap) => {
      const nums = new Set<number>();
      snap.docs.forEach((d) => {
        const data: any = d.data();
        if (data?.number) nums.add(Number(data.number));
      });
      setImportedNumbers(nums);
    });
    return () => unsub();
  }, [user]);

  const fetchIssues = async (repoFullName: string) => {
    if (!octokit) {
      toast({ title: "Not connected", description: "Please connect a GitHub token first." });
      return;
    }
    const [owner, repo] = repoFullName.split("/");
    if (!owner || !repo) return;

    try {
      setLoadingIssues(true);
      const res = await octokit.rest.issues.listForRepo({ owner, repo, state: "open", per_page: 100 });
      const mapped = res.data.map((i: any) => ({
        number: i.number,
        title: i.title,
        body: i.body,
        html_url: i.html_url,
        user: { login: i.user?.login ?? "" },
      }));
      setIssues(mapped);
    } catch (err: any) {
      toast({ title: "Failed to load issues", description: err?.message ?? "" });
    } finally {
      setLoadingIssues(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-semibold">GitHub Integration</h3>

      <form onSubmit={connect} className="flex gap-2 items-center">
        <Input
          placeholder="GitHub Personal Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="ml-2" disabled={loadingRepos}>
          {loadingRepos ? "Connecting..." : "Connect"}
        </Button>
      </form>

      {repos.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Select a repository</p>
          <Select value={selectedRepo} onValueChange={(v) => { setSelectedRepo(v); fetchIssues(v); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose repository" />
            </SelectTrigger>
            <SelectContent>
              {repos.map((r) => (
                <SelectItem key={r.id} value={r.full_name}>{r.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedRepo && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Open issues for {selectedRepo}</p>
          {loadingIssues ? (
            <p>Loading issues...</p>
          ) : issues.length === 0 ? (
            <p className="text-sm">No open issues found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <Card key={issue.number} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">#{issue.number} • {issue.user.login}</p>
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{issue.body ?? "(no description)"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <a href={issue.html_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      </a>
                      {importedNumbers.has(issue.number) ? (
                        <span className="text-xs text-success">Imported</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => {
                            setConfirmIssue(issue);
                            setConfirmOpen(true);
                          }}
                          disabled={importing === issue.number}
                        >
                          <PlusSquare className="w-4 h-4" />
                          {importing === issue.number ? "Importing..." : "Import to AI"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Import Issue</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmIssue ? (
              <>
                <p className="font-medium">{confirmIssue.title}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-6">{confirmIssue.body ?? "(no description)"}</p>
              </>
            ) : (
              <p>No issue selected.</p>
            )}
          </AlertDialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmIssue) {
                  setConfirmOpen(false);
                  await importIssue(confirmIssue);
                }
              }}
            >
              Import
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GitHubManager;
