'use server';

/**
 * @fileOverview A flow that generates a report from conversation history and data context.
 *
 * - generateReport - A function that handles the report generation process.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateReportInputSchema = z.object({
  conversationHistory: z.string().describe('The entire conversation history as a JSON string.'),
  analysisContext: z.string().describe('The context of the current data analysis, including BU, LOB, and data quality.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

export const GenerateReportOutputSchema = z.object({
  reportMarkdown: z.string().describe('The generated report in Markdown format.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are a Business Intelligence Analyst. Your task is to generate a comprehensive report based on the provided conversation history and data analysis context. The report should be well-structured, easy to read, and formatted in Markdown.

Here is the data to use:

**Analysis Context:**
{{{analysisContext}}}

**Conversation History (JSON):**
{{{conversationHistory}}}

**Report Structure:**
1.  **Title**: Create a clear title for the report.
2.  **Executive Summary**: A brief overview of the findings and recommendations.
3.  **Data Overview**: Describe the dataset that was analyzed (BU, LOB, record count).
4.  **Analysis and Findings**: Detail the key insights discovered during the conversation. Include trends, seasonality, and data quality issues.
5.  **Forecasting Workflow**: If a forecast was performed, describe the steps taken, the models used, and the evaluation results.
6.  **Forecast Results**: Present the final forecast if available.
7.  **Recommendations**: Provide actionable recommendations based on the analysis and forecast.

Generate the report in Markdown format.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
