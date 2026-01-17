import { useState } from "react";
import { Save, Eye, EyeOff, Link2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [showToken, setShowToken] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [token, setToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your integration settings have been updated successfully.",
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your GitLab integration and agent behavior
        </p>
      </div>

      {/* GitLab Integration */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">GitLab Integration</h2>
            <p className="text-sm text-muted-foreground">
              Connect your GitLab repository to import issues
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitLab Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://gitlab.com/your-org/your-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full URL of your GitLab repository
            </p>
          </div>

          {/* Personal Access Token */}
          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Key className="w-4 h-4 text-muted-foreground" />
              </div>
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-9 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a token with <code className="px-1 py-0.5 rounded bg-muted">read_api</code> scope
            </p>
          </div>
        </div>
      </div>

      {/* Agent Settings */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-agent-builder/10">
            <svg
              className="w-5 h-5 text-agent-builder"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold">Agent Behavior</h2>
            <p className="text-sm text-muted-foreground">
              Configure how AI agents process your issues
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Auto-Start Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start" className="text-base cursor-pointer">
                Auto-Start Agents on New Issue
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically launch agents when a new issue is imported from GitLab
              </p>
            </div>
            <Switch
              id="auto-start"
              checked={autoStart}
              onCheckedChange={setAutoStart}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
