
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitMerge, CheckCircle2, AlertCircle, Circle, Clock, GitBranch, MoreVertical, Play, Folder, UploadCloud, FileWarning, CheckCircle } from 'lucide-react';
import type { WorkflowStep, WorkflowStatus, BusinessUnit, LineOfBusiness } from '@/lib/types';
import { useApp } from './app-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const statusConfig: Record<WorkflowStatus, { icon: React.ReactNode; color: string }> = {
  completed: { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-500' },
  active: { icon: <Play className="h-5 w-5 animate-pulse" />, color: 'text-blue-500' },
  pending: { icon: <Clock className="h-5 w-5" />, color: 'text-gray-400' },
  error: { icon: <AlertCircle className="h-5 w-5" />, color: 'text-red-500' },
};

function WorkflowNode({ step }: { step: WorkflowStep }) {
  const config = statusConfig[step.status];

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("rounded-full h-10 w-10 flex items-center justify-center bg-muted", config.color)}>
            {React.cloneElement(config.icon as React.ReactElement, { className: "h-6 w-6 text-white"})}
        </div>
        {/* Render line only if it's not the last step */}
        <div className="w-px h-full bg-border" />
      </div>
      <div className="pb-8 flex-1">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-between group">
                        <p className={cn("font-medium", step.status === 'active' && 'text-primary')}>{step.name}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p className="max-w-xs">{step.details}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <p className="text-sm text-muted-foreground">Est. time: {step.estimatedTime}</p>
      </div>
    </li>
  );
}

const LobItem = ({ lob, onSelect, isSelected }: { lob: LineOfBusiness, onSelect: (lob: LineOfBusiness) => void, isSelected: boolean }) => {
  const [showUpload, setShowUpload] = useState(false);

  const handleSelect = () => {
    if (lob.hasData) {
      onSelect(lob);
    } else {
      setShowUpload(true);
    }
  };

  const handleUpload = () => {
    alert(`Uploading data for ${lob.name}... (This is a placeholder)`);
  };

  return (
    <div className="relative group">
      <Button
        variant={isSelected ? 'secondary' : 'ghost'}
        className="w-full justify-start pr-10"
        onClick={handleSelect}
      >
        <div className="flex items-center justify-between w-full">
          <span>{lob.name}</span>
          <div className="flex items-center space-x-2">
            {!lob.hasData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FileWarning className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No data available for this LOB.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {lob.recordCount > 0 && (
              <span className="text-xs text-muted-foreground">{lob.recordCount} records</span>
            )}
            {lob.hasData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data ready for analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Button>
      {!lob.hasData && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={handleUpload}
              >
                <UploadCloud className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload data for {lob.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default function WorkflowTree({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const { workflow, businessUnits, selectedBu, selectedLob } = state;
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let activeIndex = -1;
    const interval = setInterval(() => {
        activeIndex = workflow.findIndex(step => step.status === 'pending');

        if(activeIndex === -1 && workflow.every(s => s.status === 'completed')) {
            setTimeout(() => dispatch({ type: 'RESET_WORKFLOW' }), 3000);
            return;
        }

        if (activeIndex > 0) {
            dispatch({ type: 'UPDATE_WORKFLOW_STEP', payload: { id: workflow[activeIndex - 1].id, status: 'completed' }});
        }

        if (activeIndex !== -1) {
            dispatch({ type: 'UPDATE_WORKFLOW_STEP', payload: { id: workflow[activeIndex].id, status: 'active' }});
        }
    }, 2500);

    return () => clearInterval(interval);
  }, [workflow, dispatch]);

  const handleBuSelect = (bu: BusinessUnit) => {
    dispatch({ type: 'SET_SELECTED_BU', payload: bu });
    dispatch({
        type: 'ADD_MESSAGE',
        payload: {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Switched to Business Unit: **${bu.name}**. Please select a Line of Business to proceed.`
        }
    })
  };

  const handleLobSelect = (lob: LineOfBusiness) => {
    if (!lob.hasData) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `No data is available for **${lob.name}**. Please upload data to begin analysis.`
        }
      });
      return;
    }

    dispatch({ type: 'SET_SELECTED_LOB', payload: lob });
    dispatch({
        type: 'ADD_MESSAGE',
        payload: {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Great! For **${lob.name}**, I have ${lob.recordCount} records ready. What would you like to do?`
        }
    })
  };

  if (isMobile) {
    return (
      <div className={className}>
        <Accordion type="single" collapsible className="w-full" defaultValue={isOpen ? "workflow" : ""}>
          <AccordionItem value="workflow">
            <AccordionTrigger onClick={() => setIsOpen(!isOpen)} className="bg-card p-4 border-b">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6" />
                <span className="text-lg font-semibold">Workflow & Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  <Accordion type="single" collapsible className="w-full" defaultValue={selectedBu?.id}>
                    {businessUnits.map((bu) => (
                      <AccordionItem value={bu.id} key={bu.id}>
                        <AccordionTrigger 
                          className={cn("px-4 py-3 hover:no-underline hover:bg-muted/50 text-left", selectedBu?.id === bu.id && "bg-accent text-accent-foreground")}
                          onClick={() => handleBuSelect(bu)}
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="h-4 w-4" style={{ color: bu.color }} />
                            <span className="font-medium">{bu.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 pr-4 pt-0 pb-2 space-y-1">
                          {bu.lobs.map((lob) => (
                            <LobItem
                              key={lob.id}
                              lob={lob}
                              onSelect={handleLobSelect}
                              isSelected={selectedLob?.id === lob.id}
                            />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <div className='p-4'>
                    <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-4 mt-2">CURRENT PLAN</h3>
                    <ol className='relative'>
                      {workflow.filter(step => step.id !== 'step-4-alt').map((step) => (
                        <WorkflowNode key={step.id} step={step} />
                      ))}
                    </ol>
                  </div>
                </ScrollArea>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <Card className={cn('flex-col border-r rounded-none hidden md:flex', className)}>
      <CardHeader className="flex flex-row items-center gap-2 p-4 border-b">
        <GitBranch className="h-6 w-6" />
        <CardTitle className="text-lg">Workflow & Data</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <Accordion type="single" collapsible className="w-full" defaultValue={selectedBu?.id}>
            {businessUnits.map((bu) => (
              <AccordionItem value={bu.id} key={bu.id}>
                <AccordionTrigger 
                  className={cn("px-4 py-3 hover:no-underline hover:bg-muted/50 text-left", selectedBu?.id === bu.id && "bg-accent text-accent-foreground")}
                  onClick={() => handleBuSelect(bu)}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4" style={{ color: bu.color }} />
                    <span className="font-medium">{bu.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pr-4 pt-0 pb-2 space-y-1">
                  {bu.lobs.map((lob) => (
                    <LobItem
                      key={lob.id}
                      lob={lob}
                      onSelect={handleLobSelect}
                      isSelected={selectedLob?.id === lob.id}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className='p-4'>
            <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-4 mt-2">CURRENT PLAN</h3>
            <ol className='relative'>
              {workflow.filter(step => step.id !== 'step-4-alt').map((step) => (
                <WorkflowNode key={step.id} step={step} />
              ))}
            </ol>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
