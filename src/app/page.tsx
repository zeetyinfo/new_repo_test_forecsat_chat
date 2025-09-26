
import { AppProvider } from '@/components/dashboard/app-provider';
import ChatPanel from '@/components/dashboard/chat-panel';
import Header from '@/components/dashboard/header';
import WorkflowTree from '@/components/dashboard/workflow-tree';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <WorkflowTree className="w-full md:w-80 md:flex" />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatPanel className="flex-1" />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
