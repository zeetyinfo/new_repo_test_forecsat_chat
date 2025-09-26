'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitMerge, CheckCircle2, AlertCircle, Circle, Clock, GitBranch, MoreVertical, Play } from 'lucide-react';
import type { WorkflowStep, WorkflowStatus } from '@/lib/types';
import { useApp } from './app-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useEffect } from 'react';

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


export default function WorkflowTree({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const { workflow } = state;

  useEffect(() => {
    let activeIndex = -1;
    const interval = setInterval(() => {
        activeIndex = workflow.findIndex(step => step.status === 'pending');

        if(activeIndex === -1 && workflow.every(s => s.status === 'completed')) {
            // Reset if all completed
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


  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center gap-2 p-4 border-b">
        <GitBranch className="h-6 w-6" />
        <CardTitle className="text-lg">Workflow Tree</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <ol>
              {workflow.filter(step => step.id !== 'step-4-alt').map((step, index, arr) => (
                <WorkflowNode key={step.id} step={step} />
              ))}
            </ol>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
