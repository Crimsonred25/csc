import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Leaderboard() {
  const { user } = useAuth();
  const [rankedExams, setRankedExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Exam.filter({ is_ranked: true, is_published: true }),
      base44.entities.ExamAttempt.list('-percentage', 200),
    ]).then(([e, a]) => {
      setRankedExams(e);
      setAttempts(a);
      if (e.length > 0) setSelectedExam(e[0].id);
    }).finally(() => setLoading(false));
  }, []);

  // Get best attempt per user for selected exam
  const examAttempts = attempts.filter(a => a.exam_id === selectedExam);
  const bestPerUser = Object.values(
    examAttempts.reduce((acc, a) => {
      if (!acc[a.user_email] || a.percentage > acc[a.user_email].percentage) {
        acc[a.user_email] = a;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.percentage - a.percentage);

  const myRank = bestPerUser.findIndex(a => a.user_email === user?.email) + 1;

  const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
  const rankBg = ['bg-yellow-50 border-yellow-200', 'bg-slate-50 border-slate-200', 'bg-amber-50 border-amber-200'];

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="See how you rank against other reviewees" />

      {rankedExams.length > 0 && (
        <div className="mb-6 max-w-xs">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {rankedExams.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {myRank > 0 && (
        <Card className="p-4 mb-6 bg-primary text-primary-foreground flex items-center gap-4">
          <Trophy className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">Your Rank: #{myRank}</p>
            <p className="text-primary-foreground/80 text-sm">
              Score: {bestPerUser.find(a => a.user_email === user?.email)?.percentage}%
            </p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : rankedExams.length === 0 ? (
        <EmptyState icon={Trophy} title="No ranked exams" description="The admin hasn't designated any ranked exams yet." />
      ) : bestPerUser.length === 0 ? (
        <EmptyState icon={Trophy} title="No attempts yet" description="Be the first to take this exam and claim the top spot!" />
      ) : (
        <div className="space-y-3">
          {bestPerUser.map((attempt, i) => {
            const isMe = attempt.user_email === user?.email;
            const rank = i + 1;
            return (
              <motion.div
                key={attempt.user_email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`p-4 flex items-center gap-4 transition-all ${isMe ? 'border-2 border-primary shadow-lg' : ''} ${rank <= 3 ? rankBg[rank - 1] + ' border' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${rank <= 3 ? rankColors[rank - 1] : 'text-muted-foreground'}`}>
                    {rank <= 3 ? <Medal className="w-6 h-6" /> : `#${rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isMe ? 'text-primary' : ''}`}>
                      {attempt.user_name || attempt.user_email}
                      {isMe && <Badge className="ml-2 text-xs bg-primary/10 text-primary border-0">You</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(attempt.completed_at || attempt.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{attempt.percentage}%</p>
                    <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.total_points} pts</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}