import React, { useState } from 'react';
import { User, Priority } from '../types';
import { CloseIcon } from './icons/Icons';

interface CreateTaskModalProps {
  users: User[];
  onClose: () => void;
  onCreateTask: (taskData: { title: string; description: string; priority: Priority; assigneeId: string | null; dueDate: Date; }) => void;
}

const inputStyles = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white";

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ users, onClose, onCreateTask }) => {
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
