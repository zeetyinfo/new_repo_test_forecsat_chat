"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BuLobSelector from "./bu-lob-selector";
import { useApp } from "./app-provider";
import { Sparkles, Bot, BarChart3 } from "lucide-react";

export default function WelcomeHero() {
  const { state, dispatch } = useApp();
  const [prompt, setPrompt] = React.useState("");

  const canContinue = !!state.selectedBu && !!state.selectedLob;

  const start = () => {
    if (canContinue) {
      if (prompt.trim()) {
        dispatch({ type: 'QUEUE_USER_PROMPT', payload: prompt.trim() });
      }
      dispatch({ type: 'END_ONBOARDING' });
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.2),transparent_50%)]" />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Plan • Chat • Visualize
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            Where your data becomes decisions
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Select your Business Unit, tell the assistant what you want, and we’ll plan, analyze, and preview insights on demand.
          </p>

          <div className="mt-8 flex justify-center">
            <BuLobSelector />
          </div>

          <div className="mt-6 mx-auto max-w-3xl">
            <div className="rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 p-3 shadow-lg">
              <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); start(); }}>
                <Bot className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you need (e.g., Analyze ECOM Chat for trends, create a 30-day forecast)"
                  className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
                />
                <BuLobSelector compact variant="secondary" size="sm" className="mr-2" triggerLabel="Connectors" />
                <Button size="sm" type="submit" disabled={!canContinue}>
                  Start
                </Button>
              </form>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {[
                'Analyze data quality',
                'Start a 30-day forecast',
                'Explain the outliers',
                'Visualize last 8 weeks revenue',
                'Generate executive summary',
              ].map((s) => (
                <Button key={s} size="sm" variant="outline" onClick={() => setPrompt((p) => (p ? `${p} ${s}` : s))}>
                  {s}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">After you click Start, we’ll continue in the assistant view.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border p-4 bg-card/50">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="mt-2 font-semibold">On-demand previews</h3>
              <p className="text-sm text-muted-foreground">Visualize charts, tables, and reports only when needed—your chat stays center stage.</p>
            </div>
            <div className="rounded-xl border p-4 bg-card/50">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mt-2 font-semibold">Plan & execute</h3>
              <p className="text-sm text-muted-foreground">We outline the workflow and execute steps with clear progress and results.</p>
            </div>
            <div className="rounded-xl border p-4 bg-card/50">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="mt-2 font-semibold">Data-aware chat</h3>
              <p className="text-sm text-muted-foreground">Responses are grounded in your selected BU/LOB with actionable suggestions.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
