import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// =================================================================
// TYPES
// =================================================================
enum Role {
  ScrumMaster = 'Scrum Master',
  Employee = 'Employee',
}

enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Review = 'Review',
  Done = 'Done',
}

enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
}

interface TaskEvent {
  timestamp: Date;
  event: string;
  userId: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  dueDate: Date;
  history: TaskEvent[];
}

// =================================================================
// ICONS
// =================================================================
const BoardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
  </svg>
);

const AnalyticsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.085-1.085-1.085m1.085 1.085V18m-1.085-1.085a2.25 2.25 0 00-1.085-1.085l-1-1.085m-1.085 1.085a2.25 2.25 0 001.085 1.085l1 1.085m-1.085-1.085a2.25 2.25 0 001.085-1.085m2.25 2.25a2.25 2.25 0 00-2.25-2.25m-2.25 2.25a2.25 2.25 0 002.25-2.25m-2.25-11.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25m13.5 0v11.25c0 .621-.504 1.125-1.125 1.125H9.75" />
  </svg>
);

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A3.75 3.75 0 0113.5 10.5h-3a.75.75 0 000 1.5h3a3.75 3.75 0 01-1.608 3.162.75.75 0 001.07 1.052A5.25 5.25 0 0015 12h-1.5a.75.75 0 000 1.5h1.5a5.25 5.25 0 00-2.037 4.162.75.75 0 001.07 1.052A6.75 6.75 0 002.58-15.025z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M11.037 2.286a.75.75 0 011.071 1.052A3.75 3.75 0 0010.5 10.5h3a.75.75 0 010 1.5h-3a3.75 3.75 0 001.608 3.162.75.75 0 01-1.07 1.052A5.25 5.25 0 019 12h1.5a.75.75 0 010 1.5H9a5.25 5.25 0 012.037 4.162.75.75 0 01-1.07 1.052A6.75 6.75 0 016.42 3.338a.75.75 0 011.07-1.052 5.25 5.25 0 013.547 0z" clipRule="evenodd" />
    </svg>
);

const HighPriorityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

const MediumPriorityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

const LowPriorityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DetailsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// =================================================================
// CONSTANTS
// =================================================================
const USERS: User[] = [
  { id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u1', role: Role.ScrumMaster },
  { id: 'u2', name: 'Samantha Lee', avatar: 'https://i.pravatar.cc/150?u=u2', role: Role.Employee },
  { id: 'u3', name: 'David Chen', avatar: 'https://i.pravatar.cc/150?u=u3', role: Role.Employee },
];

const KANBAN_COLUMNS: Status[] = [
  Status.ToDo,
  Status.InProgress,
  Status.Review,
  Status.Done,
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'TIS-1',
    title: 'Design the new dashboard UI',
    description: 'Create mockups and a style guide for the analytics dashboard.',
    status: Status.ToDo,
    priority: Priority.High,
    assigneeId: 'u2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    history: [{ timestamp: new Date(), event: 'created this task', userId: 'u2' }],
  },
  {
    id: 'TIS-2',
    title: 'Develop authentication service',
    description: 'Implement user login and registration functionality.',
    status: Status.InProgress,
    priority: Priority.High,
    assigneeId: 'u3',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    history: [{ timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), event: 'moved this task to In Progress', userId: 'u1' }],
  },
  {
    id: 'TIS-3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment.',
    status: Status.Review,
    priority: Priority.Medium,
    assigneeId: 'u1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    history: [{ timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), event: 'moved this task to Review', userId: 'u1' }],
  },
  {
    id: 'TIS-4',
    title: 'Write API documentation',
    description: 'Document all endpoints for the task management API.',
    status: Status.Done,
    priority: Priority.Low,
    assigneeId: 'u2',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    history: [{ timestamp: new Date(new Date().setDate(new Date().getDate() - 3)), event: 'moved this task to Done', userId: 'u1' }],
  },
  {
    id: 'TIS-5',
    title: 'Refactor Kanban drag-and-drop logic',
    description: 'Improve performance and user experience of the drag-and-drop feature.',
    status: Status.ToDo,
    priority: Priority.Medium,
    assigneeId: 'u3',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    history: [{ timestamp: new Date(), event: 'created this task', userId: 'u3' }],
  },
  {
    id: 'TIS-6',
    title: 'Fix mobile responsiveness issues',
    description: 'Ensure the application is fully usable on smaller screens.',
    status: Status.InProgress,
    priority: Priority.High,
    assigneeId: 'u2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    history: [{ timestamp: new Date(), event: 'moved this task to In Progress', userId: 'u1' }],
  },
    {
    id: 'TIS-7',
    title: 'Integrate Gemini API for insights',
    description: 'Connect the analytics dashboard to Gemini to generate productivity tips.',
    status: Status.ToDo,
    priority: Priority.High,
    assigneeId: null,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    history: [{ timestamp: new Date(), event: 'created this task', userId: 'u1' }],
  },
];


