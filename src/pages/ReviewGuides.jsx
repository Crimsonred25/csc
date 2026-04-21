import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Search, BookOpen, ExternalLink, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const CATEGORIES = {
  general_information: { label: 'General Info', color: 'bg-blue-100 text-blue-700' },
  numerical_reasoning: { label: 'Numerical', color: 'bg-purple-100 text-purple-700' },
  analytical_ability: { label: 'Analytical', color: 'bg-indigo-100 text-indigo-700' },
  verbal_reasoning: { label: 'Verbal', color: 'bg-green-100 text-green-700' },
  clerical_operations: { label: 'Clerical', color: 'bg-orange-100 text-orange-700' },
  philippine_constitution: { label: 'Constitution', color: 'bg-red-100 text-red-700' },
  code_of_conduct: { label: 'Code of Conduct', color: 'bg-amber-100 text-amber-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

export default function ReviewGuides() {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    base44.entities.ReviewGuide.list('-created_date').then(setGuides).finally(() => setLoading(false));
  }, []);

  const handleView = async (guide) => {
    setViewing(guide);
    // Log activity
    base44.entities.ActivityLog.create({
      user_email: user?.email,
      user_name: user?.full_name,
      action: 'pdf_viewed',
      description: `Viewed review guide: ${guide.title}`,
      resource_type: 'ReviewGuide',
      resource_id: guide.id,
    });
    // Increment view count
    base44.entities.ReviewGuide.update(guide.id, { view_count: (guide.view_count || 0) + 1 });
  };

  const filtered = guides.filter(g => {
    const matchSearch = g.title?.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || g.category === filterCat;
    return matchSearch && matchCat;
  });

  if (viewing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={() => setViewing(null)}>← Back to Library</Button>
          <h2 className="font-bold text-lg">{viewing.title}</h2>
        </div>
        <Card className="p-0 overflow-hidden">
          <iframe
            src={viewing.file_url}
            className="w-full h-[80vh]"
            title={viewing.title}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Review Guides Library"
        subtitle="Browse and study comprehensive PDF review materials"
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search guides..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/10'}`}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/10'}`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No guides found"
          description="No review guides are available yet. Check back later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((guide, i) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => handleView(guide)}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={`mb-3 text-xs ${CATEGORIES[guide.category]?.color || 'bg-gray-100 text-gray-700'} border-0`}>
                  {CATEGORIES[guide.category]?.label || 'Other'}
                </Badge>
                <h3 className="font-bold text-base mb-1 line-clamp-2">{guide.title}</h3>
                {guide.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{guide.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground">{guide.view_count || 0} views</span>
                  <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ExternalLink className="w-3 h-3 mr-1" /> View
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}