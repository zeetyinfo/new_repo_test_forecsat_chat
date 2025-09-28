import { AppProvider } from '@/components/dashboard/app-provider';
import ChatPanel from '@/components/dashboard/chat-panel';
import Header from '@/components/dashboard/header';
import DataPanel from '@/components/dashboard/data-panel';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <Header />
        <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <DataPanel className="w-full md:w-1/2" />
          <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
            <ChatPanel className="flex-1" />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