// =================================================================
// SERVICES
// =================================================================
const getOptimizationTips = async (tasks: Task[], users: User[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Could not generate insights: API_KEY is not configured.\nPlease set the `API_KEY` environment variable to use this feature.";
  }
  const ai = new GoogleGenAI({ apiKey });

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


// =================================================================
// HOOKS
// =================================================================
type NewTaskPayload = Omit<Task, 'id' | 'status' | 'history'>;

const useTaskFlowData = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users] = useState<User[]>(USERS);

  const updateTaskStatus = useCallback((taskId: string, newStatus: Status, userId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newHistory = [
            ...task.history,
            {
              timestamp: new Date(),
              event: `moved this task from ${task.status} to ${newStatus}`,
              userId,
            },
          ];
          return { ...task, status: newStatus, history: newHistory };
        }
        return task;
      })
    );
  }, []);

  const updateTask = useCallback((updatedTask: Task, userId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === updatedTask.id) {
          const originalTask = prevTasks.find(t => t.id === updatedTask.id)!;
          const newHistoryEvents: TaskEvent[] = [];

          if (originalTask.title !== updatedTask.title) {
            newHistoryEvents.push({ timestamp: new Date(), event: `changed the title to "${updatedTask.title}"`, userId });
          }
          if (originalTask.description !== updatedTask.description) {
            newHistoryEvents.push({ timestamp: new Date(), event: `updated the description`, userId });
          }
          if (originalTask.priority !== updatedTask.priority) {
            newHistoryEvents.push({ timestamp: new Date(), event: `set the priority to ${updatedTask.priority}`, userId });
          }
          if (new Date(originalTask.dueDate).toDateString() !== new Date(updatedTask.dueDate).toDateString()) {
             newHistoryEvents.push({ timestamp: new Date(), event: `changed the due date to ${new Date(updatedTask.dueDate).toLocaleDateString()}`, userId });
          }
          
          if (newHistoryEvents.length > 0) {
            return { ...updatedTask, history: [...originalTask.history, ...newHistoryEvents] };
          }
          return updatedTask;
        }
        return task;
      })
    );
  }, []);

  const getTasksForUser = useCallback((userId: string) => {
    return tasks.filter(task => task.assigneeId === userId);
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'history'>, creatorId: string) => {
    const newTask: Task = {
        ...taskData,
        id: `TIS-${Date.now()}`,
        status: Status.ToDo,
        history: [
            {
                timestamp: new Date(),
                event: 'created this task',
                userId: creatorId
            }
        ]
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  return { tasks, users, updateTaskStatus, getTasksForUser, updateTask, addTask, deleteTask };
};


// =================================================================
// COMPONENTS
// =================================================================

// --- CreateTaskModal.tsx ---
interface CreateTaskModalProps {
  users: User[];
  onClose: () => void;
  onCreateTask: (taskData: { title: string; description: string; priority: Priority; assigneeId: string | null; dueDate: Date; }) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ users, onClose, onCreateTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      setError('Title and Due Date are required.');
      return;
    }

    const date = new Date(dueDate);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

    onCreateTask({
      title,
      description,
      assigneeId,
      priority,
      dueDate: adjustedDate,
    });
  };
  
  const inputStyles = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyles}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputStyles}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                    id="assigneeId"
                    value={assigneeId ?? ''}
                    onChange={(e) => setAssigneeId(e.target.value || null)}
                    className={inputStyles}
                >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={inputStyles}
                >
                    {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputStyles}
                    required
                />
            </div>
          </div>
            
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- TaskDetailsModal.tsx ---
interface TaskDetailsModalProps {
  task: Task;
  user?: User;
  users: User[];
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, user, users, onClose, onUpdateTask, onDeleteTask, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTask, setEditableTask] = useState<Task>(task);
  
  const priorityConfig = {
    [Priority.High]: { icon: <HighPriorityIcon className="w-5 h-5 text-red-500" />, label: 'High' },
    [Priority.Medium]: { icon: <MediumPriorityIcon className="w-5 h-5 text-yellow-500" />, label: 'Medium' },
    [Priority.Low]: { icon: <LowPriorityIcon className="w-5 h-5 text-green-500" />, label: 'Low' },
  };

  const inputStyles = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-neutral-50";
  const textStyles = "text-gray-800";

  useEffect(() => {
    setEditableTask(task);
    setIsEditing(false);
  }, [task]);

  if (!task) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTask(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    setEditableTask(prev => ({ ...prev, dueDate: adjustedDate }));
  };

  const handleSave = () => {
    onUpdateTask(editableTask);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditableTask(task);
    setIsEditing(false);
  }
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        onDeleteTask(task.id);
        onClose();
    }
  }

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  const { icon, label } = priorityConfig[task.priority];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 m-4 relative transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex items-start mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">{task.id}</p>
            {isEditing ? (
              <input 
                type="text"
                name="title"
                value={editableTask.title}
                onChange={handleInputChange}
                className={`${inputStyles} text-2xl font-bold`}
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ml-4 ${
              task.status === 'Done' ? 'bg-secondary' : 
              task.status === 'In Progress' ? 'bg-blue-500' :
              task.status === 'Review' ? 'bg-yellow-500' :
              'bg-gray-400'
          }`}>{task.status}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm border-y py-4">
          <div className="flex flex-col space-y-1">
            <strong className="text-gray-500 font-medium">Assignee</strong>
            {user ? (
              <div className="flex items-center space-x-2">
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                <span className={textStyles}>{user.name}</span>
              </div>
            ) : (
              <span className="text-gray-500 italic">Unassigned</span>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <strong className="text-gray-500 font-medium">Priority</strong>
            {isEditing ? (
              <select name="priority" value={editableTask.priority} onChange={handleInputChange} className={inputStyles}>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : (
              <div className="flex items-center space-x-2">
                {icon}
                <span className={textStyles}>{label}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <strong className="text-gray-500 font-medium">Due Date</strong>
             {isEditing ? (
              <input 
                type="date"
                name="dueDate"
                value={formatDateForInput(editableTask.dueDate)}
                onChange={handleDateChange}
                className={inputStyles}
              />
            ) : (
              <span className={textStyles}>{task.dueDate.toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          {isEditing ? (
            <textarea
              name="description"
              value={editableTask.description}
              onChange={handleInputChange}
              rows={4}
              className={inputStyles}
            />
          ) : (
            <p className="text-gray-600 bg-neutral-50 p-3 rounded-md border min-h-[100px]">{task.description}</p>
          )}
        </div>

        <div className="mb-6 flex-1">
          <h3 className="font-semibold text-gray-700 mb-2">Task History</h3>
          <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {task.history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((event, index) => {
                const eventUser = users.find(u => u.id === event.userId);
                return (
                 <li key={index} className="p-3 text-sm hover:bg-neutral-50">
                    <div className="flex items-start space-x-3">
                      {eventUser ? (
                        <img src={eventUser.avatar} alt={eventUser.name} className="w-6 h-6 rounded-full mt-1" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 mt-1 flex items-center justify-center text-xs text-white" title="System Action">?</div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-800 break-words">
                          <span className="font-semibold">{eventUser?.name || 'System'}</span> {event.event}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
            <div>
                {currentUser.role === Role.ScrumMaster && !isEditing && (
                    <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 hover:text-red-700 transition-colors"
                        aria-label="Delete task"
                    >
                        <TrashIcon className="w-5 h-5"/>
                        Delete Task
                    </button>
                )}
            </div>
            <div className="flex space-x-3">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
                        Edit Task
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};


// --- KanbanCard.tsx ---
interface KanbanCardProps {
  task: Task;
  user?: User;
  onDragStart: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, user, onDragStart, onCardClick, onDragEnd, isDragging }) => {
  const priorityConfig = {
    [Priority.High]: { icon: <HighPriorityIcon className="w-4 h-4 text-red-500" />, color: 'border-l-red-500' },
    [Priority.Medium]: { icon: <MediumPriorityIcon className="w-4 h-4 text-yellow-500" />, color: 'border-l-yellow-500' },
    [Priority.Low]: { icon: <LowPriorityIcon className="w-4 h-4 text-green-500" />, color: 'border-l-green-500' },
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task.id);
  };

  const { icon, color } = priorityConfig[task.priority];
  
  const draggingStyles = 'opacity-50 rotate-3 shadow-2xl scale-105 ring-2 ring-primary ring-offset-2';
  const normalStyles = 'hover:shadow-lg hover:-translate-y-px';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-md shadow-sm p-4 cursor-grab active:cursor-grabbing border-l-4 ${color} transition-all duration-300 ease-in-out flex flex-col ${
        isDragging ? draggingStyles : normalStyles
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-gray-800 pr-2 flex-1">{task.title}</p>
        <button
          onClick={() => onCardClick(task)}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
          aria-label={`View details for ${task.title}`}
        >
          <DetailsIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
        <div className="flex items-center space-x-2">
            {icon}
            <span>{task.id}</span>
        </div>
        {user && (
          <img
            src={user.avatar}
            alt={user.name}
            title={user.name}
            className="w-6 h-6 rounded-full"
          />
        )}
      </div>
    </div>
  );
};


// --- KanbanColumn.tsx ---
interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  users: User[];
  onDrop: (status: Status) => void;
  onDragStart: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  currentUser: User;
  draggedTaskId: string | null;
  isDragOver: boolean;
  onDragEnter: (status: Status) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  status, 
  tasks, 
  users, 
  onDrop, 
  onDragStart, 
  onCardClick, 
  draggedTaskId, 
  isDragOver, 
  onDragEnter, 
  onDragLeave, 
  onDragEnd 
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(status);
  };

  return (
    <div
      className={`rounded-lg p-4 flex flex-col h-full transition-all duration-300 border-2 ${
        isDragOver ? 'bg-primary/10 border-primary border-dashed' : 'bg-gray-100 border-transparent'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={() => onDragEnter(status)}
      onDragLeave={onDragLeave}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 uppercase tracking-wider">{status}</h3>
        <span className="bg-gray-300 text-gray-600 text-sm font-bold px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-4 overflow-y-auto flex-1">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            user={users.find(u => u.id === task.assigneeId)}
            onDragStart={onDragStart}
            onCardClick={onCardClick}
            isDragging={draggedTaskId === task.id}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};


// --- KanbanBoard.tsx ---
interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  updateTaskStatus: (taskId: string, newStatus: Status, userId: string) => void;
  updateTask: (task: Task, userId: string) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'history'>, creatorId: string) => void;
  deleteTask: (taskId: string) => void;
  currentUser: User;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, users, updateTaskStatus, updateTask, addTask, deleteTask, currentUser }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const areFiltersActive = !!startDate || !!endDate || !!selectedUserId;

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      
      result = result.filter(task => {
        const taskDueDate = new Date(task.dueDate);
        const isAfterStartDate = start ? taskDueDate >= start : true;
        const isBeforeEndDate = end ? taskDueDate <= end : true;
        return isAfterStartDate && isBeforeEndDate;
      });
    }

    if (selectedUserId) {
        result = result.filter(task => task.assigneeId === selectedUserId);
    }

    return result;
  }, [tasks, startDate, endDate, selectedUserId]);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnter = (status: Status) => {
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDrop = (newStatus: Status) => {
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, newStatus, currentUser.id);
    }
    handleDragEnd(); 
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };
  
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'status' | 'history'>) => {
    addTask(taskData, currentUser.id);
    setIsCreateModalOpen(false);
  }

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUserId('');
  };

  return (
    <>
      <div className="flex items-center flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-700">Filters:</h4>
          <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-sm font-medium text-gray-600">Start Date</label>
              <input 
                  type="date" 
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`p-2 border rounded-md bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${startDate ? 'border-primary' : 'border-gray-300'}`}
              />
          </div>
          <div className="flex items-center gap-2">
              <label htmlFor="end-date" className="text-sm font-medium text-gray-600">End Date</label>
              <input 
                  type="date" 
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`p-2 border rounded-md bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${endDate ? 'border-primary' : 'border-gray-300'}`}
              />
          </div>
           <div className="flex items-center gap-2">
              <label htmlFor="user-filter" className="text-sm font-medium text-gray-600">Assignee</label>
              <select
                  id="user-filter"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={`p-2 border rounded-md bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${selectedUserId ? 'border-primary' : 'border-gray-300'}`}
              >
                  <option value="">All Users</option>
                  {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
              </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {areFiltersActive && (
              <button 
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-primary rounded-md bg-white text-sm font-medium text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors"
              >
                  Clear Filters
              </button>
            )}
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md bg-primary text-sm font-medium text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
                Create Task
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={filteredTasks.filter((task) => task.status === status)}
            users={users}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onCardClick={handleCardClick}
            currentUser={currentUser}
            draggedTaskId={draggedTaskId}
            isDragOver={dragOverStatus === status}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          user={users.find(u => u.id === selectedTask.assigneeId)}
          users={users}
          onClose={handleCloseModal}
          onUpdateTask={(updatedTask) => updateTask(updatedTask, currentUser.id)}
          onDeleteTask={deleteTask}
          currentUser={currentUser}
        />
      )}
      
      {isCreateModalOpen && (
        <CreateTaskModal
            users={users}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateTask={handleCreateTask}
        />
      )}
    </>
  );
};


