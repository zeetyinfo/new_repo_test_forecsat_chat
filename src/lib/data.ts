import type { BusinessUnit, Agent, AgentCommunication, WorkflowStep, WeeklyData } from './types';

function generateWeeklyData(startUnits: number, startRevenue: number): WeeklyData[] {
  const data: WeeklyData[] = [];
  for (let i = 1; i <= 12; i++) {
    const week = `2024-W${String(i).padStart(2, '0')}`;
    const units = Math.floor(startUnits * (1 + (Math.random() - 0.45) * 0.2));
    const revenue = Math.floor(startRevenue * (1 + (Math.random() - 0.4) * 0.25));
    data.push({ week, units, revenue });
  }
  return data;
}

export const mockBusinessUnits: BusinessUnit[] = [
  {
    id: 'bu-001',
    name: 'North America Sales',
    description: 'Sales operations across North America',
    lobs: [
      {
        id: 'lob-001',
        name: 'Enterprise Software',
        description: 'B2B software sales',
        weeklyData: generateWeeklyData(1250, 75000),
      },
      {
        id: 'lob-002',
        name: 'Consumer Electronics',
        description: 'Consumer device sales',
        weeklyData: generateWeeklyData(5500, 330000),
      },
    ],
  },
  {
    id: 'bu-002',
    name: 'European Operations',
    description: 'All European business operations',
    lobs: [
      {
        id: 'lob-003',
        name: 'Automotive Parts',
        description: 'Car parts and accessories',
        weeklyData: generateWeeklyData(15000, 450000),
      },
      {
        id: 'lob-004',
        name: 'Luxury Goods',
        description: 'High-end consumer products',
        weeklyData: generateWeeklyData(800, 1200000),
      },
    ],
  },
  {
    id: 'bu-003',
    name: 'APAC Logistics',
    description: 'Supply chain and logistics in Asia-Pacific',
    lobs: [
       {
        id: 'lob-005',
        name: 'Maritime Shipping',
        description: 'Container shipping and freight',
        weeklyData: generateWeeklyData(25000, 2500000),
      }
    ]
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'agent-01',
    name: 'Data Analysis Agent',
    task: 'Idle',
    status: 'idle',
    successRate: 99.2,
    avgCompletionTime: 2500,
    errorCount: 4,
    cpuUsage: 5,
    memoryUsage: 10,
  },
  {
    id: 'agent-02',
    name: 'Preprocessing Agent',
    task: 'Idle',
    status: 'idle',
    successRate: 98.5,
    avgCompletionTime: 4000,
    errorCount: 8,
    cpuUsage: 8,
    memoryUsage: 15,
  },
  {
    id: 'agent-03',
    name: 'Modeling Agent',
    task: 'Idle',
    status: 'idle',
    successRate: 97.1,
    avgCompletionTime: 15000,
    errorCount: 12,
    cpuUsage: 12,
    memoryUsage: 25,
  },
    {
    id: 'agent-04',
    name: 'Evaluation Agent',
    task: 'Idle',
    status: 'idle',
    successRate: 100,
    avgCompletionTime: 1800,
    errorCount: 0,
    cpuUsage: 4,
    memoryUsage: 8,
  },
    {
    id: 'agent-05',
    name: 'Forecasting Agent',
    task: 'Idle',
    status: 'idle',
    successRate: 99.8,
    avgCompletionTime: 3200,
    errorCount: 2,
    cpuUsage: 6,
    memoryUsage: 12,
  },
];


export const agentCommunications: AgentCommunication[] = [
  {
    timestamp: '2024-01-15T10:45:23Z',
    from: 'Data Analysis Agent',
    to: 'Preprocessing Agent',
    message: 'Pattern analysis complete. Detected strong weekly seasonality. Recommend seasonal decomposition.',
    type: 'task_handoff',
  },
  {
    timestamp: '2024-01-15T10:46:01Z',
    from: 'Preprocessing Agent',
    to: 'Modeling Agent',
    message: 'Data cleaned. 3 outliers removed, 2 new features created. Ready for model training.',
    type: 'data_ready',
  },
  {
    timestamp: '2024-01-15T10:47:15Z',
    from: 'System Orchestrator',
    to: 'All Agents',
    message: 'User requested workflow pause. Completing current tasks before stopping.',
    type: 'user_control',
  },
  {
    timestamp: '2024-01-15T10:49:05Z',
    from: 'Modeling Agent',
    to: 'System Orchestrator',
    message: 'XGBoost training failed. Reverting to LightGBM as per recovery protocol.',
    type: 'system_update',
  },
];

export const mockWorkflow: WorkflowStep[] = [
    {
        id: 'step-1',
        name: 'Data Ingestion',
        status: 'pending',
        dependencies: [],
        estimatedTime: '15s',
        details: 'Upload and validate CSV/Excel data for the selected Line of Business.',
    },
    {
        id: 'step-2',
        name: 'Data Analysis',
        status: 'pending',
        dependencies: ['step-1'],
        estimatedTime: '45s',
        details: 'Perform exploratory data analysis to identify trends, seasonality, and anomalies.',
    },
    {
        id: 'step-3',
        name: 'Data Preprocessing',
        status: 'pending',
        dependencies: ['step-2'],
        estimatedTime: '30s',
        details: 'Clean data, handle missing values, and create features for modeling.',
    },
    {
        id: 'step-4',
        name: 'Model Training',
        status: 'pending',
        dependencies: ['step-3'],
        estimatedTime: '2m 30s',
        details: 'Train multiple forecasting models (e.g., ARIMA, XGBoost) in parallel.',
    },
    {
        id: 'step-4-alt',
        name: 'Fallback Model Training',
        status: 'pending',
        dependencies: ['step-3'],
        estimatedTime: '2m 10s',
        details: 'Train LightGBM as a fallback if primary models fail.',
    },
    {
        id: 'step-5',
        name: 'Model Evaluation',
        status: 'pending',
        dependencies: ['step-4'],
        estimatedTime: '25s',
        details: 'Evaluate models based on accuracy metrics (MAPE, RMSE) and select the best performer.',
    },
    {
        id: 'step-6',
        name: 'Generate Forecast',
        status: 'pending',
        dependencies: ['step-5'],
        estimatedTime: '20s',
        details: 'Generate future forecasts using the best-performing model.',
    },
    {
        id: 'step-7',
        name: 'Result Visualization',
        status: 'pending',
        dependencies: ['step-6'],
        estimatedTime: '10s',
        details: 'Create interactive charts and tables to display the forecast results.',
    },
];
