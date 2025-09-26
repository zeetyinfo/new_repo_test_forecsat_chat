export type WeeklyData = {
  week: string;
  units: number;
  revenue: number;
};

export type LineOfBusiness = {
  id: string;
  name: string;
  description: string;
  hasData: boolean;
  dataUploaded: Date | null;
  recordCount: number;
};

export type BusinessUnit = {
  id: string;
  name: string;
  description: string;
  color: string;
  lobs: LineOfBusiness[];
};

export type AgentStatus = 'active' | 'idle' | 'error' | 'completed';

export type Agent = {
  id: string;
  name: string;
  task: string;
  status: AgentStatus;
  successRate: number;
  avgCompletionTime: number; // in ms
  errorCount: number;
  cpuUsage: number;
  memoryUsage: number;
};

export type AgentCommunication = {
  timestamp: string;
  from: string;
  to: string;
  message: string;
  type: 'task_handoff' | 'data_ready' | 'user_control' | 'system_update';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
};

export type WorkflowStatus = 'completed' | 'active' | 'pending' | 'error';

export type WorkflowStep = {
  id: string;
  name: string;
  status: WorkflowStatus;
  dependencies: string[];
  estimatedTime: string; // e.g., "2m 15s"
  details: string;
};
