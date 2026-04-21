import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Shield, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const ACTION_COLORS = {
  exam_taken: 'bg-purple-100 text-purple-700',
  flashcard_reviewed: 'bg-indigo-100 text-indigo-700',
  pdf_viewed: 'bg-blue-100 text-blue-700',
  user_signup: 'bg-emerald-100 text-emerald-700',
  user_approved: 'bg-green-100 text-green-700',
  user_rejected: 'bg-red-100 text-red-700',
  content_created: 'bg-cyan-100 text-cyan-700',
  content_updated: 'bg-amber-100 text-amber-700',
  content_deleted: 'bg-red-100 text-red-700',
  login: 'bg-gray-100 text-gray-700',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [sortDir, setSortDir] = useState('-created_date');

  useEffect(() => {
    base44.entities.ActivityLog.list(sortDir, 500).then(setLogs).finally(() => setLoading(false));
  }, [sortDir]);

  const filtered = logs.filter(l => {
    const matchSearch = l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const ACTIONS = [...new Set(logs.map(l => l.action))];

  return (
    <div>
      <PageHeader title="System Audit Log" subtitle="Complete timestamped history of all platform actions" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTIONS.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={setSortDir}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Newest First</SelectItem>
            <SelectItem value="created_date">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Shield} title="No logs found" description="No activity logs match your filters." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{log.user_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{log.user_email || 'system'}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={`${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'} border-0 text-xs whitespace-nowrap`}>
                        {(log.action || '').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm max-w-xs">
                      <p className="line-clamp-2">{log.description}</p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground text-right">
            Showing {filtered.length} of {logs.length} entries
          </div>
        </Card>
      )}
    </div>
  );
}