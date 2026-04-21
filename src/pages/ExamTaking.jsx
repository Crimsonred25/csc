import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Trophy, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamTaking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const examId = window.location.pathname.split('/exams/')[1];

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const exams = await base44.entities.Exam.filter({ id: examId });
      return exams[0];
    },
    enabled: !!examId,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['exam-questions', examId],
    queryFn: () => base44.entities.ExamQuestion.filter({ exam_id: examId }, 'order'),
    enabled: !!examId,
  });

  useEffect(() => {
    if (exam && !submitted) {
      setTimeLeft((exam.time_limit_minutes || 60) * 60);
    }
  }, [exam, submitted]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    let score = 0;
    let totalPoints = 0;
    const answerDetails = questions.map(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_answer;
      const pts = q.points || 1;
      totalPoints += pts;
      if (isCorrect) score += pts;
      return { question_id: q.id, selected_answer: selected || '', is_correct: isCorrect };
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    const attempt = await base44.entities.ExamAttempt.create({
      exam_id: examId,
      exam_title: exam?.title,
      user_email: user?.email,
      user_name: user?.full_name,
      score,
      total_points: totalPoints,
      percentage,
      answers: answerDetails,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString(),
    });

    await base44.entities.ActivityLog.create({
      user_email: user?.email,
      user_name: user?.full_name,
      action: 'exam_taken',
      description: `Completed exam: ${exam?.title} — Score: ${score}/${totalPoints} (${Math.round(percentage)}%)`,
      resource_type: 'Exam',
      resource_id: examId,
    });

    setResult({ score, totalPoints, percentage, timeTaken, answerDetails });
  }, [submitted, answers, questions, examId, exam, user, startTime]);

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Results view
  if (submitted && result) {
    const passed = result.percentage >= 75;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-8 text-center ${passed ? 'border-emerald-200' : 'border-amber-200'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {passed ? <Trophy className="w-10 h-10 text-emerald-600" /> : <AlertTriangle className="w-10 h-10 text-amber-600" />}
            </div>
            <h2 className="text-2xl font-bold font-display mb-1">{passed ? 'Congratulations!' : 'Keep Studying!'}</h2>
            <p className="text-muted-foreground mb-6">{exam.title}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{result.score}/{result.totalPoints}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{Math.round(result.percentage)}%</p>
                <p className="text-xs text-muted-foreground">Percentage</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{formatTime(result.timeTaken)}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/exams')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Exams
              </Button>
              {exam.is_ranked && (
                <Button onClick={() => navigate('/leaderboard')}>
                  <Trophy className="w-4 h-4 mr-1" /> View Leaderboard
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Answer review */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Answer Review</h3>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const detail = result.answerDetails[i];
              return (
                <div key={q.id} className={`p-4 rounded-lg border ${detail?.is_correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  <p className="font-medium text-sm mb-2">{i + 1}. {q.question_text}</p>
                  <p className="text-xs">
                    Your answer: <span className="font-bold">{detail?.selected_answer || 'Not answered'}</span>
                    {!detail?.is_correct && <span className="ml-3 text-emerald-600">Correct: <strong>{q.correct_answer}</strong></span>}
                  </p>
                  {q.explanation && <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Exam taking view
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const isUrgent = timeLeft < 300;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold font-display">{exam.title}</h2>
          <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      {question && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              <p className="text-lg font-medium mb-6">{question.question_text}</p>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [question.id]: val }))}
                className="space-y-3"
              >
                {question.choices?.map((choice) => (
                  <Label
                    key={choice.label}
                    htmlFor={`${question.id}-${choice.label}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[question.id] === choice.label
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/30'
                    }`}
                  >
                    <RadioGroupItem value={choice.label} id={`${question.id}-${choice.label}`} />
                    <span className="font-medium text-sm">{choice.label}. {choice.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentQ(prev => prev - 1)} disabled={currentQ === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        {/* Question dots */}
        <div className="hidden md:flex items-center gap-1 flex-wrap max-w-md justify-center">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i === currentQ ? 'bg-primary text-primary-foreground scale-110' :
                answers[q.id] ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(prev => prev + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-4 h-4 mr-1" /> Submit Exam
          </Button>
        )}
      </div>
    </div>
  );
}