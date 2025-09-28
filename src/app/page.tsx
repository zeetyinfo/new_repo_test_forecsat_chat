import { AppProvider } from '@/components/dashboard/app-provider';
import Header from '@/components/dashboard/header';
import MainContent from '@/components/dashboard/main-content';
import WelcomeHero from '@/components/dashboard/welcome-hero';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <Header />
        {/* Show landing hero first, then the assistant */}
        {/* eslint-disable-next-line react/jsx-no-undef */}
        { /* @ts-expect-error Server Component boundary */ }
        <WelcomeHero />
      </div>
    </AppProvider>
  );
}
