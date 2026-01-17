import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  agent: "builder" | "reviewer";
  content: string;
  timestamp: string;
}

const mockConversation: Message[] = [
  {
    id: "1",
    agent: "builder",
    content: `Based on Issue #102, I propose the following functional requirements:

**FR-001: OAuth2 Authentication**
- The system SHALL provide OAuth2 authentication via Google provider
- The system SHALL provide OAuth2 authentication via GitHub provider
- The system SHALL implement PKCE flow for enhanced security

**FR-002: Session Management**
- The system SHALL persist user sessions across browser tabs
- The system SHALL store authentication tokens in httpOnly cookies
- The system SHALL implement automatic token refresh`,
    timestamp: "10:32 AM",
  },
  {
    id: "2",
    agent: "reviewer",
    content: `I've reviewed the proposed requirements. A few observations:

⚠️ **Ambiguity Detected in FR-001:**
The requirement mentions "Google provider" and "GitHub provider" but doesn't specify what happens if these providers are unavailable. Consider adding fallback behavior.

⚠️ **Missing Requirement:**
The acceptance criteria mentions "Logout button should clear all session data" but I don't see a corresponding functional requirement for logout functionality.

Please add:
- FR-003: Logout Functionality`,
    timestamp: "10:33 AM",
  },
  {
    id: "3",
    agent: "builder",
    content: `Thank you for the review. I'll incorporate the feedback:

**FR-001 (Updated):**
- The system SHALL provide OAuth2 authentication via Google provider
- The system SHALL provide OAuth2 authentication via GitHub provider
- The system SHALL display an error message if the OAuth provider is unavailable
- The system SHALL implement PKCE flow for enhanced security

**FR-003: Logout Functionality** (NEW)
- The system SHALL provide a logout button in the navigation
- Upon logout, the system SHALL invalidate all session tokens
- Upon logout, the system SHALL clear all client-side session data
- Upon logout, the system SHALL redirect the user to the login page`,
    timestamp: "10:35 AM",
  },
  {
    id: "4",
    agent: "reviewer",
    content: `✅ **Review Complete**

The updated requirements now properly address:
- Provider availability handling
- Complete logout functionality

All functional requirements are now:
- Specific and measurable
- Testable
- Traceable to the original acceptance criteria

**Recommendation:** Ready for human approval.`,
    timestamp: "10:36 AM",
  },
];

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMessageSequence = useCallback(() => {
    indexRef.current = 0;
    setMessages([]);
    setIsProcessing(true);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < mockConversation.length) {
        const messageToAdd = mockConversation[indexRef.current];
        setMessages((prev) => [...prev, messageToAdd]);
        indexRef.current++;
      } else {
        setIsProcessing(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1500);
  }, []);

  useEffect(() => {
    startMessageSequence();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startMessageSequence]);

  const handleRestart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startMessageSequence();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Agent Loop</h3>
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              Processing...
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRestart}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCcw className="w-3 h-3" />
          Restart
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
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
        ))}

        {isProcessing && messages.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs">Agent is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
