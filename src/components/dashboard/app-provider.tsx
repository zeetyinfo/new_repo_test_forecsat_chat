
"use client";

import React, { createContext, useContext, useReducer } from 'react';
import type { BusinessUnit, LineOfBusiness, ChatMessage, WorkflowStep } from '@/lib/types';
import { mockBusinessUnits, mockWorkflow } from '@/lib/data';
import type { AgentMonitorProps } from '@/lib/types';

type AppState = {
  businessUnits: BusinessUnit[];
  selectedBu: BusinessUnit | null;
  selectedLob: LineOfBusiness | null;
  messages: ChatMessage[];
  workflow: WorkflowStep[];
  isProcessing: boolean;
  agentMonitor: AgentMonitorProps;
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
  | { type: 'UPLOAD_DATA', payload: { lobId: string, file: File } };


const initialState: AppState = {
  businessUnits: mockBusinessUnits,
  selectedBu: mockBusinessUnits[0],
  selectedLob: mockBusinessUnits[0].lobs[0],
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your BI forecasting assistant. I see you have Premium Order Services selected. What would you like to do?",
    },
  ],
  workflow: [],
  isProcessing: false,
  agentMonitor: {
    isOpen: false,
  },
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
      return { ...state, selectedLob: action.payload, workflow: [], isProcessing: false };
    case 'ADD_MESSAGE':
      // Remove typing indicator before adding new message
      const messages = state.messages.filter(m => !m.isTyping);
      return { ...state, messages: [...messages, action.payload] };
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
      return {
        ...state,
        workflow: newWorkflow,
        isProcessing: isStillProcessing,
      };
    case 'SET_WORKFLOW':
      return { ...state, workflow: action.payload, isProcessing: true };
    case 'RESET_WORKFLOW':
        return { ...state, workflow: [], isProcessing: false };
    case 'SET_AGENT_MONITOR_OPEN':
        return { ...state, agentMonitor: { ...state.agentMonitor, isOpen: action.payload } };
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
      return {
        ...state,
        businessUnits: state.businessUnits.map(bu => ({
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
        }))
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
