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
          <BuSidebar />
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 overflow-y-auto">
            <AgentMonitorPanel className="xl:col-span-1" />
            <ChatPanel className="xl:col-span-1" />
            <WorkflowTree className="xl:col-span-1" />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
