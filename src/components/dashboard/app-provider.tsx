"use client";

import React, { createContext, useContext, useReducer } from 'react';
import type { BusinessUnit, LineOfBusiness, ChatMessage, WorkflowStep } from '@/lib/types';
import { mockBusinessUnits } from '@/lib/data';
import type { AgentMonitorProps } from '@/lib/types';

type AppState = {
  businessUnits: BusinessUnit[];
  selectedBu: BusinessUnit | null;
  selectedLob: LineOfBusiness | null;
  messages: ChatMessage[];
  workflow: WorkflowStep[];
  isProcessing: boolean;
  agentMonitor: AgentMonitorProps;
  dataPanelOpen: boolean;
  dataPanelMode: 'chart' | 'table' | 'menu';
  dataPanelTarget: 'units' | 'revenue';
  dataPanelWidthPct: number; // 20 - 70
  isOnboarding: boolean;
  queuedUserPrompt?: string | null;
};

type Action =
  | { type: 'SET_SELECTED_BU'; payload: BusinessUnit | null }
  | { type: 'SET_SELECTED_LOB'; payload: LineOfBusiness | null }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: Partial<ChatMessage> }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'UPDATE_WORKFLOW_STEP'; payload: Partial<WorkflowStep> & { id: string } }
  | { type: 'SET_WORKFLOW'; payload: WorkflowStep[] }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_AGENT_MONITOR_OPEN'; payload: boolean }
  | { type: 'ADD_BU'; payload: { name: string; description: string } }
  | { type: 'ADD_LOB'; payload: { buId: string; name: string; description: string } }
  | { type: 'UPLOAD_DATA', payload: { lobId: string, file: File } }
  | { type: 'TOGGLE_VISUALIZATION', payload: { messageId: string } }
  | { type: 'SET_DATA_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_DATA_PANEL_MODE'; payload: 'chart' | 'table' | 'menu' }
  | { type: 'SET_DATA_PANEL_TARGET'; payload: 'units' | 'revenue' }
  | { type: 'SET_DATA_PANEL_WIDTH'; payload: number }
  | { type: 'END_ONBOARDING' }
  | { type: 'QUEUE_USER_PROMPT'; payload: string }
  | { type: 'CLEAR_QUEUED_PROMPT' };


