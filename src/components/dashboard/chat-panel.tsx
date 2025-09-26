
'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Paperclip, Send, User } from 'lucide-react';
import { useApp } from './app-provider';
import type { ChatMessage, WorkflowStep } from '@/lib/types';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, LineChart, Table } from 'lucide-react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import OpenAI from 'openai';
import { mockBusinessUnits } from '@/lib/data';

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
const assistantAvatar = placeholderImages.placeholderImages.find(p => p.id === 'assistant-avatar');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for demo - use backend in production
});

class IntelligentChatHandler {
  conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[];
  
  constructor() {
    this.conversationHistory = [];
  }

  async generateResponse(userMessage: string, context: any) {
    const systemPrompt = this.buildSystemPrompt(context);
    
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });

    // Add system prompt at the beginning of the history for context
    const messages: any = [
        { role: "system", content: systemPrompt },
        ...this.conversationHistory
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = completion.choices[0].message.content;
      
      if (aiResponse) {
        this.conversationHistory.push({
          role: "assistant",
          content: aiResponse
        });
      }

      return aiResponse || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('OpenAI Error:', error);
      return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
  }

  buildSystemPrompt(context: any) {
    const { selectedBu, selectedLob } = context;
    
    return `You are an intelligent Business Intelligence forecasting assistant. 

CURRENT CONTEXT:
- Selected BU: ${selectedBu?.name || 'None'}
- Selected LOB: ${selectedLob?.name || 'None'}
- Available LOBs with data: ${this.getAvailableDataSummary()}

AVAILABLE BUSINESS UNITS WITH DATA:
${mockBusinessUnits.map(bu => `
- ${bu.name}
  ${bu.lobs.map(lob => `- ${lob.name} LOB: ${lob.recordCount} weekly records (ready for analysis)`).join('\n  ')}
`).join('\n')}

INTELLIGENCE REQUIREMENTS:
- When user asks for forecasting, create a SPECIFIC plan based on the selected LOB data
- Suggest concrete steps: analyze patterns, preprocess data, train models, generate forecasts
- Reference the actual data available for their selected LOB
- Ask intelligent follow-up questions about forecast horizon, business objectives
- If they haven't selected a LOB, guide them to choose from available data
- Be dynamic and context-aware, not generic

CRITICAL: Users DO NOT need to upload data for existing LOBs - they have mock data ready to use.

Your responses should be intelligent, specific to their data, and action-oriented.`;
  }

  getAvailableDataSummary() {
    return mockBusinessUnits.map(bu => 
        `${bu.name} - ${bu.lobs.map(l => `${l.name} (${l.recordCount} records)`).join(', ')}`
    ).join('\n');
  }
}

const chatHandler = new IntelligentChatHandler();

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
          'max-w-prose rounded-lg p-3 text-sm prose prose-sm prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0 prose-headings:my-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          'prose-strong:text-current'
        )}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
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
    
    const typingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        isTyping: true,
    }
    dispatch({ type: 'ADD_MESSAGE', payload: typingMessage });


    try {
        const responseText = await chatHandler.generateResponse(userInput, {
            selectedBu: state.selectedBu,
            selectedLob: state.selectedLob,
        });

        const assistantMessage: Partial<ChatMessage> = {
            content: responseText,
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
    <Card className={cn('flex flex-col h-full border-0 shadow-none rounded-none', className)}>
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
