import React from 'react';
import { 
  BarChart3, 
  Bolt, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skill, Execution } from '../../types';
import { formatDate } from '../../lib/utils';

interface DashboardProps {
  skills: Skill[];
  history: Execution[];
  onRunSkill: (skill: Skill) => void;
  onCreateSkill: () => void;
  onNavigateToHistory: () => void;
}

export default function Dashboard({ skills, history, onRunSkill, onCreateSkill, onNavigateToHistory }: DashboardProps) {
  const recentSkills = skills.slice(0, 3);
  const recentHistory = history.slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-12 pb-20"
    >
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-serif text-near-black mb-3">Workspace Overview</h1>
          <p className="font-serif text-xl text-charcoal-warm italic opacity-80">
            Welcome back. Here's a pulse check of your AI operations.
          </p>
        </div>
        <button 
          onClick={onCreateSkill}
          className="bg-terracotta text-ivory px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Create Skill
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Skill Library', value: skills.length, detail: 'Built for precision', icon: Layers, color: 'text-near-black' },
          { label: 'Total Runs', value: history.length, detail: 'AI generated content', icon: Bolt, color: 'text-terracotta' },
          { label: 'Success Rate', value: '98%', detail: 'High output quality', icon: Sparkles, color: 'text-charcoal-warm' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-ivory rounded-2xl p-8 border border-border-cream shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-52">
            <div className="flex items-center justify-between text-stone-gray/60">
              <span className="text-[10px] uppercase tracking-widest font-bold tracking-widest">{stat.label}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <div className="text-7xl font-serif text-near-black leading-none mb-4">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-gray">{stat.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
        {/* Recent Skills (Quick Actions) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-cream pb-4">
            <h2 className="text-2xl font-serif text-near-black">Quick Run</h2>
            <button className="text-xs font-bold uppercase tracking-widest text-terracotta hover:underline">Manage All Library</button>
          </div>
          
          <div className="space-y-4">
            {recentSkills.length > 0 ? recentSkills.map(skill => (
              <button 
                key={skill.id}
                onClick={() => onRunSkill(skill)}
                className="w-full group bg-parchment/50 hover:bg-ivory border border-border-warm rounded-xl p-5 text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-ivory rounded-lg text-terracotta shadow-sm border border-border-cream group-hover:scale-110 transition-transform">
                    <Zap size={18} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-near-black">{skill.name}</h4>
                    <p className="text-xs text-stone-gray italic">{skill.runCount} past executions</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-stone-gray opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>
            )) : (
              <div className="py-12 text-center bg-surface-container/20 rounded-2xl border-2 border-dashed border-border-warm">
                <p className="text-stone-gray italic font-serif text-sm px-10">
                  Your most used skills will appear here for one-click access.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-cream pb-4">
            <h2 className="text-2xl font-serif text-near-black">Recent Activity</h2>
            <button onClick={onNavigateToHistory} className="text-xs font-bold uppercase tracking-widest text-terracotta hover:underline">View All History</button>
          </div>

          <div className="space-y-6">
            {recentHistory.length > 0 ? recentHistory.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-terracotta ring-4 ring-parchment" />
                  <div className="w-px flex-1 bg-border-warm mt-2" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-near-black uppercase tracking-widest">Execution complete</span>
                    <span className="text-[10px] text-stone-gray uppercase tracking-widest">• {formatDate(item.timestamp)}</span>
                  </div>
                  <p className="text-sm text-charcoal-warm font-serif italic mb-2 line-clamp-1">
                    "{item.output.substring(0, 100)}..."
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center justify-center bg-surface-container/20 rounded-2xl border-2 border-dashed border-border-warm text-center gap-4">
                <Clock size={32} className="text-stone-gray/30" />
                <p className="text-stone-gray italic font-serif text-sm px-10">
                   Waiting for your first AI generation...
                </p>
              </div>
            )}
            
            {recentHistory.length > 0 && (
              <div className="flex gap-4">
                 <div className="w-2.5 h-2.5 rounded-full border-2 border-border-warm translate-y-1" />
                 <span className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">End of recent history</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
