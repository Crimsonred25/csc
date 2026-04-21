import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Layers, ChevronRight, ArrowLeft } from 'lucide-react';
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

export default function ManageFlashcards() {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState(null);
  const [deckOpen, setDeckOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [deckForm, setDeckForm] = useState({ title: '', description: '', category: 'other' });
  const [cardForm, setCardForm] = useState({ front: '', back: '' });
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const { toast } = useToast();

  const load = () => Promise.all([
    base44.entities.FlashcardDeck.list('-created_date'),
    base44.entities.Flashcard.list('order'),
  ]).then(([d, c]) => { setDecks(d); setCards(c); }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const deckCards = activeDeck ? cards.filter(c => c.deck_id === activeDeck.id) : [];

  const saveDeck = async () => {
    if (!deckForm.title) return;
    if (editingDeck) {
      await base44.entities.FlashcardDeck.update(editingDeck.id, deckForm);
    } else {
      await base44.entities.FlashcardDeck.create(deckForm);
    }
    setDeckOpen(false);
    load();
    toast({ title: editingDeck ? 'Deck updated!' : 'Deck created!' });
  };

  const deleteDeck = async (d) => {
    if (!confirm(`Delete deck "${d.title}" and all its cards?`)) return;
    const deckCards = cards.filter(c => c.deck_id === d.id);
    await Promise.all(deckCards.map(c => base44.entities.Flashcard.delete(c.id)));
    await base44.entities.FlashcardDeck.delete(d.id);
    setActiveDeck(null);
    load();
    toast({ title: 'Deck deleted' });
  };

  const saveCard = async () => {
    if (!cardForm.front || !cardForm.back) return;
    const data = { ...cardForm, deck_id: activeDeck.id, order: editingCard ? editingCard.order : deckCards.length };
    if (editingCard) {
      await base44.entities.Flashcard.update(editingCard.id, data);
    } else {
      await base44.entities.Flashcard.create(data);
    }
    setCardOpen(false);
    setCardForm({ front: '', back: '' });
    setEditingCard(null);
    load();
    toast({ title: editingCard ? 'Card updated!' : 'Card added!' });
  };

  const deleteCard = async (c) => {
    await base44.entities.Flashcard.delete(c.id);
    load();
    toast({ title: 'Card deleted' });
  };

  if (activeDeck) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={() => setActiveDeck(null)}><ArrowLeft className="w-4 h-4 mr-1" />All Decks</Button>
          <div>
            <h2 className="font-bold text-xl">{activeDeck.title}</h2>
            <p className="text-sm text-muted-foreground">{deckCards.length} cards</p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={() => { setCardForm({ front: '', back: '' }); setEditingCard(null); setCardOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add Card
          </Button>
        </div>

        {deckCards.length === 0 ? (
          <EmptyState icon={Layers} title="No cards yet" description="Add your first card to this deck." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deckCards.map((card, i) => (
              <Card key={card.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs">Card {i + 1}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setCardForm({ front: card.front, back: card.back }); setEditingCard(card); setCardOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteCard(card)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium text-sm mb-2 line-clamp-2">{card.front}</p>
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={cardOpen} onOpenChange={setCardOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCard ? 'Edit Card' : 'Add Flashcard'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Front (Question/Term)</label>
                <textarea
                  value={cardForm.front}
                  onChange={e => setCardForm(f => ({ ...f, front: e.target.value }))}
                  placeholder="Enter the question or term"
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Back (Answer/Definition)</label>
                <textarea
                  value={cardForm.back}
                  onChange={e => setCardForm(f => ({ ...f, back: e.target.value }))}
                  placeholder="Enter the answer or definition"
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCardOpen(false)}>Cancel</Button>
              <Button onClick={saveCard}>Save Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Manage Flashcards"
        subtitle="Create and organize flashcard decks"
        actions={<Button onClick={() => { setDeckForm({ title: '', description: '', category: 'other' }); setEditingDeck(null); setDeckOpen(true); }}><Plus className="w-4 h-4 mr-2" />New Deck</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : decks.length === 0 ? (
        <EmptyState icon={Layers} title="No decks yet" description="Create your first flashcard deck." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decks.map(d => {
            const count = cards.filter(c => c.deck_id === d.id).length;
            return (
              <Card key={d.id} className="p-5 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveDeck(d)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{d.title}</h3>
                      <p className="text-xs text-muted-foreground">{count} cards · {(d.category || 'other').replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={e => { e.stopPropagation(); setDeckForm({ title: d.title, description: d.description || '', category: d.category || 'other' }); setEditingDeck(d); setDeckOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={e => { e.stopPropagation(); deleteDeck(d); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 self-center text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={deckOpen} onOpenChange={setDeckOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDeck ? 'Edit Deck' : 'New Flashcard Deck'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <Input value={deckForm.title} onChange={e => setDeckForm(f => ({ ...f, title: e.target.value }))} placeholder="Deck title" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Input value={deckForm.description} onChange={e => setDeckForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Category</label>
              <Select value={deckForm.category} onValueChange={v => setDeckForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeckOpen(false)}>Cancel</Button>
            <Button onClick={saveDeck}>Save Deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}