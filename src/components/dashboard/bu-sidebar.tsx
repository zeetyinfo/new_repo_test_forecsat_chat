'use client';

import { useApp } from './app-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, PlusCircle, Folder, FileText, CheckCircle, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BusinessUnit, LineOfBusiness } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function LobItem({ lob, buColor }: { lob: LineOfBusiness; buColor: string }) {
  const { state, dispatch } = useApp();
  const { selectedLob } = state;

  const handleLobSelect = (lob: LineOfBusiness) => {
    dispatch({ type: 'SET_SELECTED_LOB', payload: lob });
    dispatch({
        type: 'ADD_MESSAGE',
        payload: {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Great! For **${lob.name}**, you can now upload data or start a forecast. What would you like to do?`
        }
    })
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3 px-2 cursor-pointer rounded-md hover:bg-muted/50",
        selectedLob?.id === lob.id && "bg-accent text-accent-foreground"
      )}
      onClick={() => handleLobSelect(lob)}
    >
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{lob.name}</span>
      </div>
      {lob.hasData ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Data uploaded: {lob.dataUploaded?.toLocaleDateString()}</p>
              <p>{lob.recordCount} records</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Upload className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>No data uploaded</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}


export default function BuSidebar() {
  const { state, dispatch } = useApp();
  const { businessUnits, selectedBu } = state;

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

  return (
    <Card className="w-80 border-r border-t-0 border-b-0 border-l-0 rounded-none flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-lg">Business Units</CardTitle>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <PlusCircle className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Business Unit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" defaultValue="New BU" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" placeholder="Describe the new business unit" className="col-span-3" />
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="submit">Create BU</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-full">
            <Accordion type="single" collapsible className="w-full" defaultValue={selectedBu?.id}>
            {businessUnits.map((bu) => (
                <AccordionItem value={bu.id} key={bu.id}>
                <AccordionTrigger 
                    className={cn("px-4 py-3 hover:no-underline hover:bg-muted/50 text-left", selectedBu?.id === bu.id && "bg-muted")}
                    onClick={() => handleBuSelect(bu)}
                    style={{
                        backgroundColor: selectedBu?.id === bu.id ? bu.color : undefined,
                        color: selectedBu?.id === bu.id ? 'white' : undefined
                    }}
                >
                    <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4" style={{ color: selectedBu?.id === bu.id ? 'white' : bu.color }} />
                        <span className="font-medium">{bu.name}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pr-2 pt-0 pb-0">
                    {bu.lobs.map((lob) => (
                      <LobItem key={lob.id} lob={lob} buColor={bu.color} />
                    ))}
                    <div className="flex items-center gap-3 py-3 px-2 cursor-pointer rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50">
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-sm">Add Line of Business</span>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
