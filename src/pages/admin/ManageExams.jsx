import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, ClipboardCheck, ArrowLeft, Trophy, Clock, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const CATEGORIES = ['general_information', 'numerical_reasoning', 'analytical_ability', 'verbal_reasoning', 'clerical_operations', 'philippine_constitution', 'code_of_conduct', 'comprehensive'];
const EMPTY_EXAM = { title: '', description: '', category: 'comprehensive', time_limit_minutes: 60, is_ranked: false, is_published: false };
const EMPTY_Q = { question_text: '', choices: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], correct_answer: 'A', points: 1, explanation: '' };

export default function ManageExams() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [examOpen, setExamOpen] = useState(false);
  const [qOpen, setQOpen] = useState(false);
  const [examForm, setExamForm] = useState(EMPTY_EXAM);
  const [qForm, setQForm] = useState(EMPTY_Q);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const { toast } = useToast();

  const load = () => Promise.all([
    base44.entities.Exam.list('-created_date'),
    base44.entities.ExamQuestion.list('order'),
  ]).then(([e, q]) => { setExams(e); setQuestions(q); }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const examQs = activeExam ? questions.filter(q => q.exam_id === activeExam.id).sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  const saveExam = async () => {
    if (!examForm.title) return;
    let saved;
    if (editingExam) {
      saved = await base44.entities.Exam.update(editingExam.id, examForm);
    } else {
      saved = await base44.entities.Exam.create(examForm);
    }
    setExamOpen(false);
    load();
    toast({ title: editingExam ? 'Exam updated!' : 'Exam created!' });
  };

  const deleteExam = async (e) => {
    if (!confirm(`Delete exam "${e.title}"?`)) return;
    const qs = questions.filter(q => q.exam_id === e.id);
    await Promise.all(qs.map(q => base44.entities.ExamQuestion.delete(q.id)));
    await base44.entities.Exam.delete(e.id);
    setActiveExam(null);
    load();
    toast({ title: 'Exam deleted' });
  };

  const togglePublished = async (exam) => {
    await base44.entities.Exam.update(exam.id, { is_published: !exam.is_published });
    load();
    if (activeExam?.id === exam.id) setActiveExam({ ...activeExam, is_published: !exam.is_published });
  };

  const saveQuestion = async () => {
    if (!qForm.question_text) return;
    const data = { ...qForm, exam_id: activeExam.id, order: editingQ ? editingQ.order : examQs.length };
    if (editingQ) {
      await base44.entities.ExamQuestion.update(editingQ.id, data);
    } else {
      await base44.entities.ExamQuestion.create(data);
      // Update question count on exam
      await base44.entities.Exam.update(activeExam.id, { question_count: examQs.length + 1 });
    }
    setQOpen(false);
    setQForm(EMPTY_Q);
    setEditingQ(null);
    load();
    toast({ title: editingQ ? 'Question updated!' : 'Question added!' });
  };

  const deleteQuestion = async (q) => {
    await base44.entities.ExamQuestion.delete(q.id);
    load();
    toast({ title: 'Question deleted' });
  };

  const updateChoice = (idx, field, val) => {
    setQForm(f => ({ ...f, choices: f.choices.map((c, i) => i === idx ? { ...c, [field]: val } : c) }));
  };

  if (activeExam) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" onClick={() => setActiveExam(null)}><ArrowLeft className="w-4 h-4 mr-1" />All Exams</Button>
          <div className="flex-1">
            <h2 className="font-bold text-xl">{activeExam.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{examQs.length} questions</span>
              {activeExam.is_ranked && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs"><Trophy className="w-3 h-3 mr-1" />Ranked</Badge>}
              <Badge className={activeExam.is_published ? 'bg-emerald-100 text-emerald-700 border-0 text-xs' : 'bg-gray-100 text-gray-600 border-0 text-xs'}>
                {activeExam.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{activeExam.is_published ? 'Published' : 'Draft'}</span>
            <Switch checked={activeExam.is_published} onCheckedChange={() => togglePublished(activeExam)} />
            <Button onClick={() => { setQForm(EMPTY_Q); setEditingQ(null); setQOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Question
            </Button>
          </div>
        </div>

        {examQs.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No questions yet" description="Add your first question to this exam." />
        ) : (
          <div className="space-y-4">
            {examQs.map((q, i) => (
              <Card key={q.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold mb-3">Q{i + 1}: {q.question_text}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.choices?.map(c => (
                        <div key={c.label} className={`p-2 rounded-lg text-sm border ${c.label === q.correct_answer ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' : 'bg-muted/50 border-border'}`}>
                          <span className="font-bold">{c.label}.</span> {c.text}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{q.points || 1} point(s)</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setQForm({ question_text: q.question_text, choices: q.choices || EMPTY_Q.choices, correct_answer: q.correct_answer, points: q.points || 1, explanation: q.explanation || '' }); setEditingQ(q); setQOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => deleteQuestion(q)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={qOpen} onOpenChange={setQOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingQ ? 'Edit Question' : 'Add Question'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Question *</label>
                <textarea value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Enter question text" className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Answer Choices</label>
                <div className="space-y-2">
                  {qForm.choices.map((c, i) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${qForm.correct_answer === c.label ? 'bg-emerald-600 text-white' : 'bg-muted'}`}>{c.label}</span>
                      <Input value={c.text} onChange={e => updateChoice(i, 'text', e.target.value)} placeholder={`Choice ${c.label}`} />
                      <Button type="button" size="sm" variant={qForm.correct_answer === c.label ? 'default' : 'outline'} className={qForm.correct_answer === c.label ? 'bg-emerald-600 hover:bg-emerald-700' : ''} onClick={() => setQForm(f => ({ ...f, correct_answer: c.label }))}>
                        {qForm.correct_answer === c.label ? '✓ Correct' : 'Set Correct'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-1 block">Points</label>
                  <Input type="number" min={1} value={qForm.points} onChange={e => setQForm(f => ({ ...f, points: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Explanation (optional)</label>
                <Input value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explanation shown after submission" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQOpen(false)}>Cancel</Button>
              <Button onClick={saveQuestion}>Save Question</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Manage Exams"
        subtitle="Build and publish simulated exams"
        actions={<Button onClick={() => { setExamForm(EMPTY_EXAM); setEditingExam(null); setExamOpen(true); }}><Plus className="w-4 h-4 mr-2" />New Exam</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : exams.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No exams yet" description="Create your first exam." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exams.map(exam => {
            const qCount = questions.filter(q => q.exam_id === exam.id).length;
            return (
              <Card key={exam.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveExam(exam)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex gap-2">
                    {exam.is_ranked && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs"><Trophy className="w-3 h-3 mr-1" />Ranked</Badge>}
                    <Badge className={exam.is_published ? 'bg-emerald-100 text-emerald-700 border-0 text-xs' : 'bg-gray-100 text-gray-500 border-0 text-xs'}>
                      {exam.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{exam.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.time_limit_minutes}m</span>
                  <span>{qCount} questions</span>
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="ghost" className="h-7" onClick={e => { e.stopPropagation(); setExamForm({ title: exam.title, description: exam.description || '', category: exam.category || 'comprehensive', time_limit_minutes: exam.time_limit_minutes || 60, is_ranked: exam.is_ranked || false, is_published: exam.is_published || false }); setEditingExam(exam); setExamOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={e => { e.stopPropagation(); togglePublished(exam); }}>
                    {exam.is_published ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                    {exam.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:bg-red-50" onClick={e => { e.stopPropagation(); deleteExam(exam); }}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={examOpen} onOpenChange={setExamOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingExam ? 'Edit Exam' : 'New Exam'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <Input value={examForm.title} onChange={e => setExamForm(f => ({ ...f, title: e.target.value }))} placeholder="Exam title" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Input value={examForm.description} onChange={e => setExamForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold mb-1 block">Category</label>
                <Select value={examForm.category} onValueChange={v => setExamForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <label className="text-sm font-semibold mb-1 block">Time (mins)</label>
                <Input type="number" min={5} value={examForm.time_limit_minutes} onChange={e => setExamForm(f => ({ ...f, time_limit_minutes: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Ranked Exam</p>
                <p className="text-xs text-muted-foreground">Show on public leaderboard</p>
              </div>
              <Switch checked={examForm.is_ranked} onCheckedChange={v => setExamForm(f => ({ ...f, is_ranked: v }))} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-muted-foreground">Visible to reviewees</p>
              </div>
              <Switch checked={examForm.is_published} onCheckedChange={v => setExamForm(f => ({ ...f, is_published: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamOpen(false)}>Cancel</Button>
            <Button onClick={saveExam}>Save Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}