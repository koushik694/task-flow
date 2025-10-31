import React, { useState } from 'react';
import { User } from '../types';
import { LogoIcon } from './icons/Icons';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
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