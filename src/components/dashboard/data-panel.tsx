"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import DataVisualizer from "./data-visualizer";
import { useApp } from "./app-provider";
import BuLobSelector from "./bu-lob-selector";
import { Button } from "@/components/ui/button";

export default function DataPanel({ className }: { className?: string }) {
  const { state } = useApp();
  const [target, setTarget] = useState<"units" | "revenue">("units");

  const vizData = useMemo(() => state.selectedLob?.mockData ?? null, [state.selectedLob]);

  return (
    <Card className={cn("flex flex-col rounded-none border-0 md:border-r", className)}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Data Visualization</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={target === "units" ? "secondary" : "ghost"}
              onClick={() => setTarget("units")}
            >
              Units
            </Button>
            <Button
              size="sm"
              variant={target === "revenue" ? "secondary" : "ghost"}
              onClick={() => setTarget("revenue")}
            >
              Revenue
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <BuLobSelector />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {vizData ? (
              <DataVisualizer data={vizData} target={target} />
            ) : (
              <div className="text-center text-sm text-muted-foreground py-10 px-4 border rounded-md bg-muted/30">
                Select a Business Unit / LOB with data to see charts here.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
