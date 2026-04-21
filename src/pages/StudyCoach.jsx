import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Plus, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import ReactMarkdown from 'react-markdown';

const AGENT_NAME = 'study_coach';

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
        <BrainCircuit className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 150, 300].map((delay, i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  if (!message.content) return null;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start items-end'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted border border-border rounded-bl-sm'
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
            components={{
              p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
              h4: ({ children }) => <h4 className="font-semibold mt-2 mb-1">{children}</h4>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground">{children}</blockquote>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function StudyCoach() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!activeConv?.id) return;
    const unsub = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConv?.id]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(convs || []);
    } finally {
      setLoadingConvs(false);
    }
  };

  const startNewSession = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Session – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` },
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv);
    setMessages([]);
    setSending(true);
    // Auto-trigger analysis
    const updated = await base44.agents.addMessage(conv, {
      role: 'user',
      content: `Please analyze my exam history (my email is ${user?.email}) and give me a detailed breakdown of my knowledge gaps with specific questions I should practice.`,
    });
    setActiveConv(updated);
    setSending(false);
    inputRef.current?.focus();
  };

  const openSession = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConv(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const updated = await base44.agents.addMessage(activeConv, { role: 'user', content: text });
    setActiveConv(updated);
    setSending(false);
    inputRef.current?.focus();
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Study Coach"
        subtitle="AI-powered analysis of your exam history to target knowledge gaps"
        actions={
          <Button onClick={startNewSession} className="gap-2">
            <Plus className="w-4 h-4" /> New Analysis
          </Button>
        }
      />

      <div className="flex gap-5 flex-1" style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}>
        {/* Session list */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {loadingConvs ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm px-2">
              <BrainCircuit className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No sessions yet. Start a new analysis!
            </div>
          ) : conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => openSession(conv)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                activeConv?.id === conv.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card border-border hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                <span className="font-medium truncate text-xs">{conv.metadata?.name || 'Study Session'}</span>
              </div>
              <p className={`text-xs truncate ${activeConv?.id === conv.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                {new Date(conv.created_date).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-10">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <BrainCircuit className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl font-display mb-2">Your Personal Study Coach</h3>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                  I'll analyze your exam attempt history, pinpoint your weakest topics, and give you a personalized practice plan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                {['Knowledge gap analysis', 'Category breakdown', 'Targeted practice tips', 'Progress tracking'].map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-primary" />{tag}
                  </span>
                ))}
              </div>
              <Button onClick={startNewSession} size="lg" className="gap-2 mt-2">
                <Plus className="w-4 h-4" /> Start My Analysis
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence initial={false}>
                  {visibleMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                      <MessageBubble message={msg} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sending && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <TypingIndicator />
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border p-4 bg-card">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Ask a follow-up question…"
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all"
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon" className="rounded-xl h-10 w-10 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}