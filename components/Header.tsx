import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onUserChange: (userId: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, users, onUserChange, onLogout }) => {
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