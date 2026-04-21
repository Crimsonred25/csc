import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Upload, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const CATEGORIES = ['general_information', 'numerical_reasoning', 'analytical_ability', 'verbal_reasoning', 'clerical_operations', 'philippine_constitution', 'code_of_conduct', 'other'];

const empty = { title: '', description: '', category: 'other', file_url: '' };

export default function ManageGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = () => base44.entities.ReviewGuide.list('-created_date').then(setGuides).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing(null); setOpen(true); };
  const openEdit = (g) => { setForm({ title: g.title, description: g.description || '', category: g.category || 'other', file_url: g.file_url || '' }); setEditing(g); setOpen(true); };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.file_url) { toast({ title: 'Please fill all required fields', variant: 'destructive' }); return; }
    if (editing) {
      await base44.entities.ReviewGuide.update(editing.id, form);
      toast({ title: 'Guide updated!' });
    } else {
      await base44.entities.ReviewGuide.create(form);
      toast({ title: 'Guide added!' });
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (g) => {
    if (!confirm(`Delete "${g.title}"?`)) return;
    await base44.entities.ReviewGuide.delete(g.id);
    toast({ title: 'Guide deleted' });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Manage Review Guides"
        subtitle="Upload, edit, and organize PDF review materials"
        actions={<Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Guide</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : guides.length === 0 ? (
        <EmptyState icon={BookOpen} title="No guides yet" description="Add your first review guide to get started." action={<Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Guide</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map(g => (
            <Card key={g.id} className="p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{g.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{g.description}</p>
                <Badge className="mt-2 text-xs bg-blue-50 text-blue-700 border-0">{(g.category || 'other').replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(g)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(g)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Guide' : 'Add Review Guide'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Category</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">PDF File *</label>
              <div className="flex gap-2">
                <Input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="or paste URL" />
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFile} />
                  <Button variant="outline" asChild disabled={uploading}>
                    <span>{uploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-1" />Upload</>}</span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}