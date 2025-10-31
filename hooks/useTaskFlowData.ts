import { useState, useCallback } from 'react';
import { Task, User, Status, TaskEvent, Priority } from '../types';
import { INITIAL_TASKS, USERS } from '../constants';

export type NewTaskPayload = Omit<Task, 'id' | 'status' | 'history'>;

export const useTaskFlowData = () => {
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
