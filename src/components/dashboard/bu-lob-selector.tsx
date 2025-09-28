'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Folder, PlusCircle, UploadCloud, CheckCircle, FileWarning, Plug, Check } from 'lucide-react';
import { useApp } from './app-provider';
import type { BusinessUnit, LineOfBusiness } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

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


export default function BuLobSelector({
    compact = false,
    className,
    variant = 'ghost',
    size = 'default',
    triggerLabel,
}: { compact?: boolean; className?: string; variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'; size?: 'sm' | 'default' | 'lg' | 'icon'; triggerLabel?: string; }) {
    const { state, dispatch } = useApp();
    const { businessUnits, selectedBu, selectedLob } = state;
    const [isAddBuOpen, setAddBuOpen] = useState(false);
    const [isAddLobOpen, setAddLobOpen] = useState(false);
    const [currentBuForLob, setCurrentBuForLob] = useState<string | null>(null);
    const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});


    const handleBuSelect = (bu: BusinessUnit) => {
        dispatch({ type: 'SET_SELECTED_BU', payload: bu });
        if(bu.lobs.length > 0){
            handleLobSelect(bu.lobs[0], bu);
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

    const handleLobSelect = (lob: LineOfBusiness, bu: BusinessUnit) => {
        dispatch({ type: 'RESET_WORKFLOW' });
        dispatch({ type: 'SET_SELECTED_BU', payload: bu });
        dispatch({ type: 'SET_SELECTED_LOB', payload: lob });

        if (!lob.hasData) {
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `No data is available for **${lob.name}**. Please upload a CSV or Excel file to begin analysis.`
                }
            });
        } else {
            const dataQuality = lob.dataQuality;
            const trend = dataQuality?.trend ? `a ${dataQuality.trend} trend` : "an undetermined trend";
            const seasonality = dataQuality?.seasonality ? ` with ${dataQuality.seasonality.replace(/_/g, ' ')} seasonality` : '';

            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Great! For **${lob.name}**, I have ${lob.recordCount} records. The data shows ${trend}${seasonality}.`,
                    suggestions: ['Analyze data quality', 'Start a 30-day forecast', 'Explain this data']
                }
            })
        }
    };

    const openAddLobModal = (buId: string) => {
        setCurrentBuForLob(buId);
        setAddLobOpen(true);
    }
    
    const handleUploadClick = (lobId: string) => {
        fileInputRefs.current[lobId]?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, lobId: string) => {
        const file = event.target.files?.[0];
        if (file) {
            dispatch({ type: 'UPLOAD_DATA', payload: { lobId, file } });
        }
    };

    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant as any} size={size as any} className={className ?? 'text-white hover:bg-white/20 hover:text-white flex items-center gap-2'}>
                    {compact ? (
                        <>
                          <Plug className="h-4 w-4" />
                          <span>{triggerLabel ?? 'Connectors'}</span>
                          <button
                            className="ml-1 inline-flex items-center justify-center rounded p-1 hover:bg-white/10 disabled:opacity-50"
                            title={selectedLob ? `Attach CSV/Excel to ${selectedLob.name}` : 'Select a BU/LOB first'}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (selectedLob) handleUploadClick(selectedLob.id); }}
                            disabled={!selectedLob}
                          >
                            <UploadCloud className="h-4 w-4" />
                            <span className="sr-only">Attach CSV/Excel</span>
                          </button>
                          <ChevronDown className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                          <span>
                            {selectedBu ? `${selectedBu.name} / ${selectedLob?.name || 'Select LOB'}` : 'Select a Business Unit'}
                          </span>
                          <button
                            className="ml-1 inline-flex items-center justify-center rounded p-1 hover:bg-white/10 disabled:opacity-50"
                            title={selectedLob ? `Attach CSV/Excel to ${selectedLob.name}` : 'Select a BU/LOB first'}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (selectedLob) handleUploadClick(selectedLob.id); }}
                            disabled={!selectedLob}
                          >
                            <UploadCloud className="h-4 w-4" />
                            <span className="sr-only">Attach CSV/Excel</span>
                          </button>
                          <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
                <DropdownMenuLabel>Select Business Unit / LOB</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {businessUnits.map((bu) => (
                    <DropdownMenuSub key={bu.id}>
                        <DropdownMenuSubTrigger>
                            <div className="flex items-center gap-2">
                                <Folder className="mr-2 h-4 w-4" style={{ color: bu.color }}/>
                                <span>{bu.name}</span>
                            </div>
                            {selectedBu?.id === bu.id && (
                                <span className="ml-auto text-xs text-muted-foreground">Current</span>
                            )}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuLabel>{bu.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {bu.lobs.map((lob) => {
                                    const isSelected = selectedLob?.id === lob.id;
                                    return (
                                        <DropdownMenuItem
                                            key={lob.id}
                                            onSelect={() => handleLobSelect(lob, bu)}
                                            className={cn(isSelected && 'bg-accent text-accent-foreground')}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                    <span>{lob.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {lob.hasData ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <FileWarning className="h-4 w-4 text-amber-500" />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUploadClick(lob.id); }}
                                                        title="Attach CSV/Excel"
                                                    >
                                                        <UploadCloud className="h-4 w-4" />
                                                        <span className="sr-only">Attach CSV/Excel</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    );
                                })}
                                {bu.lobs.length === 0 && (
                                    <DropdownMenuItem disabled>No LOBs created yet.</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={(e) => {e.preventDefault(); openAddLobModal(bu.id)}}>
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Add Line of Business
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAddBuOpen(true) }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Business Unit
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <AddBuDialog isOpen={isAddBuOpen} onOpenChange={setAddBuOpen} />
        <AddLobDialog isOpen={isAddLobOpen} onOpenChange={setAddLobOpen} buId={currentBuForLob} />

        {businessUnits.flatMap(bu => bu.lobs).map(lob => (
             <input
                key={lob.id}
                type="file"
                ref={el => fileInputRefs.current[lob.id] = el}
                className="hidden"
                onChange={(e) => handleFileChange(e, lob.id)}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
        ))}
        </>
    )
}
