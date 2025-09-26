import { AppProvider } from '@/components/dashboard/app-provider';
import AgentMonitorPanel from '@/components/dashboard/agent-monitor';
import BuSidebar from '@/components/dashboard/bu-sidebar';
import ChatPanel from '@/components/dashboard/chat-panel';
import Header from '@/components/dashboard/header';
import WorkflowTree from '@/components/dashboard/workflow-tree';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <WorkflowTree className="w-80 hidden md:flex" />
          <div className="flex-1 flex flex-col">
            <ChatPanel className="flex-1" />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
