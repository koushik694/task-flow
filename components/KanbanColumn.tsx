import React from 'react';
import { KanbanCard } from './KanbanCard';
import { Task, User, Status } from '../types';

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

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
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