import React, { useState, useEffect } from 'react';
import { Task, User, Priority, Role } from '../types';
import { HighPriorityIcon, MediumPriorityIcon, LowPriorityIcon, CloseIcon, TrashIcon } from './icons/Icons';

interface TaskDetailsModalProps {
  task: Task;
  user?: User;
  users: User[];
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User;
}

const priorityConfig = {
  [Priority.High]: { icon: <HighPriorityIcon className="w-5 h-5 text-red-500" />, label: 'High' },
  [Priority.Medium]: { icon: <MediumPriorityIcon className="w-5 h-5 text-yellow-500" />, label: 'Medium' },
  [Priority.Low]: { icon: <LowPriorityIcon className="w-5 h-5 text-green-500" />, label: 'Low' },
};

const inputStyles = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-neutral-50";
const textStyles = "text-gray-800";

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, user, users, onClose, onUpdateTask, onDeleteTask, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTask, setEditableTask] = useState<Task>(task);

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
