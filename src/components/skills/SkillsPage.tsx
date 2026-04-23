import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List as ListIcon,
  Bolt,
  Edit3,
  Trash2,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill } from '../../types';

interface SkillsPageProps {
  skills: Skill[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRunSkill: (skill: Skill) => void;
  onEditSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
  onCreateSkill: () => void;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'popular';

export default function SkillsPage({ skills, searchQuery, onSearchChange, onRunSkill, onEditSkill, onDeleteSkill, onCreateSkill }: SkillsPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAndSortedSkills = useMemo(() => {
    let result = [...skills];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(skill => 
        skill.name.toLowerCase().includes(query) || 
        skill.description.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.runCount || 0) - (a.runCount || 0);
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [skills, searchQuery, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border-cream pb-6">
        <div>
          <h1 className="text-5xl font-serif text-near-black mb-2">My Skills</h1>
          <p className="font-serif text-lg text-charcoal-warm italic opacity-80">
            Manage, categorize, and refine your custom AI skill library.
          </p>
        </div>
        <button 
          onClick={onCreateSkill}
          className="bg-terracotta text-ivory px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Skill
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search skills by name or keyword..."
              className="w-full bg-ivory border border-border-cream rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow"
            />
          </div>
          
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-ivory border border-border-cream rounded-xl px-4 py-3 pr-10 text-xs font-bold uppercase tracking-widest text-stone-gray outline-none focus:ring-1 focus:ring-terracotta cursor-pointer min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="popular">Most Used</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-gray" />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 border rounded-lg transition-all ${isFilterOpen ? 'border-terracotta bg-parchment text-terracotta' : 'border-border-cream text-stone-gray hover:bg-parchment'}`}
           >
            <Filter size={18} />
           </button>
           <div className="w-px h-6 bg-border-warm mx-1" />
           <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 border rounded-lg transition-all ${viewMode === 'grid' ? 'bg-ivory border-terracotta/30 text-terracotta shadow-sm' : 'border-border-cream text-stone-gray hover:bg-parchment'}`}
           >
            <Grid size={18} />
           </button>
           <button 
            onClick={() => setViewMode('list')}
            className={`p-3 border rounded-lg transition-all ${viewMode === 'list' ? 'bg-ivory border-terracotta/30 text-terracotta shadow-sm' : 'border-border-cream text-stone-gray hover:bg-parchment'}`}
           >
            <ListIcon size={18} />
           </button>
        </div>
      </div>

      {/* Skills Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSkills.map((skill) => (
            <motion.div 
              key={skill.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="bg-ivory rounded-xl border border-border-cream p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-terracotta group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => onRunSkill(skill)}
                >
                  <Bolt size={20} fill="currentColor" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEditSkill(skill)}
                    className="p-2 text-stone-gray hover:text-terracotta transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                     onClick={() => onDeleteSkill(skill.id)}
                     className="p-2 text-stone-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="cursor-pointer flex-1" onClick={() => onRunSkill(skill)}>
                <h3 className="text-2xl font-serif text-near-black mb-2">{skill.name}</h3>
                <p className="text-sm text-charcoal-warm mb-6 line-clamp-3 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-border-warm flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-gray uppercase tracking-widest font-bold">Executions</span>
                      <span className="text-xs font-bold text-near-black">{skill.runCount || 0}</span>
                    </div>
                 </div>
                 <span className="text-[10px] bg-parchment px-2 py-1 rounded border border-border-warm text-stone-gray font-bold uppercase tracking-widest">
                   {skill.model.replace('gemini-', '')}
                 </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedSkills.map((skill) => (
            <motion.div 
              key={skill.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-ivory rounded-xl border border-border-cream p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => onRunSkill(skill)}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-terracotta">
                  <Bolt size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-near-black">{skill.name}</h3>
                  <p className="text-xs text-stone-gray line-clamp-1">{skill.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 px-6">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-stone-gray uppercase tracking-widest font-bold">Model</span>
                  <span className="text-[10px] font-bold">{skill.model.replace('gemini-', '')}</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-[8px] text-stone-gray uppercase tracking-widest font-bold">Runs</span>
                  <span className="text-[10px] font-bold">{skill.runCount || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => onEditSkill(skill)}
                  className="p-2 text-stone-gray hover:text-terracotta transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                   onClick={() => onDeleteSkill(skill.id)}
                   className="p-2 text-stone-gray hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredAndSortedSkills.length === 0 && (
        <div className="col-span-full py-20 border-2 border-dashed border-border-warm rounded-3xl flex flex-col items-center justify-center text-stone-gray/40 italic">
          <Layers size={48} strokeWidth={1} className="mb-4" />
          <p className="text-lg">No skills found matching your criteria.</p>
        </div>
      )}
    </motion.div>
  );
}
