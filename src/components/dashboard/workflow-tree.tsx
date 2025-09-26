
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitMerge, CheckCircle2, AlertCircle, Circle, Clock, GitBranch, MoreVertical, Play, Folder, UploadCloud, FileWarning, CheckCircle, PlusCircle } from 'lucide-react';
import type { WorkflowStep, WorkflowStatus, BusinessUnit, LineOfBusiness } from '@/lib/types';
import { useApp } from './app-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("rounded-full h-10 w-10 flex items-center justify-center bg-muted", config.color, step.status === 'active' && 'animate-pulse ring-4 ring-blue-500/50')}>
                        {React.cloneElement(config.icon as React.ReactElement, { className: "h-6 w-6 text-white"})}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="capitalize">{step.status}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        {/* Render line only if it's not the last step */}
        <div className="w-px h-full bg-border" />
      </div>
      <div className="pb-8 flex-1">
        <div className="flex items-center justify-between group">
            <p className={cn("font-medium", step.status === 'active' && 'text-primary')}>{step.name}</p>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p className="max-w-xs">{step.details}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">Est. time: {step.estimatedTime}</p>
        {step.agent && <p className="text-xs text-muted-foreground">Agent: {step.agent}</p>}
      </div>
    </li>
  );
}

const LobItem = ({ lob, onSelect, isSelected }: { lob: LineOfBusiness, onSelect: (lob: LineOfBusiness) => void, isSelected: boolean }) => {
    const { dispatch } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSelect = () => {
        onSelect(lob);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            dispatch({ type: 'UPLOAD_DATA', payload: { lobId: lob.id, file } });
        }
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
             <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      {!lob.hasData && (
                          <FileWarning className="h-4 w-4 text-amber-500" />
                      )}
                      {lob.hasData && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{lob.hasData ? 'Data ready for analysis' : 'No data available for this LOB.'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            {lob.recordCount > 0 && (
              <span className="text-xs text-muted-foreground">{lob.recordCount} records</span>
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
                    onClick={handleUploadClick}
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
       <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
    </div>
  );
};


function AddBuDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { dispatch } = useApp();

    const handleSubmit = () => {
        if (name) {
            dispatch({ type: 'ADD_BU', payload: { name, description } });
            onOpenChange(false);
            setName('');
            setDescription('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Business Unit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddLobDialog({ isOpen, onOpenChange, buId }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, buId: string | null }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { dispatch } = useApp();

    const handleSubmit = () => {
        if (name && buId) {
            dispatch({ type: 'ADD_LOB', payload: { buId, name, description } });
            onOpenChange(false);
            setName('');
            setDescription('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Line of Business</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function WorkflowTree({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const { workflow, businessUnits, selectedBu, selectedLob } = state;
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const [isAddBuOpen, setAddBuOpen] = useState(false);
  const [isAddLobOpen, setAddLobOpen] = useState(false);
  const [currentBuForLob, setCurrentBuForLob] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!state.isProcessing || workflow.every(s => s.status === 'completed')) {
        if (state.isProcessing) {
            dispatch({ type: 'SET_PROCESSING', payload: false });
        }
        return;
    };
  
    const interval = setInterval(() => {
        const currentIndex = workflow.findIndex(step => step.status === 'active');
        
        if (currentIndex !== -1) {
            // Complete the current step
            dispatch({ 
                type: 'UPDATE_WORKFLOW_STEP', 
                payload: { id: workflow[currentIndex].id, status: 'completed' } 
            });
            
            // Activate the next step if it exists
            if (currentIndex + 1 < workflow.length) {
                dispatch({ 
                    type: 'UPDATE_WORKFLOW_STEP', 
                    payload: { id: workflow[currentIndex + 1].id, status: 'active' } 
                });
            }
        } else {
             // If no step is active, find the first pending one and activate it
            const firstPendingIndex = workflow.findIndex(step => step.status === 'pending');
            if (firstPendingIndex !== -1) {
                 dispatch({ 
                    type: 'UPDATE_WORKFLOW_STEP', 
                    payload: { id: workflow[firstPendingIndex].id, status: 'active' } 
                });
            }
        }
    }, 2500);
  
    return () => clearInterval(interval);
  }, [workflow, dispatch, state.isProcessing]);


  const handleBuSelect = (bu: BusinessUnit) => {
    dispatch({ type: 'SET_SELECTED_BU', payload: bu });
    if(bu.lobs.length > 0){
        handleLobSelect(bu.lobs[0]);
    } else {
        dispatch({ type: 'SET_SELECTED_LOB', payload: null });
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Switched to Business Unit: **${bu.name}**. It has no Lines of Business. You can add one.`
            }
        });
    }
  };

  const handleLobSelect = (lob: LineOfBusiness) => {
    dispatch({ type: 'RESET_WORKFLOW' });
    if (!lob.hasData) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `No data is available for **${lob.name}**. Please upload data to begin analysis.`
        }
      });
    } else {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Great! For **${lob.name}**, I have ${lob.recordCount} records ready. What would you like to do?`
            }
        })
    }
    dispatch({ type: 'SET_SELECTED_LOB', payload: lob });
  };

  const openAddLobModal = (buId: string) => {
    setCurrentBuForLob(buId);
    setAddLobOpen(true);
  }

  const renderContent = () => (
    <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
        <Accordion type="multiple" className="w-full" defaultValue={businessUnits.map(bu => bu.id)}>
            {businessUnits.map((bu) => (
            <AccordionItem value={bu.id} key={bu.id}>
                 <div 
                    className={cn("flex items-center px-4 hover:bg-muted/50 group", selectedBu?.id === bu.id && "bg-accent text-accent-foreground")}
                >
                    <AccordionTrigger 
                        className="flex-1 text-left py-2 hover:no-underline"
                        onClick={() => handleBuSelect(bu)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <Folder className="h-4 w-4" style={{ color: bu.color }} />
                            <span className="font-medium">{bu.name}</span>
                        </div>
                    </AccordionTrigger>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); openAddLobModal(bu.id); }}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Line of Business to {bu.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <AccordionContent className="pl-8 pr-4 pt-0 pb-2 space-y-1">
                {bu.lobs.map((lob) => (
                    <LobItem
                    key={lob.id}
                    lob={lob}
                    onSelect={handleLobSelect}
                    isSelected={selectedLob?.id === lob.id}
                    />
                ))}
                 {bu.lobs.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1">No Lines of Business yet.</p>
                )}
                </AccordionContent>
            </AccordionItem>
            ))}
        </Accordion>
        <div className="p-4">
            <Button variant="outline" className="w-full" onClick={() => setAddBuOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Business Unit
            </Button>
        </div>

        <div className='p-4 border-t'>
            <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-4 mt-2 flex items-center gap-2">
                <GitMerge className="h-4 w-4" />
                CURRENT WORKFLOW
            </h3>
            {workflow.length > 0 ? (
                <ol className='relative'>
                    {workflow.map((step, index) => (
                       <React.Fragment key={step.id}>
                            <WorkflowNode step={step} />
                            {index < workflow.length -1 && <div className="w-px h-4 bg-border ml-5" />}
                        </React.Fragment>
                    ))}
                </ol>
            ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                    <p>No active workflow.</p>
                    <p>Start by asking the assistant to perform a task.</p>
                </div>
            )}
        </div>
        </ScrollArea>
        <AddBuDialog isOpen={isAddBuOpen} onOpenChange={setAddBuOpen} />
        <AddLobDialog isOpen={isAddLobOpen} onOpenChange={setAddLobOpen} buId={currentBuForLob} />
    </div>
  );

  if (isMobile) {
    return (
      <div className={cn("md:hidden", className)}>
        <Accordion type="single" collapsible className="w-full" defaultValue={isOpen ? "workflow" : ""}>
          <AccordionItem value="workflow">
            <AccordionTrigger onClick={() => setIsOpen(!isOpen)} className="bg-card p-4 border-b">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6" />
                <span className="text-lg font-semibold">Workflow & Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {renderContent()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <Card className={cn('flex-col border-r rounded-none hidden md:flex', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b">
        <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            <CardTitle className="text-lg">Workflow & Data</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
