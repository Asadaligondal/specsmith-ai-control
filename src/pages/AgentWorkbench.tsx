import { useSearchParams } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IssuePanel } from "@/components/workbench/IssuePanel";
import { AgentChat } from "@/components/workbench/AgentChat";
import { OutputPanel } from "@/components/workbench/OutputPanel";

export default function AgentWorkbench() {
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue") || "#102";

  return (
    <div className="h-[calc(100vh-8rem)] -m-6">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Issue Source */}
        <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
          <div className="h-full glass-card border-r border-border">
            <IssuePanel issueId={issueId} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Agent Chat */}
        <ResizablePanel defaultSize={44} minSize={30}>
          <div className="h-full glass-card border-r border-border">
            <AgentChat />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Output */}
        <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
          <div className="h-full glass-card">
            <OutputPanel />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
