"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import BuLobSelector from "./bu-lob-selector";
import { useApp } from "./app-provider";

export default function WelcomeHero() {
  const { state, dispatch } = useApp();

  const canContinue = !!state.selectedBu && !!state.selectedLob;

  return (
    <main className="flex-1 overflow-auto">
      <div className="relative h-full w-full bg-gradient-to-b from-purple-600/20 via-blue-600/10 to-background">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Build your BI assistant</h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Select a Business Unit and Line of Business to begin. You can chat, analyze, and visualize on demand.
          </p>
          <div className="mt-8 flex justify-center">
            <BuLobSelector />
          </div>
          <div className="mt-8">
            <Button size="lg" onClick={() => dispatch({ type: 'END_ONBOARDING' })} disabled={!canContinue}>
              Continue to Assistant
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
