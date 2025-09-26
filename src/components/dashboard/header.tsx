'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bot, Pause, Play, Settings, User } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

export default function Header() {
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          ForecastFlow BI
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Pause className="mr-2 h-4 w-4" />
          Pause All
        </Button>
        <Button variant="outline" size="sm">
          <Play className="mr-2 h-4 w-4" />
          Resume All
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
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