const initialState: AppState = {
  businessUnits: mockBusinessUnits,
  selectedBu: null,
  selectedLob: null,
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your BI forecasting assistant. Select a Business Unit and Line of Business to get started.",
    },
  ],
  workflow: [],
  isProcessing: false,
  agentMonitor: {
    isOpen: false,
  },
  dataPanelOpen: false,
  dataPanelMode: 'chart',
  dataPanelTarget: 'units',
  dataPanelWidthPct: 40,
  isOnboarding: true,
  queuedUserPrompt: null,
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SELECTED_BU':
      return { ...state, selectedBu: action.payload, selectedLob: action.payload?.lobs[0] || null, workflow: [], isProcessing: false };
    case 'SET_SELECTED_LOB':
        const isStillProcessingOnLobChange = state.workflow.some(step => step.status === 'active' || step.status === 'pending');
        return { ...state, selectedLob: action.payload, workflow: [], isProcessing: isStillProcessingOnLobChange };
    case 'ADD_MESSAGE': {
      // Remove typing indicator before adding new message
      const messages = state.messages.filter(m => !m.isTyping);
      const last = messages[messages.length - 1];
      const isDuplicate = last && last.role === action.payload.role && last.content.trim() === action.payload.content.trim();
      return isDuplicate ? state : { ...state, messages: [...messages, action.payload] };
    }
    case 'UPDATE_LAST_MESSAGE':
        const updatedMessages = [...state.messages];
        const lastMessageIndex = updatedMessages.length - 1;
        if(lastMessageIndex >= 0) {
            updatedMessages[lastMessageIndex] = { ...updatedMessages[lastMessageIndex], ...action.payload };
        }
        return { ...state, messages: updatedMessages };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'UPDATE_WORKFLOW_STEP':
        const newWorkflow = state.workflow.map(step =>
            step.id === action.payload.id ? { ...step, ...action.payload } : step
          );
        const isStillProcessing = newWorkflow.some(step => step.status === 'active' || step.status === 'pending');
         // If all steps are completed, set isProcessing to false
        const allCompleted = newWorkflow.every(step => step.status === 'completed');
        
      return {
        ...state,
        workflow: newWorkflow,
        isProcessing: allCompleted ? false : isStillProcessing,
      };
    case 'SET_WORKFLOW':
      return { ...state, workflow: action.payload, isProcessing: true };
    case 'RESET_WORKFLOW':
        return { ...state, workflow: [], isProcessing: false };
    case 'SET_AGENT_MONITOR_OPEN':
        return { ...state, agentMonitor: { ...state.agentMonitor, isOpen: action.payload } };
    case 'SET_DATA_PANEL_OPEN':
        return { ...state, dataPanelOpen: action.payload };
    case 'END_ONBOARDING':
        return { ...state, isOnboarding: false };
    case 'QUEUE_USER_PROMPT':
        return { ...state, queuedUserPrompt: action.payload };
    case 'CLEAR_QUEUED_PROMPT':
        return { ...state, queuedUserPrompt: null };
    case 'ADD_BU': {
        const newBu: BusinessUnit = {
            id: `bu-${crypto.randomUUID()}`,
            name: action.payload.name,
            description: action.payload.description,
            color: getRandomColor(),
            lobs: [],
        };
        return { ...state, businessUnits: [...state.businessUnits, newBu] };
    }
    case 'ADD_LOB': {
        const newLob: LineOfBusiness = {
            id: `lob-${crypto.randomUUID()}`,
            name: action.payload.name,
            description: action.payload.description,
            hasData: false,
            dataUploaded: null,
            recordCount: 0,
        };
        return {
            ...state,
            businessUnits: state.businessUnits.map(bu =>
                bu.id === action.payload.buId
                    ? { ...bu, lobs: [...bu.lobs, newLob] }
                    : bu
            ),
        };
    }
    case 'UPLOAD_DATA': {
      // Here you would process the file. For now, we'll just simulate it.
      const recordCount = Math.floor(Math.random() * 5000) + 500; // Simulate records
      const businessUnitsWithData = state.businessUnits.map(bu => ({
          ...bu,
          lobs: bu.lobs.map(lob =>
            lob.id === action.payload.lobId
              ? {
                ...lob,
                hasData: true,
                file: action.payload.file,
                recordCount: recordCount,
                dataUploaded: new Date(),
                dataQuality: {
                  completeness: 99,
                  outliers: Math.floor(Math.random() * 10),
                  seasonality: 'unknown',
                  trend: 'unknown'
                }
              }
              : lob
          )
        }));
        
        const updatedLob = businessUnitsWithData
            .flatMap(bu => bu.lobs)
            .find(lob => lob.id === action.payload.lobId);

        const newMessages: ChatMessage[] = [...state.messages];
        
        if (updatedLob) {
            newMessages.push({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `I've uploaded "${action.payload.file.name}" and analyzed it for the ${updatedLob.name} LOB. It has ${updatedLob.recordCount} records. What would you like to do next?`,
                suggestions: ['Analyze data quality', 'Start a 30-day forecast', 'Explain this data']
            });
        }
      return {
        ...state,
        businessUnits: businessUnitsWithData,
        messages: newMessages
      };
    }
    case 'TOGGLE_VISUALIZATION': {
      return {
        ...state,
        messages: state.messages.map(msg => {
          if (msg.id === action.payload.messageId && msg.visualization) {
            return {
              ...msg,
              visualization: {
                ...msg.visualization,
                isShowing: !msg.visualization.isShowing,
              },
            };
          }
          return msg;
        })
      };
    }
    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
