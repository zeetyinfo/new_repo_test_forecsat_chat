"use client";

import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import DataVisualizer from "./data-visualizer";
import { useApp } from "./app-provider";
import BuLobSelector from "./bu-lob-selector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DataPanel({ className }: { className?: string }) {
  const { state, dispatch } = useApp();

  const vizData = useMemo(() => state.selectedLob?.mockData ?? null, [state.selectedLob]);

  useEffect(() => {
    // Ensure target reflects state
    if (!['units','revenue'].includes(state.dataPanelTarget)) {
      dispatch({ type: 'SET_DATA_PANEL_TARGET', payload: 'units' });
    }
  }, [state.dataPanelTarget, dispatch]);

  return (
    <Card className={cn("flex flex-col rounded-none border-0 md:border-r", className)}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Insights Panel</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'SET_DATA_PANEL_OPEN', payload: false })}>
              Hide
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <BuLobSelector />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={state.dataPanelTarget === "units" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: 'SET_DATA_PANEL_TARGET', payload: 'units' })}
            >
              Units
            </Button>
            <Button
              size="sm"
              variant={state.dataPanelTarget === "revenue" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: 'SET_DATA_PANEL_TARGET', payload: 'revenue' })}
            >
              Revenue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <Tabs value={state.dataPanelMode} onValueChange={(v) => dispatch({ type: 'SET_DATA_PANEL_MODE', payload: v as any })} className="flex flex-col h-full">
          <div className="px-4 pt-3">
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chart" className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {vizData ? (
                  <DataVisualizer data={vizData} target={state.dataPanelTarget} />
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-10 px-4 border rounded-md bg-muted/30">
                    Select a Business Unit / LOB with data to see charts here.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="table" className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {vizData ? (
                  <Table>
                    <TableCaption>Weekly {state.dataPanelTarget} for {state.selectedLob?.name}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right capitalize">{state.dataPanelTarget}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vizData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.week}</TableCell>
                          <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{(row as any)[state.dataPanelTarget]?.toLocaleString?.() ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-10 px-4 border rounded-md bg-muted/30">
                    Select a Business Unit / LOB with data to see a table here.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="menu" className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 grid gap-2">
                <Button variant="outline" onClick={() => dispatch({ type: 'SET_DATA_PANEL_MODE', payload: 'chart' })}>Show Chart</Button>
                <Button variant="outline" onClick={() => dispatch({ type: 'SET_DATA_PANEL_MODE', payload: 'table' })}>Show Table</Button>
                <Button variant="outline" onClick={() => dispatch({ type: 'SET_DATA_PANEL_OPEN', payload: false })}>Close Panel</Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
