
'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Paperclip, Send, User, BarChart } from 'lucide-react';
import { useApp } from './app-provider';
import type { ChatMessage, WeeklyData, WorkflowStep } from '@/lib/types';
import { cn } from '@/lib/utils';
import OpenAI from 'openai';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgentMonitorPanel from './agent-monitor';
import DataVisualizer from './data-visualizer';


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
    
    let lobDataSummary = 'No data available.';
    if (selectedLob && selectedLob.hasData) {
        lobDataSummary = `${selectedLob.recordCount} records. The data shows ${selectedLob.dataQuality?.trend || 'an unknown'} trend and ${selectedLob.dataQuality?.seasonality?.replace(/_/g, ' ') || 'unknown'} seasonality. Completeness is ${selectedLob.dataQuality?.completeness}% with ${selectedLob.dataQuality?.outliers} outliers detected.`;
    }

    return `You are an intelligent Business Intelligence forecasting assistant. Your goal is to guide users through a data science lifecycle for forecasting. ALL of your responses MUST be in the context of the user's selected data.

CURRENT CONTEXT:
- Business Unit: ${selectedBu?.name || 'None'}
- Line of Business: ${selectedLob?.name || 'None'}
- Data Summary for selected LOB: ${lobDataSummary}

YOUR BEHAVIOR:
1.  **Be Context-Aware**: Every query is about the selected LOB data. When the user asks to "analyze the data" or a similar query, you MUST use the "Data Summary" above to provide a specific, insightful analysis. Do NOT give a generic explanation of what data analysis is. Start your response with something like: "Certainly. Analyzing the data for ${selectedLob?.name}..."
2.  **Guide the User**: When a user selects a Line of Business (LOB), your first response should be an immediate analysis of that data.
3.  **Dynamic Workflow Planning**: When a user asks to create a forecast, plan a workflow, or analyze data, you MUST respond with a detailed, step-by-step plan. This plan should be a JSON array embedded in your response using the format [WORKFLOW_PLAN]{...}[/WORKFLOW_PLAN]. The JSON should be an array of objects, each with 'name', 'details', 'estimatedTime', and 'agent' properties.
    - Example for a full forecast: [WORKFLOW_PLAN][{"name": "Data Analysis", "details": "Analyzing trends...", "estimatedTime": "30s", "agent": "Data Analysis Agent"}, ...][/WORKFLOW_PLAN]
    - Example for just analysis: [WORKFLOW_PLAN][{"name": "Data Ingestion", "details": "Loading data...", "estimatedTime": "10s", "agent": "Orchestrator Agent"}, {"name": "Exploratory Analysis", "details": "Calculating key stats...", "estimatedTime": "25s", "agent": "Data Analysis Agent"}][/WORKFLOW_PLAN]
    The plan MUST be appropriate for the user's request. A simple analysis request should have a shorter workflow than a full end-to-end forecast request.
4.  **Actionable Suggestions**: At the end of EVERY response, provide a "**What's next?**" section with 2-3 brief, actionable suggestions as bullet points. These suggestions MUST be phrased as direct commands from the user to you.
    - Correct format: "Start a 30-day forecast" or "Analyze data quality".
    - Incorrect format: "Would you like to start a forecast?"

Your responses should be intelligent, specific to their data, and action-oriented.`;
  }
}

const chatHandler = new IntelligentChatHandler();

function ChatBubble({ message, onSuggestionClick, onVisualizeClick }: { message: ChatMessage, onSuggestionClick: (suggestion: string) => void, onVisualizeClick: (messageId: string, data: WeeklyData[]) => void }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
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
            <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\[WORKFLOW_PLAN\].*\[\/WORKFLOW_PLAN\]/s, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
            )}
        </div>
        {message.visualization?.isShowing && message.visualization.data && (
            <div className="mt-2">
                <DataVisualizer data={message.visualization.data} target={message.visualization.target} />
            </div>
        )}
        {(message.suggestions || (message.visualization && !message.visualization.isShowing)) && (
            <div className="mt-2 flex flex-wrap gap-2">
                {message.visualization && !message.visualization.isShowing && (
                     <Button size="sm" variant="outline" onClick={() => onVisualizeClick(message.id, message.visualization!.data)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Visualize Data
                    </Button>
                )}
                {message.suggestions?.map((suggestion, index) => (
                    <Button key={index} size="sm" variant="outline" onClick={() => onSuggestionClick(suggestion)}>
                        {suggestion}
                    </Button>
                ))}
            </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
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
        dispatch({ type: 'SET_PROCESSING', payload: true });

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

            const workflowPlanRegex = /\[WORKFLOW_PLAN\](.*)\[\/WORKFLOW_PLAN\]/s;
            const workflowMatch = responseText.match(workflowPlanRegex);
            
            if (workflowMatch && workflowMatch[1]) {
              try {
                const planJson = JSON.parse(workflowMatch[1]);
                const newWorkflow: WorkflowStep[] = planJson.map((step: any, index: number) => ({
                    ...step,
                    id: `step-${index + 1}`,
                    status: 'pending',
                    dependencies: index > 0 ? [`step-${index}`] : []
                }));
                dispatch({ type: 'SET_WORKFLOW', payload: newWorkflow });
              } catch(e) {
                console.error("Failed to parse workflow plan:", e);
                dispatch({ type: 'SET_PROCESSING', payload: false });
              }
            } else {
                dispatch({ type: 'SET_PROCESSING', payload: false });
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
            
            let visualization;
            const keywords = ['analyze', 'forecast', 'data', 'visualize'];
            const shouldVisualize = keywords.some(keyword => messageText.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword));

            if(shouldVisualize && state.selectedLob?.hasData && state.selectedLob?.mockData) {
                visualization = {
                    data: state.selectedLob.mockData,
                    target: 'units' as 'units' | 'revenue',
                    isShowing: false,
                }
            }


            const assistantMessage: Partial<ChatMessage> = {
                content: content,
                suggestions: suggestions,
                isTyping: false,
                visualization
            };
            dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: assistantMessage });

        } catch (error) {
            console.error("Error calling AI:", error);
            const errorMessage: Partial<ChatMessage> = {
                content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                isTyping: false
            };
            dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: errorMessage });
            dispatch({ type: 'SET_PROCESSING', payload: false });
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
    
    const handleVisualizeClick = (messageId: string) => {
      dispatch({ type: 'TOGGLE_VISUALIZATION', payload: { messageId } });
    };


    const isAssistantTyping = state.isProcessing || state.messages[state.messages.length - 1]?.isTyping;


  return (
    <>
    <Card className={cn('flex flex-col h-full border-0 shadow-none rounded-none', className)}>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                {state.messages.map(message => (
                    <ChatBubble 
                      key={message.id} 
                      message={message} 
                      onSuggestionClick={handleSuggestionClick}
                      onVisualizeClick={() => handleVisualizeClick(message.id)} 
                    />
                ))}
                 {isAssistantTyping && !state.messages.some(m => m.isTyping) && (
                    <ChatBubble 
                        message={{ id: 'typing-indicator', role: 'assistant', content: '', isTyping: true }} 
                        onSuggestionClick={() => {}} 
                        onVisualizeClick={() => {}}
                    />
                )}
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
              <Input name="message" placeholder="Ask about forecasting..." autoComplete="off" disabled={isAssistantTyping} />
              <Button type="submit" size="icon" disabled={isAssistantTyping}>
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

    