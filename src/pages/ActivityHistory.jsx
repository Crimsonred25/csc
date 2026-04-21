import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Layers, ClipboardCheck, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const ACTION_CONFIG = {
  exam_taken: { icon: ClipboardCheck, color: 'bg-purple-100 text-purple-600', label: 'Exam Taken' },
  flashcard_reviewed: { icon: Layers, color: 'bg-indigo-100 text-indigo-600', label: 'Flashcards' },
  pdf_viewed: { icon: BookOpen, color: 'bg-blue-100 text-blue-600', label: 'PDF Viewed' },
  login: { icon: LogIn, color: 'bg-emerald-100 text-emerald-600', label: 'Login' },
};

export default function ActivityHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ActivityLog.filter({ user_email: user?.email }, '-created_date', 100)
      .then(setLogs).finally(() => setLoading(false));
  }, [user]);

  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.created_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Activity History" subtitle="A timestamped log of all your learning activity" />

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Clock} title="No activity yet" description="Start studying and your activity will appear here!" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayLogs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{date}</p>
              <div className="space-y-2">
                {dayLogs.map((log, i) => {
                  const config = ACTION_CONFIG[log.action] || { icon: Clock, color: 'bg-gray-100 text-gray-600', label: log.action };
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{log.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs ${config.color} border-0`}>{config.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}