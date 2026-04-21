import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Clock, BookOpen, Layers, ClipboardCheck, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const actionIcons = {
  exam_taken: ClipboardCheck,
  flashcard_reviewed: Layers,
  pdf_viewed: BookOpen,
  login: LogIn,
};

const actionColors = {
  exam_taken: 'bg-purple-100 text-purple-600',
  flashcard_reviewed: 'bg-blue-100 text-blue-600',
  pdf_viewed: 'bg-emerald-100 text-emerald-600',
  login: 'bg-gray-100 text-gray-600',
};

export default function Activity() {
  const { user } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['my-activity', user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Activity" subtitle="A detailed log of your learning journey" />

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-4 animate-pulse"><div className="h-12 bg-muted rounded" /></Card>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Clock} title="No activity yet" description="Your activity will be tracked as you use the platform." />
      ) : (
        <Card className="divide-y overflow-hidden">
          {logs.map((log, i) => {
            const Icon = actionIcons[log.action] || Clock;
            const color = actionColors[log.action] || 'bg-gray-100 text-gray-600';
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(log.created_date)}</p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize hidden sm:inline-flex">
                  {log.action?.replace(/_/g, ' ')}
                </Badge>
              </motion.div>
            );
          })}
        </Card>
      )}
    </div>
  );
}