// --- AnalyticsDashboard.tsx ---
interface AnalyticsDashboardProps {
  tasks: Task[];
  users: User[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, users }) => {
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

    const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    );

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


// --- Sidebar.tsx ---
type View = 'Board' | 'Analytics';
interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: View;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
      isActive
        ? 'bg-primary/90 text-white'
        : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser }) => {
  return (
    <aside className="w-64 bg-neutral-800 text-white flex flex-col p-4">
      <div className="flex items-center mb-10 p-2">
        <LogoIcon className="w-10 h-10 text-primary" />
        <h1 className="text-2xl font-bold ml-2">TaskFlow</h1>
      </div>
      <nav>
        <ul>
          <NavItem
            icon={<BoardIcon className="w-6 h-6" />}
            label="Board"
            isActive={activeView === 'Board'}
            onClick={() => setActiveView('Board')}
          />
          {currentUser.role === Role.ScrumMaster && (
            <NavItem
              icon={<AnalyticsIcon className="w-6 h-6" />}
              label="Analytics"
              isActive={activeView === 'Analytics'}
              onClick={() => setActiveView('Analytics')}
            />
          )}
        </ul>
      </nav>
      <div className="mt-auto p-3 bg-neutral-700 rounded-lg">
        <h3 className="font-bold text-white">Productivity Insights</h3>
        <p className="text-sm text-gray-300 mt-1">Visit the Analytics tab to get AI-powered tips to optimize your workflow.</p>
      </div>
    </aside>
  );
};


