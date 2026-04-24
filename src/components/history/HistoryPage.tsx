import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Clock, 
  ChevronRight,
  Copy,
  RotateCcw,
  Trash2,
  Star,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Execution } from '../../types';
import { formatDate } from '../../lib/utils';

interface HistoryPageProps {
  historyData: Execution[];
  searchQuery?: string;
  onDeleteExecution: (id: string) => void;
}

export default function HistoryPage({ historyData, searchQuery = '', onDeleteExecution }: HistoryPageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const filteredHistory = historyData.filter(item => 
    item.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.values(item.inputData).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedId, setSelectedId] = useState(filteredHistory[0]?.id || historyData[0]?.id);

  const selectedExecution = historyData.find(h => h.id === selectedId);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this execution? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await onDeleteExecution(id);
      const nextId = filteredHistory.find(h => h.id !== id)?.id || null;
      setSelectedId(nextId);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || 'Unknown error. Check your permissions.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 h-[calc(100vh-160px)] flex flex-col"
    >
      <div className="flex justify-between items-end border-b border-border-cream pb-6">
        <div>
          <h1 className="text-5xl font-serif text-near-black mb-2">Execution History</h1>
          <p className="font-serif text-lg text-charcoal-warm italic opacity-80">
            Review, compare, and reuse your past AI generations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Master: History List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray" />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchQuery}
                readOnly
                className="w-full bg-ivory border border-border-cream rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-focus-blue outline-none opacity-70"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-5 rounded-xl border transition-all active:scale-[0.98] ${
                  selectedId === item.id 
                    ? 'bg-ivory border-terracotta shadow-md' 
                    : 'bg-ivory/50 border-border-cream hover:border-border-warm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-near-black uppercase tracking-tight">ID: {item.id}</span>
                  <span className="text-[10px] text-stone-gray font-medium">{formatDate(item.timestamp)}</span>
                </div>
                <p className="text-sm text-charcoal-warm line-clamp-2 leading-relaxed italic mb-4">
                  "{item.output.substring(0, 100)}..."
                </p>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-stone-200 text-stone-600`}>
                  {item.status}
                </div>
              </button>
            ))}
            {filteredHistory.length === 0 && (
              <div className="py-20 text-center opacity-40 italic font-serif">
                <Search size={32} className="mx-auto mb-4" />
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Detail: Execution View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-parchment rounded-xl border border-border-warm shadow-inner overflow-hidden">
          {selectedExecution ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedExecution.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full overflow-y-auto p-10 space-y-10 custom-scrollbar"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-serif text-near-black mb-1">Execution Result</h2>
                    <p className="text-xs text-stone-gray flex items-center gap-1.5 font-medium">
                      <Clock size={12} /> Generated on {formatDate(selectedExecution.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigator.clipboard.writeText(selectedExecution.output)}
                      className="p-2.5 bg-ivory border border-border-warm rounded-lg text-stone-gray hover:text-terracotta transition-all shadow-sm"
                      title="Copy to Clipboard"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedExecution.id)}
                      disabled={isDeleting}
                      className={`p-2.5 bg-ivory border border-border-warm rounded-lg transition-all shadow-sm ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : 'text-stone-gray hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Delete from History"
                    >
                      {isDeleting ? (
                         <RotateCcw size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-charcoal-warm uppercase tracking-widest border-b border-border-warm pb-2">Input Data</h3>
                  <div className="grid grid-cols-2 gap-6 bg-ivory/50 p-6 rounded-xl border border-border-cream">
                    {Object.entries(selectedExecution.inputData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] uppercase font-bold text-stone-gray mb-1">{key}</p>
                        <p className="text-sm font-medium text-near-black">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedExecution.metadata && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-charcoal-warm uppercase tracking-widest border-b border-border-warm pb-2">Editorial Insights</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-ivory/50 p-4 rounded-xl border border-border-cream">
                        <p className="text-[9px] uppercase font-bold text-stone-gray mb-1">Model</p>
                        <p className="text-xs font-medium text-near-black text-xs">{selectedExecution.metadata.model}</p>
                      </div>
                      <div className="bg-ivory/50 p-4 rounded-xl border border-border-cream">
                        <p className="text-[9px] uppercase font-bold text-stone-gray mb-1">Word Count</p>
                        <p className="text-xs font-serif font-bold text-terracotta">{selectedExecution.metadata.wordCount} words</p>
                      </div>
                      <div className="bg-ivory/50 p-4 rounded-xl border border-border-cream">
                        <p className="text-[9px] uppercase font-bold text-stone-gray mb-1">Reading Time</p>
                        <p className="text-xs font-serif font-bold text-terracotta">~{selectedExecution.metadata.readTime} min</p>
                      </div>
                      <div className="bg-ivory/50 p-4 rounded-xl border border-border-cream">
                        <p className="text-[9px] uppercase font-bold text-stone-gray mb-1">Temperature</p>
                        <p className="text-xs font-medium text-near-black">{selectedExecution.metadata.temperature}</p>
                      </div>
                    </div>
                    {selectedExecution.metadata.profilesUsed && selectedExecution.metadata.profilesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedExecution.metadata.profilesUsed.map(p => (
                          <span key={p} className="text-[9px] bg-parchment text-charcoal-warm px-2 py-0.5 rounded border border-border-warm font-medium">
                            Profile: {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  <h3 className="text-xs font-bold text-charcoal-warm uppercase tracking-widest border-b border-border-warm pb-2">Output Result</h3>
                  <div 
                    className="bg-ivory p-8 rounded-xl border border-border-cream shadow-sm font-serif text-lg leading-relaxed text-charcoal-warm relative group whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedExecution.output }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <FileText size={48} strokeWidth={1} />
              <p className="mt-4 italic font-serif">Select an execution to view details</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
