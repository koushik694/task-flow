
import { Role, Status, Priority, User, Task } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u1', role: Role.ScrumMaster },
  { id: 'u2', name: 'Samantha Lee', avatar: 'https://i.pravatar.cc/150?u=u2', role: Role.Employee },
  { id: 'u3', name: 'David Chen', avatar: 'https://i.pravatar.cc/150?u=u3', role: Role.Employee },
];

export const KANBAN_COLUMNS: Status[] = [
  Status.ToDo,
  Status.InProgress,
  Status.Review,
  Status.Done,
];

export const INITIAL_TASKS: Task[] = [
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