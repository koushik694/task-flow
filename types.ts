
export enum Role {
  ScrumMaster = 'Scrum Master',
  Employee = 'Employee',
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Review = 'Review',
  Done = 'Done',
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
}

export interface TaskEvent {
  timestamp: Date;
  event: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  dueDate: Date;
  history: TaskEvent[];
}