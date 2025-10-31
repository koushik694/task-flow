import React from 'react';
import { Task, User, Priority } from '../types';
import { HighPriorityIcon, MediumPriorityIcon, LowPriorityIcon, DetailsIcon } from './icons/Icons';

interface KanbanCardProps {
  task: Task;
  user?: User;
  onDragStart: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const priorityConfig = {
  [Priority.High]: { icon: <HighPriorityIcon className="w-4 h-4 text-red-500" />, color: 'border-l-red-500' },
  [Priority.Medium]: { icon: <MediumPriorityIcon className="w-4 h-4 text-yellow-500" />, color: 'border-l-yellow-500' },
  [Priority.Low]: { icon: <LowPriorityIcon className="w-4 h-4 text-green-500" />, color: 'border-l-green-500' },
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, user, onDragStart, onCardClick, onDragEnd, isDragging }) => {
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