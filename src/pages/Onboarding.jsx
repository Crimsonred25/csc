import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const { user, checkAppState } = useAuth();
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Regex check: exactly 2 letters followed by exactly 5 numbers
    const isInternalEmployee = /^[A-Za-z]{2}\d{5}$/.test(idNumber.trim());

    await base44.auth.updateMe({
      id_number: idNumber.trim(),
      account_status: isInternalEmployee ? 'approved' : 'pending',
      role: 'reviewee',
    });

    // Log the signup
    await base44.entities.ActivityLog.create({
      user_email: user?.email,
      user_name: user?.full_name,
      action: 'user_signup',
      description: `New user signed up: ${user?.full_name || user?.email}${isInternalEmployee ? ' (auto-approved internal employee)' : ' (pending approval)'}`,
    });

    // Refresh the auth state to pick up the new status
    await checkAppState();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Left brand panel - hidden on this page but we match the login style */}
        <Card className="p-8 shadow-2xl border-0">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display">Welcome to CSC Review Hub</h1>
            <p className="text-muted-foreground mt-1">Complete your profile to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/50 border">
              <p className="text-sm font-medium mb-1">Hello, {user?.full_name || 'User'}!</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number" className="text-sm font-semibold">ID Number</Label>
              <Input
                id="id_number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID Number"
                required
                className="h-12 text-base"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading || !idNumber.trim()}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}