import { useState } from "react";
import { Bot, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";

interface Message {
  id: string;
  agent: "builder" | "reviewer";
  content: string;
  timestamp: string;
}

import { useToast } from "@/hooks/use-toast";
import { setDoc, serverTimestamp, collection, addDoc, getDocs, doc as docRef } from "firebase/firestore";
export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue") || "";
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load issue summary to show in agent chat header or initial message
    async function loadIssue() {
      setMessages([]);
      if (!user || !issueId) return;
      const num = issueId.replace("#", "");
      try {
        const ref = doc(db, "users", user.uid, "importedIssues", String(num));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data: any = snap.data();
          // show a starter message referencing the issue title
          setMessages([
            {
              id: "init-1",
              agent: "builder",
              content: `Ready to process issue #${data.number}: ${data.title}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } catch (e) {
        // ignore
      }
    }
    loadIssue();
  }, [issueId, user]);

  const runAgents = async () => {
    const key = import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!key) {
      toast({ title: "Missing API key", description: "No OpenAI key is configured on the server. Set VITE_OPENAI_API_KEY in environment variables." });
      return;
    }
    if (!user || !issueId) {
      toast({ title: "No issue", description: "Open an issue before running agents." });
      return;
    }

    const num = issueId.replace("#", "");
    const ref = doc(db, "users", user.uid, "importedIssues", String(num));
    try {
      setIsProcessing(true);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        toast({ title: "Issue not found", description: "Import the issue first." });
        setIsProcessing(false);
        return;
      }
      const data: any = snap.data();

      // enforce max rounds (completed runs) per issue
      const runsCol = collection(db, "users", user.uid, "importedIssues", String(num), "agent_runs");
      const existingRuns = await getDocs(runsCol);
      const completedRuns = existingRuns.docs.filter((d) => (d.data() as any).status === "done").length;
      if (completedRuns >= 5) {
        toast({ title: "Run limit reached", description: "This issue has reached the maximum of 5 agent runs." });
        setIsProcessing(false);
        return;
      }

      // create a run document
      const runDocRef = await addDoc(runsCol, {
        status: "running",
        startedAt: serverTimestamp(),
        roundNumber: completedRuns + 1,
      });
      const runId = runDocRef.id;

      // helper to persist messages
      const msgsCol = collection(db, "users", user.uid, "importedIssues", String(num), "agent_runs", runId, "messages");

      const builderSystem = "You are Builder Agent. Read the issue and produce a concise, developer-focused output (summary, tasks, labels). Respond in plain text.";
      const reviewerSystem = "You are Reviewer Agent. Given the issue and Builder Agent output, improve, critique, and produce a final actionable spec and PR draft in plain text.";

      // Builder agent prompt
      const builderPrompt = `Issue Title:\n${data.title}\n\nDescription:\n${data.body ?? ""}`;
      await addDoc(msgsCol, { agent: "orchestrator", role: "system", content: builderSystem, type: "prompt", timestamp: serverTimestamp() });
      await addDoc(msgsCol, { agent: "BuilderAgent", role: "user", content: builderPrompt, type: "prompt", timestamp: serverTimestamp() });

      // Call OpenAI for Builder
      const builderRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: builderSystem },
            { role: "user", content: builderPrompt },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (!builderRes.ok) {
        const errText = await builderRes.text();
        await setDoc(runDocRef, { status: "error", error: errText, endedAt: serverTimestamp() }, { merge: true });
        toast({ title: "OpenAI error (Builder)", description: errText });
        setIsProcessing(false);
        return;
      }

      const builderBody = await builderRes.json();
      const builderContent = builderBody?.choices?.[0]?.message?.content ?? "";
      await addDoc(msgsCol, { agent: "BuilderAgent", role: "assistant", content: builderContent, type: "response", timestamp: serverTimestamp() });

      // append builder message to UI
      setMessages((prev) => [
        ...prev,
        { id: `builder-${Date.now()}`, agent: "builder", content: builderContent, timestamp: new Date().toLocaleTimeString() },
      ]);

      // Reviewer agent prompt includes builder output
      const reviewerPrompt = `Original Issue:\n${data.title}\n${data.body ?? ""}\n\nBuilder Output:\n${builderContent}\n\nPlease provide a final actionable spec and draft PR body.`;
      await addDoc(msgsCol, { agent: "orchestrator", role: "system", content: reviewerSystem, type: "prompt", timestamp: serverTimestamp() });
      await addDoc(msgsCol, { agent: "ReviewerAgent", role: "user", content: reviewerPrompt, type: "prompt", timestamp: serverTimestamp() });

      // Call OpenAI for Reviewer
      const reviewerRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: reviewerSystem },
            { role: "user", content: reviewerPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (!reviewerRes.ok) {
        const errText = await reviewerRes.text();
        await setDoc(runDocRef, { status: "error", error: errText, endedAt: serverTimestamp() }, { merge: true });
        toast({ title: "OpenAI error (Reviewer)", description: errText });
        setIsProcessing(false);
        return;
      }

      const reviewerBody = await reviewerRes.json();
      const reviewerContent = reviewerBody?.choices?.[0]?.message?.content ?? "";
      await addDoc(msgsCol, { agent: "ReviewerAgent", role: "assistant", content: reviewerContent, type: "response", timestamp: serverTimestamp() });

      // append reviewer message to UI
      setMessages((prev) => [
        ...prev,
        { id: `reviewer-${Date.now()}`, agent: "reviewer", content: reviewerContent, timestamp: new Date().toLocaleTimeString() },
      ]);

      // finalize run doc and write outputs to issue
      await setDoc(runDocRef, { status: "done", endedAt: serverTimestamp(), builderOutput: builderContent, reviewerOutput: reviewerContent }, { merge: true });

      await setDoc(ref, {
        generatedOutput: { builder: builderContent, reviewer: reviewerContent, runId },
        generatedAt: serverTimestamp(),
        requirementsGenerated: true,
        latestRunId: runId,
        requirementsEntry: { runId, generatedAt: serverTimestamp(), title: data.title ?? "Requirements" },
      }, { merge: true });

      toast({ title: "Agents finished", description: "Generated output saved to Firestore." });
    } catch (err: any) {
      toast({ title: "Run failed", description: err?.message ?? String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  // const startRun = async () => {
  //   const allow = import.meta.env.VITE_ENABLE_AGENT_RUNS === "true";
  //   if (!allow) {
  //     alert("Agent run is disabled in this environment. Provide permission to enable runs.");
  //     return;
  //   }
  //   await runAgents();
  // };
  const handleRestart = () => {
    // Clear messages and show idle state — actual agent runs require API keys
    setMessages([]);
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Agent Loop</h3>
            {isProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                Processing...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Using server OpenAI key from environment.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="h-7 text-xs gap-1.5"
          >
            <RefreshCcw className="w-3 h-3" />
            Clear
          </Button>
          <Button size="sm" onClick={startRun} className="h-7 text-xs">
            Run Agents
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">No agent activity. Click Run to start processing (uses server OpenAI key).</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                message.agent === "reviewer" && "flex-row-reverse"
              )}
            >
              <Avatar
                className={cn(
                  "w-8 h-8 shrink-0",
                  message.agent === "builder"
                    ? "bg-agent-builder/10"
                    : "bg-agent-reviewer/10"
                )}
              >
                <AvatarFallback
                  className={cn(
                    message.agent === "builder"
                      ? "bg-agent-builder text-primary-foreground"
                      : "bg-agent-reviewer text-primary-foreground"
                  )}
                >
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "flex-1 space-y-1",
                  message.agent === "reviewer" && "text-right"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      message.agent === "builder"
                        ? "text-agent-builder"
                        : "text-agent-reviewer"
                    )}
                  >
                    {message.agent === "builder" ? "Builder Agent" : "Reviewer Agent"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>

                <div
                  className={cn(
                    "p-3 rounded-lg text-sm whitespace-pre-wrap text-left",
                    message.agent === "builder"
                      ? "bg-agent-builder/5 border border-agent-builder/20"
                      : "bg-agent-reviewer/5 border border-agent-reviewer/20"
                  )}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
