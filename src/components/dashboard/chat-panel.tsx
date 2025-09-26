
'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Paperclip, Send, User } from 'lucide-react';
import { useApp } from './app-provider';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';
import OpenAI from 'openai';
import { mockWorkflow } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgentMonitorPanel from './agent-monitor';


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
    const { selectedBu, selectedLob, businessUnits } = context;
    
    const getAvailableDataSummary = () => {
        return businessUnits.map((bu:any) => 
            `${bu.name} - ${bu.lobs.map((l:any) => `${l.name} (${l.recordCount} records)`).join(', ')}`
        ).join('\n');
    }

    return `You are an intelligent Business Intelligence forecasting assistant. 

CURRENT CONTEXT:
- Selected BU: ${selectedBu?.name || 'None'}
- Selected LOB: ${selectedLob?.name || 'None'}
- Available LOBs with data: ${getAvailableDataSummary()}

AVAILABLE BUSINESS UNITS WITH DATA:
${businessUnits.map((bu:any) => `
- ${bu.name}
  ${bu.lobs.map((lob:any) => `- ${lob.name} LOB: ${lob.recordCount} weekly records (${lob.hasData ? 'ready for analysis' : 'no data'})`).join('\n  ')}
`).join('\n')}

INTELLIGENCE REQUIREMENTS:
- When a user wants to start a forecast, you MUST trigger a workflow. To do so, include the command string "[START_WORKFLOW]" in your response.
- When user asks for forecasting, create a SPECIFIC plan based on the selected LOB data
- Suggest concrete steps: analyze patterns, preprocess data, train models, generate forecasts
- Reference the actual data available for their selected LOB
- Ask intelligent follow-up questions about forecast horizon, business objectives
- If they haven't selected a LOB, guide them to choose from available data
- Be dynamic and context-aware, not generic

CRITICAL INSTRUCTION: At the end of EVERY response, you MUST guide the user on what to do next. Provide a section like "**What's next?**" with 2-3 brief, actionable suggestions as bullet points. These suggestions should be phrased as if they are the USER's next request. For example, instead of "Start a forecast," the suggestion should be "Can you start a forecast for me?" or "Show me the data quality report." This is mandatory.

CRITICAL: Users DO NOT need to upload data for existing LOBs - they have mock data ready to use. If a LOB has no data, they should be prompted to upload it.

Your responses should be intelligent, specific to their data, and action-oriented.`;
  }
}

const chatHandler = new IntelligentChatHandler();

function ChatBubble({ message, onSuggestionClick }: { message: ChatMessage, onSuggestionClick: (suggestion: string) => void }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          {assistantAvatar && <AvatarImage src={assistantAvatar.imageUrl} alt="Assistant" data-ai-hint={assistantAvatar.imageHint} />}
          <AvatarFallback><Bot /></AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-prose", isUser ? "order-1" : "")}>
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
            <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\[START_WORKFLOW\]/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
            )}
        </div>
        {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                    <Button key={index} size="sm" variant="outline" onClick={() => onSuggestionClick(suggestion)}>
                        {suggestion}
                    </Button>
                ))}
            </div>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.scrollTo({
                top: scrollElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    }
  }, [state.messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (state.selectedLob) {
            dispatch({ type: 'UPLOAD_DATA', payload: { lobId: state.selectedLob.id, file } });
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `I've uploaded "${file.name}" for the ${state.selectedLob.name} LOB. I'm analyzing the contents now.`
                }
            })
        } else {
             dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Please select a Line of Business from the sidebar before uploading data.`
                }
            })
        }
    }
  };

    const submitMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: messageText,
        };
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

        const typingMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '',
            isTyping: true,
        };
        dispatch({ type: 'ADD_MESSAGE', payload: typingMessage });

        try {
            const responseText = await chatHandler.generateResponse(messageText, {
                selectedBu: state.selectedBu,
                selectedLob: state.selectedLob,
                businessUnits: state.businessUnits,
            });

            if (responseText.includes('[START_WORKFLOW]')) {
                dispatch({ type: 'SET_WORKFLOW', payload: mockWorkflow });
            }

            const suggestionRegex = /\*\*What's next\?\*\*([\s\S]*)/;
            const match = responseText.match(suggestionRegex);
            let content = responseText;
            let suggestions: string[] = [];

            if (match && match[1]) {
                content = responseText.replace(suggestionRegex, '').trim();
                suggestions = match[1]
                    .split(/[\n•-]/)
                    .map(s => s.trim().replace(/^"|"$/g, '')) // trim and remove quotes
                    .filter(s => s.length > 0);
            }

            const assistantMessage: Partial<ChatMessage> = {
                content: content,
                suggestions: suggestions,
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
        }
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userInput = formData.get('message') as string;
        e.currentTarget.reset();
        submitMessage(userInput);
    };

    const handleSuggestionClick = (suggestion: string) => {
        submitMessage(suggestion);
    };

  return (
    <>
    <Card className={cn('flex flex-col h-full border-0 shadow-none rounded-none', className)}>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                {state.messages.map(message => (
                    <ChatBubble key={message.id} message={message} onSuggestionClick={handleSuggestionClick} />
                ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-card">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-5 w-5" />
              </Button>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
              <Input name="message" placeholder="Ask about forecasting..." autoComplete="off" disabled={state.isProcessing} />
              <Button type="submit" size="icon" disabled={state.isProcessing}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
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
}

    