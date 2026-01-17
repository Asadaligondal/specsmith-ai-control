import { useState } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Link2,
  Key,
  User,
  Bot,
  Upload,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john@company.com",
  avatar: "",
};

export default function Settings() {
  const { toast } = useToast();
  
  // General settings
  const [userName, setUserName] = useState(mockUser.name);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  
  // GitLab settings
  const [showGitlabToken, setShowGitlabToken] = useState(false);
  const [gitlabToken, setGitlabToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // AI settings
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [openAiKey, setOpenAiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [builderModel, setBuilderModel] = useState("gpt-4o");
  const [reviewerModel, setReviewerModel] = useState("claude-3.5-sonnet");
  
  // Agent settings
  const [autoStart, setAutoStart] = useState(false);

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "..." + key.slice(-4);
  };

  const handleVerifyConnection = async () => {
    setIsVerifying(true);
    // Mock verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsVerifying(false);
    toast({
      title: "Connection Verified",
      description: "Successfully connected to your GitLab repository.",
    });
  };

  const handleSaveGeneral = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved.",
    });
  };

  const handleSaveIntegrations = () => {
    toast({
      title: "Settings Saved",
      description: "Your integration settings have been updated.",
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your profile, integrations, and AI agents
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="w-4 h-4" />
            AI Configuration
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Profile Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account information
                </p>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {userName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveGeneral} className="gradient-primary text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* GitLab Integration */}
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold">GitLab Connection</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect your GitLab repository to import issues
                  </p>
                </div>
              </div>
              {isConnected && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected
                </div>
              )}
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
              </div>

              {/* Personal Access Token */}
              <div className="space-y-2">
                <Label htmlFor="gitlab-token">Personal Access Token</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="gitlab-token"
                    type={showGitlabToken ? "text" : "password"}
                    placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                    value={gitlabToken}
                    onChange={(e) => setGitlabToken(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowGitlabToken(!showGitlabToken)}
                  >
                    {showGitlabToken ? (
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

              <Button
                onClick={handleVerifyConnection}
                disabled={!gitlabToken || !repoUrl || isVerifying}
                variant="outline"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Connection"
                )}
              </Button>
            </div>
          </div>

          {/* Agent Settings */}
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agent-builder/10">
                <Bot className="w-5 h-5 text-agent-builder" />
              </div>
              <div>
                <h2 className="font-semibold">Agent Behavior</h2>
                <p className="text-sm text-muted-foreground">
                  Configure how AI agents process your issues
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="auto-start" className="text-base cursor-pointer">
                  Auto-Start Agents on New Issue
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically launch agents when a new issue is imported
                </p>
              </div>
              <Switch
                id="auto-start"
                checked={autoStart}
                onCheckedChange={setAutoStart}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations} className="gradient-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* API Keys */}
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">API Keys</h2>
                <p className="text-sm text-muted-foreground">
                  Configure your AI provider credentials
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* OpenAI API Key */}
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showOpenAiKey ? "text" : "password"}
                    placeholder="sk-xxxx..."
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                  >
                    {showOpenAiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {openAiKey && !showOpenAiKey && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Current: {maskApiKey(openAiKey)}
                  </p>
                )}
              </div>

              {/* Anthropic API Key */}
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showAnthropicKey ? "text" : "password"}
                    placeholder="sk-ant-xxxx..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  >
                    {showAnthropicKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {anthropicKey && !showAnthropicKey && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Current: {maskApiKey(anthropicKey)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agent-builder/10">
                <Bot className="w-5 h-5 text-agent-builder" />
              </div>
              <div>
                <h2 className="font-semibold">Model Selection</h2>
                <p className="text-sm text-muted-foreground">
                  Choose which models power your agents
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Builder Model */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-agent-builder" />
                  Builder Agent Model
                </Label>
                <Select value={builderModel} onValueChange={setBuilderModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The model that generates initial requirements
                </p>
              </div>

              {/* Reviewer Model */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-agent-reviewer" />
                  Reviewer Agent Model
                </Label>
                <Select value={reviewerModel} onValueChange={setReviewerModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The model that reviews and critiques requirements
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations} className="gradient-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save AI Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
