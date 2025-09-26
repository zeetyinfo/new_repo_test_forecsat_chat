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
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_AGENT_MONITOR_OPEN'; payload: boolean };


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
  workflow: mockWorkflow,
  isProcessing: false,
  agentMonitor: {
    isOpen: false,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SELECTED_BU':
      return { ...state, selectedBu: action.payload, selectedLob: null };
    case 'SET_SELECTED_LOB':
      return { ...state, selectedLob: action.payload };
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
      return {
        ...state,
        workflow: state.workflow.map(step =>
          step.id === action.payload.id ? { ...step, ...action.payload } : step
        ),
      };
    case 'RESET_WORKFLOW':
        return { ...state, workflow: mockWorkflow };
    case 'SET_AGENT_MONITOR_OPEN':
        return { ...state, agentMonitor: { ...state.agentMonitor, isOpen: action.payload } };
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
