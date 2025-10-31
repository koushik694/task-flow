import React, { useState, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '../constants';
import { Task, User, Status } from '../types';
import { TaskDetailsModal } from './TaskDetailsModal';
import { CreateTaskModal } from './CreateTaskModal';
import { PlusIcon } from './icons/Icons';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  updateTaskStatus: (taskId: string, newStatus: Status, userId: string) => void;
  updateTask: (task: Task, userId: string) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'history'>, creatorId: string) => void;
  deleteTask: (taskId: string) => void;
  currentUser: User;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, users, updateTaskStatus, updateTask, addTask, deleteTask, currentUser }) => {
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

    // Date filtering
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

    // User filtering
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
    handleDragEnd(); // Clean up all drag states
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
