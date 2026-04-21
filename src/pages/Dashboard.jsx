import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, Layers, ClipboardCheck, Trophy, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import PageHeader from '@/components/shared/PageHeader';

export default function Dashboard() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, l] = await Promise.all([
          base44.entities.ExamAttempt.filter({ user_email: user?.email }, '-created_date', 10),
          base44.entities.ActivityLog.filter({ user_email: user?.email }, '-created_date', 5),
        ]);
        setAttempts(a);
        setLogs(l);
      } catch (e) {}
      setLoading(false);
    };
    if (user?.email) {
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length)
    : 0;

  const radarData = [
    { subject: 'Numerical', score: 65 },
    { subject: 'Verbal', score: 78 },
    { subject: 'Analytical', score: 55 },
    { subject: 'General Info', score: 82 },
    { subject: 'Constitution', score: 70 },
  ];

  const barData = attempts.slice(0, 6).reverse().map((a, i) => ({
    name: `Exam ${i + 1}`,
    score: Math.round(a.percentage || 0),
  }));

  const modules = [
    { label: 'Review Guides', icon: BookOpen, path: '/guides', color: 'from-blue-500 to-blue-700', desc: 'Access PDF study materials' },
    { label: 'Flashcards', icon: Layers, path: '/flashcards', color: 'from-indigo-500 to-indigo-700', desc: 'Active recall practice' },
    { label: 'Take an Exam', icon: ClipboardCheck, path: '/exams', color: 'from-purple-500 to-purple-700', desc: 'Simulated exam environment' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', color: 'from-amber-500 to-amber-700', desc: 'See your ranking' },
  ];

  return (
    <div>
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#0b3d91] via-[#1a56b8] to-[#0f3a7d] h-40 md:h-56">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%2260%22 viewBox=%220 0 100 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v60H0z%22 fill=%22none%22/%3E%3Cg fill=%22white%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2220%22 cy=%2230%22 r=%2215%22/%3E%3Ccircle cx=%2280%22 cy=%2230%22 r=%2215%22/%3E%3Crect x=%2240%22 y=%2220%22 width=%2220%22 height=%2220%22/%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b3d91]/80 via-[#0b3d91]/40 to-transparent flex items-end p-6 md:p-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold font-display text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Reviewee'}! 👋
            </h1>
            <p className="text-white/80 mt-1">Ready to continue your civil service exam preparation?</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Exams Taken" value={attempts.length} icon={ClipboardCheck} color="blue" />
        <StatCard title="Avg. Score" value={`${avgScore}%`} icon={TrendingUp} color="green" />
        <StatCard title="Study Streak" value="3 days" icon={Clock} color="amber" />
        <StatCard title="Best Score" value={attempts.length ? `${Math.max(...attempts.map(a => a.percentage || 0)).toFixed(0)}%` : '—'} icon={Trophy} color="purple" />
      </div>

      {/* Quick Access Modules */}
      <PageHeader title="Study Modules" subtitle="Pick a category to begin your quest" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {modules.map((m, i) => (
          <motion.div
            key={m.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={m.path}>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-primary/30">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <m.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{m.label}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Performance by Subject</h3>
          {loading ? (
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#0b3d91" fill="#0b3d91" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Recent Exam Scores</h3>
          {loading ? (
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          ) : barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="score" fill="#0b3d91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No exam attempts yet. Take an exam to see your progress!
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <Link to="/activity" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No activity yet. Start studying!</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm flex-1">{log.description}</p>
                <span className="text-xs text-muted-foreground">{new Date(log.created_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}