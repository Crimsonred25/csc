import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PendingAccountGuard({ children }) {
  const { user, logout } = useAuth();

  // Admins always pass through
  if (user?.role === 'admin') return children;

  if (user?.account_status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Account Rejected</h2>
          <p className="text-muted-foreground mb-4">Your account access has been denied. Please contact the administrator.</p>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (user?.account_status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-4">
            Your account is awaiting administrator review. You'll be notified once access is granted.
          </p>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return children;
}
