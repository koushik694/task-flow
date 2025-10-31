
import React, { useState, useMemo, useCallback } from 'react';
import { Task, User, Status } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getOptimizationTips } from '../services/geminiService';

interface AnalyticsDashboardProps {
  tasks: Task[];
  users: User[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);


export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, users }) => {
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const tasksByStatus = useMemo(() => {
        const data = Object.values(Status).map(status => ({
            name: status,
            value: tasks.filter(task => task.status === status).length
        }));
        return data;
    }, [tasks]);

    const tasksCompletedByUser = useMemo(() => {
        return users.map(user => ({
            name: user.name.split(' ')[0],
            completed: tasks.filter(task => task.assigneeId === user.id && task.status === Status.Done).length
        }));
    }, [tasks, users]);
    
    const productivityTrend = useMemo(() => {
        const trend: { [key: string]: number } = {};
        tasks.forEach(task => {
            if (task.status === Status.Done) {
                const date = task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!trend[date]) {
                    trend[date] = 0;
                }
                trend[date]++;
            }
        });
        
        return Object.entries(trend).map(([name, count]) => ({ name, tasksCompleted: count })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [tasks]);

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setInsights('');
        const tips = await getOptimizationTips(tasks, users);
        setInsights(tips);
        setIsLoading(false);
    }, [tasks, users]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ChartCard title="Task Distribution by Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={tasksByStatus} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {tasksByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                             <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <div className="lg:col-span-2">
                    <ChartCard title="Tasks Completed per User">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tasksCompletedByUser}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false}/>
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Productivity Trend">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={productivityTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="tasksCompleted" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Powered Insights</h3>
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : insights ? (
                         <div className="text-sm text-gray-600 space-y-2 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-md flex-1">
                            {insights}
                        </div>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <p className="text-gray-500 mb-4">Click the button to get personalized productivity tips from Gemini.</p>
                        </div>
                    )}
                    <button 
                        onClick={handleGenerateInsights}
                        disabled={isLoading}
                        className="mt-4 w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate Insights'}
                    </button>
                </div>
             </div>
        </div>
    );
};
