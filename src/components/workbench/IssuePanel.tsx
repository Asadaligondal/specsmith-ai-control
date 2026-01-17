import { ExternalLink, User, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IssuePanelProps {
  issueId: string;
}

const mockIssueData = {
  id: "#102",
  title: "Implement user authentication flow with OAuth2",
  description: `As a user, I want to be able to log in to the application using my Google or GitHub account so that I don't have to create a new password.

**Acceptance Criteria:**
- User can click "Login with Google" button
- User can click "Login with GitHub" button  
- After successful authentication, user is redirected to dashboard
- User session persists across browser tabs
- Logout button should clear all session data

**Technical Notes:**
- Use OAuth2 PKCE flow for security
- Store tokens securely in httpOnly cookies
- Implement refresh token rotation`,
  author: "John Doe",
  createdAt: "2024-01-15",
  labels: ["feature", "authentication", "priority:high"],
};

export function IssuePanel({ issueId }: IssuePanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Source Issue</h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <ExternalLink className="w-3 h-3" />
          View in GitLab
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Issue ID */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-primary">
            {mockIssueData.id}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold leading-tight">
          {mockIssueData.title}
        </h2>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {mockIssueData.author}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {mockIssueData.createdAt}
          </div>
        </div>

        {/* Labels */}
        <div className="flex flex-wrap gap-2">
          {mockIssueData.labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="text-xs font-medium"
            >
              <Tag className="w-3 h-3 mr-1" />
              {label}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Description
          </h4>
          <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap leading-relaxed">
            {mockIssueData.description}
          </div>
        </div>
      </div>
    </div>
  );
}
