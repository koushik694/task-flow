import React from 'react';
import type { View } from '../App';
import { BoardIcon, AnalyticsIcon, LogoIcon } from './icons/Icons';
import { User, Role } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: View;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
      isActive
        ? 'bg-primary/90 text-white'
        : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser }) => {
  return (
    <aside className="w-64 bg-neutral-800 text-white flex flex-col p-4">
      <div className="flex items-center mb-10 p-2">
        <LogoIcon className="w-10 h-10 text-primary" />
        <h1 className="text-2xl font-bold ml-2">TaskFlow</h1>
      </div>
      <nav>
        <ul>
          <NavItem
            icon={<BoardIcon className="w-6 h-6" />}
            label="Board"
            isActive={activeView === 'Board'}
            onClick={() => setActiveView('Board')}
          />
          {currentUser.role === Role.ScrumMaster && (
            <NavItem
              icon={<AnalyticsIcon className="w-6 h-6" />}
              label="Analytics"
              isActive={activeView === 'Analytics'}
              onClick={() => setActiveView('Analytics')}
            />
          )}
        </ul>
      </nav>
      <div className="mt-auto p-3 bg-neutral-700 rounded-lg">
        <h3 className="font-bold text-white">Productivity Insights</h3>
        <p className="text-sm text-gray-300 mt-1">Visit the Analytics tab to get AI-powered tips to optimize your workflow.</p>
      </div>
    </aside>
  );
};
