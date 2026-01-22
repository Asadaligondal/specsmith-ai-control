import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import GitHubManager from "@/components/workbench/GitHubManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Issue {
  id: string;
  title: string;
  status: "new" | "processing" | "reviewing" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  author: string;
  createdAt: string;
}

const mockIssues: Issue[] = [];

const statusConfig = {
  new: { label: "New", className: "bg-muted text-foreground border-border" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary border-primary/20" },
  reviewing: { label: "Reviewing", className: "bg-warning/10 text-warning border-warning/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
};

const priorityConfig = {
  low: { label: "Low", className: "border-muted-foreground/30 text-muted-foreground" },
  medium: { label: "Medium", className: "border-primary/50 text-primary" },
  high: { label: "High", className: "border-warning/50 text-warning" },
  critical: { label: "Critical", className: "border-destructive/50 text-destructive font-semibold" },
};

export default function IssueBoard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const [importedIssues, setImportedIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!user) {
      setImportedIssues([]);
      return;
    }

    const col = collection(db, "users", user.uid, "importedIssues");
    const q = query(col, orderBy("importedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Issue[] = snap.docs.map((d) => {
        const data: any = d.data();
        let status: Issue['status'] = 'new';
        if (data.requirementsApproved) status = 'completed';
        else if (data.requirementsGenerated) status = 'reviewing';
        else if (data.latestRunId) status = 'processing';

        let priority: Issue['priority'] = 'medium';
        if (data.priority === 'low' || data.priority === 'medium' || data.priority === 'high' || data.priority === 'critical') {
          priority = data.priority;
        }

        return {
          id: `#${data.number}`,
          title: data.title ?? "(no title)",
          status,
          priority,
          author: data.user ?? "",
          createdAt: data.importedAt && data.importedAt.toDate ? data.importedAt.toDate().toLocaleString() : "",
        };
      });
      setImportedIssues(items);
    });

    return () => unsub();
  }, [user]);

  const filteredIssues = importedIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLaunchAgents = (issueId: string) => {
    navigate(`/workbench?issue=${encodeURIComponent(issueId)}`);
  };

  return (
    <div className=\"space-y-6 max-w-[1400px]\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-2xl font-bold text-foreground\">Issue Board</h1>
          <p className=\"text-muted-foreground mt-1\">
            Manage and process issues with AI agents
          </p>
        </div>
        <div className=\"flex items-center gap-3\">
          <Button className=\"bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium\" asChild>
            <a href=\"/settings\">
              <ExternalLink className=\"w-4 h-4 mr-2\" />
              Connect Repository
            </a>
          </Button>
        </div>
      </div>

      {/* GitHub Integration */}
      <GitHubManager />

      {/* Filters */}
      <div className=\"flex items-center gap-3\">
        <div className=\"relative flex-1 max-w-md\">
          <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground\" />
          <Input
            placeholder=\"Search issues...\"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=\"pl-10 h-9\"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className=\"w-[180px] h-9\">
            <Filter className=\"w-4 h-4 mr-2\" />
            <SelectValue placeholder=\"Filter by status\" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=\"all\">All Statuses</SelectItem>
            <SelectItem value=\"new\">New</SelectItem>
            <SelectItem value=\"processing\">Processing</SelectItem>
            <SelectItem value=\"reviewing\">Reviewing</SelectItem>
            <SelectItem value=\"completed\">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className=\"github-card p-0 overflow-hidden\">
        <Table>
          <TableHeader>
            <TableRow className=\"hover:bg-transparent border-b border-border\">
              <TableHead className=\"w-24 font-semibold\">
                <Button variant=\"ghost\" size=\"sm\" className=\"-ml-3 h-8 font-semibold\">
                  Issue ID
                  <ArrowUpDown className=\"ml-2 h-3 w-3\" />
                </Button>
              </TableHead>
              <TableHead className=\"font-semibold\">Title</TableHead>
              <TableHead className=\"w-32 font-semibold\">Status</TableHead>
              <TableHead className=\"w-28 font-semibold\">Priority</TableHead>
              <TableHead className=\"w-32 font-semibold\">Author</TableHead>
              <TableHead className=\"w-32 font-semibold\">Created</TableHead>
              <TableHead className=\"w-36 text-right font-semibold\">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className=\"text-center py-8 text-muted-foreground\">
                  No issues found. Import issues from your repository to get started.
                </TableCell>
              </TableRow>
            )}
            {filteredIssues.map((issue) => (
              <TableRow
                key={issue.id}
                className=\"cursor-pointer hover:bg-muted/50 border-b border-border\"
              >
                <TableCell className=\"font-mono text-sm font-medium text-foreground\">
                  {issue.id}
                </TableCell>
                <TableCell className=\"font-medium max-w-md truncate text-foreground\">
                  {issue.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant=\"outline\"
                    className={cn(\"font-medium text-xs\", statusConfig[issue.status].className)}
                  >
                    {statusConfig[issue.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant=\"outline\"
                    className={cn(\"font-medium text-xs\", priorityConfig[issue.priority].className)}
                  >
                    {priorityConfig[issue.priority].label}
                  </Badge>
                </TableCell>
                <TableCell className=\"text-muted-foreground text-sm\">
                  {issue.author}
                </TableCell>
                <TableCell className=\"text-muted-foreground text-xs\">
                  {issue.createdAt}
                </TableCell>
                <TableCell className=\"text-right\">
                  {(() => {
                    const isCompleted = issue.status === \"completed\";
                    const label = isCompleted ? \"View\" : \"Launch Agents\";
                    return (
                      <Button
                        size=\"sm\"
                        onClick={() => handleLaunchAgents(issue.id)}
                        className=\"bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-8 px-3 text-xs\"
                      >
                        <Play className=\"w-3 h-3 mr-1.5\" />
                        {label}
                      </Button>
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
