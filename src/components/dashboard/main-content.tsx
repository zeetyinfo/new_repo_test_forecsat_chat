"use client";

import React from "react";
import { useApp } from "./app-provider";
import DataPanel from "./data-panel";
import ChatPanel from "./chat-panel";
import WelcomeHero from "./welcome-hero";

export default function MainContent() {
  const { state } = useApp();

  if (state.isOnboarding) {
    return <WelcomeHero />;
  }

  if (state.dataPanelOpen) {
    return (
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <DataPanel className="w-full md:w-1/2" />
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
          <ChatPanel className="flex-1" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="w-full flex flex-col overflow-hidden">
        <ChatPanel className="flex-1" />
      </div>
    </main>
  );
}
