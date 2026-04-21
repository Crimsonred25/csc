import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, ClipboardCheck, BookOpen, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import PageHeader from '@/components/shared/PageHeader';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list('-created_date', 100),
      base44.entities.ExamAttempt.list('-created_date', 100),
      base44.entities.ActivityLog.list('-created_date', 20),
    ]).then(([u, a, l]) => { setUsers(u); setAttempts(a); setLogs(l); }).finally(() => setLoading(false));
  }, []);

  const pendingCount = users.filter(u => u.account_status === 'pending').length;
  const approvedCount = users.filter(u => u.account_status === 'approved').length;
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length)
    : 0;

  // Chart data - exams per day last 7 days
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = attempts.filter(a => {
      const ad = new Date(a.created_date);
      return ad.toDateString() === d.toDateString();
    }).length;
    return { day: label, exams: count };
  });

  // Score distribution
  const scoreRanges = [
    { range: '0-25%', count: attempts.filter(a => a.percentage < 25).length },
    { range: '25-50%', count: attempts.filter(a => a.percentage >= 25 && a.percentage < 50).length },
    { range: '50-75%', count: attempts.filter(a => a.percentage >= 50 && a.percentage < 75).length },
    { range: '75-100%', count: attempts.filter(a => a.percentage >= 75).length },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview and analytics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={users.length} icon={Users} color="blue" />
        <StatCard title="Active Users" value={approvedCount} icon={UserCheck} color="green" />
        <StatCard title="Pending Approvals" value={pendingCount} icon={Clock} color="amber" />
        <StatCard title="Avg. Score" value={`${avgScore}%`} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Exam Attempts (Last 7 Days)</h3>
          {loading ? <div className="h-48 bg-muted animate-pulse rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="exams" stroke="#0b3d91" strokeWidth={2} dot={{ fill: '#0b3d91' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Score Distribution</h3>
          {loading ? <div className="h-48 bg-muted animate-pulse rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0b3d91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm flex-1">{log.description}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0">{log.user_name || log.user_email}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(log.created_date).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}