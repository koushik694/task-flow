import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Task, User } from '../types';

// Lazily initialize the AI client to avoid crashing if the API key is not set.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getOptimizationTips = async (tasks: Task[], users: User[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "Could not generate insights: API_KEY is not configured.\nPlease set the `API_KEY` environment variable to use this feature.";
  }

  try {
    const taskSummary = tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: users.find(u => u.id === task.assigneeId)?.name || 'Unassigned',
      historyLength: task.history.length,
      dueDate: task.dueDate.toLocaleDateString(),
    }));

    const prompt = `
      As an expert project management and productivity analyst, I will provide you with a summary of tasks from a Kanban board.
      Your goal is to identify patterns, potential bottlenecks, and areas for improvement.
      Based on the data, provide a concise, actionable report with 3-5 bullet points of productivity insights and optimization suggestions for the team.
      
      Data:
      ${JSON.stringify(taskSummary, null, 2)}

      Please format your response as a simple text report. For example:
      - **High-Priority Focus:** Several high-priority tasks are still in the 'To Do' list. Consider prioritizing these to avoid delays.
      - **Review Bottleneck:** There seems to be a pile-up in the 'Review' column. It might be beneficial to allocate more resources to code reviews.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "There was an error generating insights. Please check the console for more details.";
  }
};