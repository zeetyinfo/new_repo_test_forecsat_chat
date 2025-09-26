'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Paperclip, Send, User } from 'lucide-react';
import { useApp } from './app-provider';
import { FormEvent, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getContextualHelp } from '@/ai/flows/chatbot-contextual-help';
import placeholderImages from '@/lib/placeholder-images.json';

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
const assistantAvatar = placeholderImages.placeholderImages.find(p => p.id === 'assistant-avatar');

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          {assistantAvatar && <AvatarImage src={assistantAvatar.imageUrl} alt="Assistant" data-ai-hint={assistantAvatar.imageHint} />}
          <AvatarFallback><Bot /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xs rounded-lg p-3 text-sm prose prose-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          'prose-p:m-0 prose-headings:m-0 prose-strong:text-current'
        )}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function ChatPanel({ className }: { className?: string }) {
  const { state, dispatch } = useApp();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [state.messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userInput = formData.get('message') as string;

    if (!userInput.trim()) return;

    e.currentTarget.reset();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        isTyping: true,
    }
    dispatch({ type: 'ADD_MESSAGE', payload: typingMessage });


    try {
        const { helpText } = await getContextualHelp({
            businessUnit: state.selectedBu?.name || 'Not selected',
            lineOfBusiness: state.selectedLob?.name || 'Not selected',
            query: userInput
        });

        const assistantMessage: Partial<ChatMessage> = {
            content: helpText,
            isTyping: false,
        };
        dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: assistantMessage });

    } catch (error) {
        console.error("Error calling AI:", error);
        const errorMessage: Partial<ChatMessage> = {
            content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
            isTyping: false
        };
        dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: errorMessage });
    } finally {
        dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center gap-2 p-4 border-b">
        <Bot className="h-6 w-6" />
        <CardTitle className="text-lg">BI Onboarding Agent</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {state.messages.map(message => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-card">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Button variant="ghost" size="icon" type="button">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input name="message" placeholder="Ask about forecasting..." autoComplete="off" disabled={state.isProcessing} />
              <Button type="submit" size="icon" disabled={state.isProcessing}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
