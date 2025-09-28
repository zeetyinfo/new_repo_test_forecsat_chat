
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, User, Bot, BarChart, Sun, Moon } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useApp } from './app-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgentMonitorPanel from './agent-monitor';
import BuLobSelector from './bu-lob-selector';

const ThemeToggle = () => {
    const [theme, setTheme] = React.useState('light');

    React.useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            title="Toggle Theme"
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
};


const SettingsDropdown = () => {
    const { state, dispatch } = useApp();

    const showAgentMonitor = () => {
        dispatch({ type: 'SET_AGENT_MONITOR_OPEN', payload: true });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                        <Settings className="w-5 h-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>System Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={showAgentMonitor}>
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Show Agent Monitor Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <span>System Status & Health</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <span>OpenAI Configuration</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        <p>OpenAI Status: <span className="text-green-600">Connected</span></p>
                        <p>Model: GPT-4</p>
                        <p>Requests Today: 47/1000</p>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={state.agentMonitor.isOpen} onOpenChange={(isOpen) => dispatch({ type: 'SET_AGENT_MONITOR_OPEN', payload: isOpen })}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Agent Activity Monitor</DialogTitle>
                    </DialogHeader>
                    <AgentMonitorPanel className="flex-1 min-h-0" />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default function Header() {
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
  const { dispatch } = useApp();

  const showAgentMonitor = () => {
    dispatch({ type: 'SET_AGENT_MONITOR_OPEN', payload: true });
  };

  return (
    <header className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">BI Forecasting Assistant</h1>
             <span className="text-sm opacity-80 hidden md:inline">|</span>
            <BuLobSelector />
        </div>
        
        <div className="flex items-center space-x-4">
             <ThemeToggle />
            <button 
                onClick={showAgentMonitor}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                title="Show Agent Monitor"
            >
                <Bot className="w-5 h-5" />
            </button>
            
            <SettingsDropdown />
            
            <div className="w-3 h-3 bg-green-400 rounded-full" title="System Online"></div>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10">
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
                    <AvatarFallback>
                    <User />
                    </AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">BI Analyst</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    analyst@example.com
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
  );
}
