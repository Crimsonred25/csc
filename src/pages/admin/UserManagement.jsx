import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Check, X, Search, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const STATUS_CONFIG = {
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const load = () => {
    base44.entities.User.list('-created_date', 100).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (u) => {
    await base44.entities.User.update(u.id, { account_status: 'approved' });
    await base44.entities.ActivityLog.create({
      user_email: u.email,
      user_name: u.full_name,
      action: 'user_approved',
      description: `Admin approved account for ${u.full_name || u.email}`,
      resource_type: 'User',
      resource_id: u.id,
    });
    toast({ title: 'User approved', description: `${u.full_name || u.email} can now access the portal.` });
    load();
  };

  const handleReject = async (u) => {
    await base44.entities.User.update(u.id, { account_status: 'rejected' });
    await base44.entities.ActivityLog.create({
      user_email: u.email,
      user_name: u.full_name,
      action: 'user_rejected',
      description: `Admin rejected account for ${u.full_name || u.email}`,
      resource_type: 'User',
      resource_id: u.id,
    });
    toast({ title: 'User rejected', variant: 'destructive' });
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.account_status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage user accounts and approve pending sign-ups" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/10'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="No users match your search criteria." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">ID Number</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{(u.full_name || u.email)?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">{u.id_number || '—'}</td>
                    <td className="p-4">
                      <Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                        {u.role || 'reviewee'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${STATUS_CONFIG[u.account_status]?.color || STATUS_CONFIG.pending.color} border-0`}>
                        {STATUS_CONFIG[u.account_status]?.label || 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(u.created_date).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" onClick={() => handleApprove(u)} disabled={u.account_status === 'approved'}>
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReject(u)} disabled={u.account_status === 'rejected'}>
                            <X className="w-3 h-3 mr-1" /> Disapprove
                          </Button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}