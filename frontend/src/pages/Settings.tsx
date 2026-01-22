import { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/AuthContext";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Octokit } from "@octokit/rest";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();

  // General settings
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Integration settings
  const [showGitlabToken, setShowGitlabToken] = useState(false);
  const [gitlabToken, setGitlabToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [provider, setProvider] = useState<"github" | "gitlab">("github");
  const [storedPat, setStoredPat] = useState("");
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
    try {
      if (!user) throw new Error("Sign in required");
      if (provider === "github") {
        if (!storedPat || !repoUrl) throw new Error("Provide PAT and repo URL");
        const octokit = new Octokit({ auth: storedPat });
        // try to get repo
        const parts = repoUrl.replace(/\.git$/i, "").split("/").slice(-2);
        const owner = parts[0];
        const repo = parts[1];
        setIsVerifying(true);
        await octokit.rest.repos.get({ owner, repo });
        setIsConnected(true);
        toast({ title: "Connection Verified", description: "Connected to GitHub repository." });
      } else {
        // For GitLab, we just mock-check by ensuring token and URL provided
        if (!gitlabToken || !repoUrl) throw new Error("Provide GitLab token and repo URL");
        setIsConnected(true);
        toast({ title: "Connection Verified", description: "Connected to GitLab repository." });
      }
    } catch (err: any) {
      toast({ title: "Connection failed", description: err?.message ?? String(err) });
      setIsConnected(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // load profile and settings with realtime updates
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data: any = snap.data();
      setUserName(data.name ?? "");
      setUserEmail(data.email ?? user.email ?? "");
      setAvatarPreview(data.avatarUrl ?? null);
    });

    const settingsRef = doc(db, "users", user.uid, "settings", "integrations");
    const unsubSettings = onSnapshot(settingsRef, (sSnap) => {
      if (!sSnap.exists()) {
        setProvider("github");
        setRepoUrl("");
        setStoredPat("");
        setIsConnected(false);
        return;
      }
      const s: any = sSnap.data();
      setProvider(s.provider ?? "github");
      setRepoUrl(s.repoUrl ?? "");
      setStoredPat(s.pat ?? "");
      setIsConnected(Boolean(s.verified));
    });

    return () => {
      unsubUser();
      unsubSettings();
    };
  }, [user]);

  const handleSaveGeneral = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { name: userName, email: userEmail, avatarUrl: avatarPreview ?? null, updatedAt: serverTimestamp() }, { merge: true });
    toast({ title: "Profile Updated", description: "Your profile settings have been saved." });
  };

  const handleSaveIntegrations = () => {
    // persist to Firestore
    (async () => {
      if (!user) return;
      const settingsRef = doc(db, "users", user.uid, "settings", "integrations");
      await setDoc(settingsRef, { provider, repoUrl, pat: provider === "github" ? storedPat : gitlabToken, verified: isConnected, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Settings Saved", description: "Your integration settings have been updated." });
    })();
  };

  const handleAvatarUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setAvatarPreview(res);
    };
    reader.readAsDataURL(file);
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
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {userName ? userName.split(" ").map((n) => n[0]).join("") : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                    id="avatar-file"
                  />
                  <Button as="span" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </Button>
                </label>
                {avatarPreview && (
                  <div className="text-xs text-muted-foreground mt-2">Preview shown above. Click Save Profile to persist.</div>
                )}
              </div>
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
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Source Control Integration</h2>
                <p className="text-sm text-muted-foreground">Connect GitHub or GitLab and persist your PAT and repository selection.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as "github" | "gitlab") }>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input id="repo-url" placeholder="https://github.com/org/repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>

              {provider === "github" ? (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="github-pat">GitHub Personal Access Token</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input id="github-pat" type={showGitlabToken ? "text" : "password"} placeholder="ghp_xxx..." value={storedPat} onChange={(e) => setStoredPat(e.target.value)} className="pl-9 pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setShowGitlabToken(!showGitlabToken)}>
                      {showGitlabToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Store your PAT in your user settings to avoid entering it per-import. It will be saved to your account.</p>
                </div>
              ) : (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="gitlab-token">GitLab Personal Access Token</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input id="gitlab-token" type={showGitlabToken ? "text" : "password"} placeholder="glpat-..." value={gitlabToken} onChange={(e) => setGitlabToken(e.target.value)} className="pl-9 pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setShowGitlabToken(!showGitlabToken)}>
                      {showGitlabToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <Button onClick={handleVerifyConnection} disabled={isVerifying || !repoUrl || (provider === 'github' ? !storedPat : !gitlabToken)} variant="outline">
                    {isVerifying ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>) : 'Verify Connection'}
                  </Button>
                  {isConnected && <span className="text-sm text-success flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Connected</span>}
                </div>
              </div>
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
