import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const CATEGORY_COLORS = {
  general_information: 'bg-blue-100 text-blue-700',
  numerical_reasoning: 'bg-purple-100 text-purple-700',
  analytical_ability: 'bg-indigo-100 text-indigo-700',
  verbal_reasoning: 'bg-green-100 text-green-700',
  clerical_operations: 'bg-orange-100 text-orange-700',
  philippine_constitution: 'bg-red-100 text-red-700',
  code_of_conduct: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

function FlashcardPlayer({ deck, cards, onClose, user }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [done, setDone] = useState(false);

  const current = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  const handleFlip = () => setFlipped(!flipped);

  const handleKnow = (knows) => {
    if (knows) setKnown(p => [...p, index]);
    else setUnknown(p => [...p, index]);
    if (index + 1 >= cards.length) {
      setDone(true);
      base44.entities.ActivityLog.create({
        user_email: user?.email,
        user_name: user?.full_name,
        action: 'flashcard_reviewed',
        description: `Completed flashcard deck: ${deck.title} (${cards.length} cards)`,
        resource_type: 'FlashcardDeck',
        resource_id: deck.id,
      });
    } else {
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 200);
    }
  };

  const handleReset = () => {
    setIndex(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
    setDone(false);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold font-display mb-2">Deck Complete!</h2>
        <p className="text-muted-foreground mb-2">You studied all {cards.length} cards.</p>
        <div className="flex gap-6 mt-4 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{known.length}</p>
            <p className="text-sm text-muted-foreground">Known</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{unknown.length}</p>
            <p className="text-sm text-muted-foreground">Review Again</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleReset} variant="outline"><RotateCcw className="w-4 h-4 mr-2" /> Study Again</Button>
          <Button onClick={onClose}>Back to Decks</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={onClose}><ChevronLeft className="w-4 h-4 mr-1" /> All Decks</Button>
        <span className="text-sm text-muted-foreground font-medium">{index + 1} / {cards.length}</span>
        <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-8">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <div className="perspective-1000 mb-8" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-full cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card className="p-10 min-h-64 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">Question</Badge>
            <p className="text-xl font-semibold">{current?.front}</p>
            <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
          </Card>
          {/* Back */}
          <Card className="p-10 min-h-64 flex flex-col items-center justify-center text-center absolute inset-0 bg-primary text-primary-foreground" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <Badge className="mb-4 bg-white/20 text-white border-0">Answer</Badge>
            <p className="text-xl font-semibold">{current?.back}</p>
          </Card>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-red-200 text-red-500 hover:bg-red-50"
          onClick={() => handleKnow(false)}
        >
          <X className="w-5 h-5 mr-2" /> Still Learning
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => handleKnow(true)}
        >
          <Check className="w-5 h-5 mr-2" /> Got It!
        </Button>
      </div>
    </div>
  );
}

export default function Flashcards() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.FlashcardDeck.list('-created_date'),
      base44.entities.Flashcard.list('order'),
    ]).then(([d, c]) => {
      setDecks(d);
      setCards(c);
    }).finally(() => setLoading(false));
  }, []);

  const openDeck = (deck) => {
    const dc = cards.filter(c => c.deck_id === deck.id);
    setDeckCards(dc);
    setActiveDeck(deck);
  };

  if (activeDeck) {
    return <FlashcardPlayer deck={activeDeck} cards={deckCards} onClose={() => setActiveDeck(null)} user={user} />;
  }

  return (
    <div>
      <PageHeader
        title="Flashcard Decks"
        subtitle="Master topics with active recall flashcards"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : decks.length === 0 ? (
        <EmptyState icon={Layers} title="No flashcard decks" description="No flashcard decks have been created yet. Check back later." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, i) => {
            const count = cards.filter(c => c.deck_id === deck.id).length;
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-primary/30"
                  onClick={() => openDeck(deck)}
                >
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-7 h-7 text-indigo-600" />
                  </div>
                  {deck.category && (
                    <Badge className={`mb-3 text-xs ${CATEGORY_COLORS[deck.category] || 'bg-gray-100 text-gray-700'} border-0`}>
                      {deck.category.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  <h3 className="font-bold text-lg mb-1">{deck.title}</h3>
                  {deck.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{deck.description}</p>}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <span className="text-sm font-bold text-primary">{count} cards</span>
                    <Button size="sm" className="group-hover:shadow-md transition-all">
                      Study Now <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
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