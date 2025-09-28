
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  Bar,
  ReferenceDot
} from 'recharts';
import type { WeeklyData } from '@/lib/types';
import { format } from 'date-fns';

type ChartType = 'line' | 'bar';

interface DataVisualizerProps {
  data: WeeklyData[];
  target: 'units' | 'revenue';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded-lg shadow-lg">
        <p className="font-bold">{format(new Date(label), 'PPP')}</p>
        <p className="text-sm text-foreground">{`Value: ${payload[0].value.toLocaleString()}`}</p>
        {payload[0].payload.isOutlier && <p className="text-sm text-destructive font-semibold">Outlier Detected</p>}
      </div>
    );
  }
  return null;
};

export default function DataVisualizer({ data, target }: DataVisualizerProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  const formattedData = data.map(item => ({
    ...item,
    dateString: format(new Date(item.date), 'MMM d'),
  }));
  
  const outliers = formattedData.filter(d => d.isOutlier);

  const ChartComponent = chartType === 'line' ? RechartsLineChart : RechartsBarChart;
  const ChartElement = chartType === 'line' ? Line : Bar;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Data Visualization - {target}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'line' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            <LineChart className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === 'bar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateString" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ChartElement
                type="monotone"
                dataKey={target}
                stroke={chartType === 'line' ? "hsl(var(--primary))" : undefined}
                fill={chartType === 'bar' ? "hsl(var(--primary))" : undefined}
                name={target.charAt(0).toUpperCase() + target.slice(1)}
              />
              {outliers.map((outlier, index) => (
                 <ReferenceDot 
                    key={`outlier-${index}`}
                    x={outlier.dateString}
                    y={outlier[target]}
                    r={5}
                    fill="hsl(var(--destructive))"
                    stroke="none"
                 />
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
