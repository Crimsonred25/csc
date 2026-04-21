import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ClipboardCheck, Clock, Trophy, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

function ExamTaker({ exam, questions, user, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState((exam.time_limit_minutes || 60) * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());

  React.useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    let score = 0;
    const answerLog = questions.map(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) score += (q.points || 1);
      return { question_id: q.id, selected_answer: selected, is_correct: isCorrect };
    });
    const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const attempt = await base44.entities.ExamAttempt.create({
      exam_id: exam.id,
      exam_title: exam.title,
      user_email: user?.email,
      user_name: user?.full_name,
      score,
      total_points: totalPoints,
      percentage,
      answers: answerLog,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString(),
    });

    await base44.entities.ActivityLog.create({
      user_email: user?.email,
      user_name: user?.full_name,
      action: 'exam_taken',
      description: `Completed exam: ${exam.title} — Score: ${percentage}%`,
      resource_type: 'Exam',
      resource_id: exam.id,
    });

    setResult({ score, totalPoints, percentage, answerLog });
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 ${result.percentage >= 75 ? 'bg-emerald-100' : result.percentage >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
            {result.percentage >= 75 ? (
              <CheckCircle className={`w-12 h-12 text-emerald-600`} />
            ) : (
              <AlertCircle className={`w-12 h-12 ${result.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`} />
            )}
          </div>
          <h2 className="text-3xl font-bold font-display mb-1">{result.percentage}%</h2>
          <p className="text-muted-foreground mb-2">
            {result.score} out of {result.totalPoints} points
          </p>
          <Badge className={result.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : result.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
            {result.percentage >= 75 ? '🎉 Excellent!' : result.percentage >= 50 ? '👍 Good Job' : '📚 Keep Studying'}
          </Badge>

          <div className="mt-6 space-y-2 text-left">
            <h3 className="font-semibold mb-3">Answer Review</h3>
            {questions.map((q, i) => {
              const log = result.answerLog.find(a => a.question_id === q.id);
              return (
                <div key={q.id} className={`p-3 rounded-lg border text-sm ${log?.is_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-medium mb-1">Q{i + 1}: {q.question_text}</p>
                  <p className="text-xs">Your answer: <span className="font-semibold">{log?.selected_answer || 'Not answered'}</span></p>
                  {!log?.is_correct && <p className="text-xs text-emerald-700">Correct: <span className="font-semibold">{q.correct_answer}</span></p>}
                  {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
                </div>
              );
            })}
          </div>

          <Button className="mt-6 w-full" onClick={onFinish}>Back to Exams</Button>
        </Card>
      </motion.div>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{exam.title}</h2>
        <div className={`flex items-center gap-2 font-mono font-bold px-3 py-1.5 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-muted'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card className="p-8 mb-6">
            <p className="font-semibold text-lg mb-6">{currentQ + 1}. {q?.question_text}</p>
            <div className="space-y-3">
              {q?.choices?.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: choice.label }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm
                    ${answers[q.id] === choice.label
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                >
                  <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold mr-3 ${answers[q.id] === choice.label ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {choice.label}
                  </span>
                  {choice.text}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(i => i - 1)}>Previous</Button>
        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(i => i + 1)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Submit Exam</Button>
        )}
      </div>
    </div>
  );
}

export default function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [examQs, setExamQs] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Exam.filter({ is_published: true }),
      base44.entities.ExamQuestion.list('order'),
    ]).then(([e, q]) => { setExams(e); setQuestions(q); }).finally(() => setLoading(false));
  }, []);

  const startExam = (exam) => {
    const qs = questions.filter(q => q.exam_id === exam.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    setExamQs(qs);
    setActiveExam(exam);
  };

  if (activeExam) {
    return <ExamTaker exam={activeExam} questions={examQs} user={user} onFinish={() => setActiveExam(null)} />;
  }

  return (
    <div>
      <PageHeader title="Simulated Exams" subtitle="Test your readiness with timed practice exams" />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No exams available" description="No exams have been published yet. Check back later." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {exams.map((exam, i) => {
            const qCount = questions.filter(q => q.exam_id === exam.id).length;
            return (
              <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex gap-2">
                      {exam.is_ranked && <Badge className="bg-amber-100 text-amber-700 border-0"><Trophy className="w-3 h-3 mr-1" />Ranked</Badge>}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
                  {exam.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{exam.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exam.time_limit_minutes} min</span>
                    <span>{qCount} questions</span>
                  </div>
                  <Button className="w-full" onClick={() => startExam(exam)}>Start Exam <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}