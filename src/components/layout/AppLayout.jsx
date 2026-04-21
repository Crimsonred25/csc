import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar user={user} />
      <main className="flex-1 overflow-x-hidden min-w-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}