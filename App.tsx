import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LoginPage } from './components/LoginPage';
import { useTaskFlowData } from './hooks/useTaskFlowData';
import { User, Role, Task } from './types';

export type View = 'Board' | 'Analytics';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('Board');
  const { tasks, users, updateTaskStatus, getTasksForUser, updateTask, addTask, deleteTask } = useTaskFlowData();

  useEffect(() => {
    // Ensure non-Scrum Masters can't see the analytics view
    if (currentUser && currentUser.role !== Role.ScrumMaster && activeView === 'Analytics') {
      setActiveView('Board');
    }
  }, [currentUser, activeView]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Board'); // Reset to default view on logout
  };

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.ScrumMaster) {
      return tasks;
    }
    return getTasksForUser(currentUser.id);
  }, [currentUser, tasks, getTasksForUser]);

  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-neutral-100 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentUser={currentUser}
          users={users}
          onUserChange={handleUserChange}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
          {activeView === 'Board' && (
            <KanbanBoard
              tasks={visibleTasks}
              users={users}
              updateTaskStatus={updateTaskStatus}
              updateTask={updateTask}
              addTask={addTask}
              deleteTask={deleteTask}
              currentUser={currentUser}
            />
          )}
          {activeView === 'Analytics' && currentUser.role === Role.ScrumMaster && (
            <AnalyticsDashboard tasks={tasks} users={users} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