// --- Header.tsx ---
interface HeaderProps {
  currentUser: User;
  users: User[];
  onUserChange: (userId: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, users, onUserChange, onLogout }) => {
  return (
    <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center flex-shrink-0">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Teams in Space</h2>
        <p className="text-sm text-gray-500">Software project</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Viewing as:</span>
            <select
                value={currentUser.id}
                onChange={(e) => onUserChange(e.target.value)}
                className="p-2 border rounded-md bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
            >
                {users.map((user) => (
                <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                </option>
                ))}
            </select>
        </div>
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full border-2 border-primary"
        />
         <button
            onClick={onLogout}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
        >
            Logout
        </button>
      </div>
    </header>
  );
};

// --- LoginPage.tsx ---
interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  if (!users.length) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
            <p>Loading users...</p>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 font-sans">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <LogoIcon className="w-16 h-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold text-gray-800">TaskFlow</h1>
          <p className="mt-1 text-gray-500">Behavior-Driven Task Management</p>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
              Select a user to login as:
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// APP COMPONENT
// =================================================================
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('Board');
  const { tasks, users, updateTaskStatus, getTasksForUser, updateTask, addTask, deleteTask } = useTaskFlowData();

  useEffect(() => {
    if (currentUser && currentUser.role !== Role.ScrumMaster && activeView === 'Analytics') {
      setActiveView('Board');
    }
  }, [currentUser, activeView]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Board');
  };

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.ScrumMaster) {
      return tasks;
    }
    return getTasksForUser(currentUser.id);
  }, [currentUser, tasks, getTasksForUser]);

  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-neutral-100 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentUser={currentUser}
          users={users}
          onUserChange={handleUserChange}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
          {activeView === 'Board' && (
            <KanbanBoard
              tasks={visibleTasks}
              users={users}
              updateTaskStatus={updateTaskStatus}
              updateTask={updateTask}
              addTask={addTask}
              deleteTask={deleteTask}
              currentUser={currentUser}
            />
          )}
          {activeView === 'Analytics' && currentUser.role === Role.ScrumMaster && (
            <AnalyticsDashboard tasks={tasks} users={users} />
          )}
        </main>
      </div>
    </div>
  );
};

// =================================================================
// RENDER APP
// =================================================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
