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

const mockIssues: Issue[] = []; // This line remains for reference, but will be replaced by importedIssues

const statusConfig = {
  new: { label: "New", className: "bg-secondary text-secondary-foreground" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary" },
  reviewing: { label: "Reviewing", className: "bg-warning/10 text-warning" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
};

const priorityConfig = {
  low: { label: "Low", className: "border-muted-foreground/30 text-muted-foreground" },
  medium: { label: "Medium", className: "border-primary/30 text-primary" },
  high: { label: "High", className: "border-warning/30 text-warning" },
  critical: { label: "Critical", className: "border-destructive/30 text-destructive" },
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
        // derive status from persisted fields
        let status: Issue['status'] = 'new';
        if (data.requirementsApproved) status = 'completed';
        else if (data.requirementsGenerated) status = 'reviewing';
        else if (data.latestRunId) status = 'processing';

        // derive priority mapping if available
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issue Board</h1>
          <p className="text-muted-foreground">
            Manage and process issues with AI agents
          </p>
        </div>
          <div className="flex items-center gap-4">
            <Button className="gradient-primary text-primary-foreground" asChild>
              <a href="/settings"><ExternalLink className="w-4 h-4 mr-2" />Connect Repository</a>
            </Button>
          </div>
      </div>

        {/* GitHub Integration */}
        <GitHubManager />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  Issue ID
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-32">Author</TableHead>
              <TableHead className="w-32">Created</TableHead>
              <TableHead className="w-36 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow
                key={issue.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-mono text-sm font-medium">
                  {issue.id}
                </TableCell>
                <TableCell className="font-medium max-w-md truncate">
                  {issue.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("font-medium", statusConfig[issue.status].className)}
                  >
                    {statusConfig[issue.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", priorityConfig[issue.priority].className)}
                  >
                    {priorityConfig[issue.priority].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.author}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {issue.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const isCompleted = issue.status === "completed";
                    const label = isCompleted ? "View on Workbench" : "Launch Agents";
                    return (
                      <Button
                        size="sm"
                        onClick={() => handleLaunchAgents(issue.id)}
                        className={"gradient-primary text-primary-foreground"}
                      >
                        <Play className="w-3 h-3 mr-1.5" />
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
