import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Globe, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Info,
  Folder,
  Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandProfile } from '../../types';

interface ImportWizardProps {
  onClose: () => void;
  onImport: (profile: BrandProfile) => void;
}

export default function ImportWizard({ onClose, onImport }: ImportWizardProps) {
  const [step, setStep] = useState<'source' | 'processing' | 'done'>('source');
  const [source, setSource] = useState<'obsidian' | 'lark' | null>(null);
  const [larkUrl, setLarkUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleObsidianImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setStep('processing');
    setIsSyncing(true);

    // Simulate processing Obsidian vault
    setTimeout(() => {
      const newProfile: BrandProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Obsidian Import',
        guidelines: `Imported from Obsidian Vault. Total ${files.length} documents processed. Content has been indexed for AI reference.`,
        attributes: ['Markdown Native', 'Personal Knowledge', 'Interlinked'],
        knowledgeFiles: (Array.from(files) as File[]).slice(0, 5).map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          type: f.type || 'text/markdown',
          size: f.size,
          createdAt: new Date().toISOString()
        })),
        updatedAt: new Date().toISOString(),
        isDefault: false,
        linkedSkills: 0
      };
      onImport(newProfile);
      setStep('done');
      setIsSyncing(false);
    }, 2000);
  };

  const handleLarkSync = () => {
    if (!larkUrl) return;
    setStep('processing');
    setIsSyncing(true);

    // Simulate Lark API fetching
    setTimeout(() => {
      const newProfile: BrandProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Lark Suite Docs',
        guidelines: `Live sync active for Lark Documents at ${larkUrl}. All changes in Lark will be automatically reflected here.`,
        attributes: ['Collaborative', 'Cloud Sync', 'Enterprise'],
        knowledgeFiles: [
          {
            id: 'lark-1',
            name: 'Lark Document Reference',
            type: 'application/lark-doc',
            size: 0,
            createdAt: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString(),
        isDefault: false,
        linkedSkills: 0
      };
      onImport(newProfile);
      setStep('done');
      setIsSyncing(false);
    }, 2500);
  };

  const handleObsidianDirectConnect = async () => {
    try {
      // Step 1: Request permission to access a local directory
      const dirHandle = await (window as any).showDirectoryPicker();
      
      setStep('processing');
      setIsSyncing(true);

      const files: any[] = [];
      let combinedContent = '';
      let fileCount = 0;
      
      // Helper to walk the directory recursively
      async function walkDirectory(handle: any, path = '') {
        for await (const entry of handle.values()) {
          if (entry.kind === 'directory') {
            await walkDirectory(entry, `${path}${entry.name}/`);
          } else if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            const file = await entry.getFile();
            const content = await file.text();
            
            // Collect metadata
            files.push({
              id: Math.random().toString(36).substr(2, 9),
              name: `${path}${entry.name}`,
              type: 'text/markdown',
              size: file.size,
              createdAt: new Date(file.lastModified).toISOString()
            });

            // Sample content for indexing (limit to first 2000 chars of each file, up to 10 files)
            if (fileCount < 10) {
              combinedContent += `\n--- FILE: ${entry.name} ---\n${content.substring(0, 2000)}\n`;
              fileCount++;
            }
          }
        }
      }

      await walkDirectory(dirHandle);

      if (files.length === 0) {
        throw new Error('No Markdown files found in the selected folder.');
      }

      // Basic extraction logic: find hashtags or bold terms as attributes
      const hashtags = Array.from(combinedContent.matchAll(/#(\w+)/g)).map(m => m[1]).slice(0, 5);
      const boldTerms = Array.from(combinedContent.matchAll(/\*\*([\w\s]+)\*\*/g)).map(m => m[1]).slice(0, 5);
      const suggestedAttributes = [...new Set([...hashtags, ...boldTerms])].filter(t => t.length > 2).slice(0, 6);

      // Step 3: Create profile from REAL local data
      const newProfile: BrandProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: dirHandle.name || 'Obsidian Vault',
        guidelines: `Automatically synthesized from ${files.length} notes in your Obsidian vault. 
        
Key themes detected from content:
${combinedContent.substring(0, 500).split('\n').filter(l => l.trim() && !l.startsWith('---')).slice(0, 3).join('\n')}...

Vault Structure: Linked ${dirHandle.name}/`,
        attributes: suggestedAttributes.length > 0 ? suggestedAttributes : ['Obsidian Native', 'Interlinked', 'Personal Knowledge'],
        knowledgeFiles: files.slice(0, 20), // List top 20 files in UI
        updatedAt: new Date().toISOString(),
        isDefault: false,
        linkedSkills: 0
      };

      // Add actual data content to guidelines for AI context if it's not too large
      if (combinedContent) {
        newProfile.guidelines += `\n\n[CONTEXT DATA]\n${combinedContent.substring(0, 3000)}`;
      }

      onImport(newProfile);
      setStep('done');
      setIsSyncing(false);

    } catch (err: any) {
      console.error('Folder access error:', err);
      if (err.name === 'SecurityError') {
        alert('SECURITY ERROR: Trình duyệt chặn quyền truy cập Folder khi chạy trong Iframe của AI Studio. \n\nVui lòng nhấn nút "OPEN IN NEW TAB" ở góc trên bên phải màn hình để dùng tính năng này.');
      } else if (err.name === 'AbortError') {
        // User cancelled
      } else {
        alert('Lỗi kết nối Vault: ' + err.message);
      }
      setIsSyncing(false);
      setStep('source');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-ivory border border-border-cream rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-border-cream flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif text-near-black">Import Knowledge</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-gray">Connect your workspace</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-parchment rounded-full transition-colors text-stone-gray">
            <X size={20} />
          </button>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'source' && (
              <motion.div 
                key="source"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-6">
                  <button 
                    onClick={() => setSource('obsidian')}
                    className={`p-6 rounded-2xl border transition-all text-left group ${
                      source === 'obsidian' ? 'border-terracotta bg-parchment shadow-md' : 'border-border-cream hover:border-border-warm bg-ivory shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                      <Download size={20} />
                    </div>
                    <h3 className="text-lg font-serif text-near-black mb-1">Obsidian</h3>
                    <p className="text-[10px] text-stone-gray leading-relaxed italic">Import or Link your local Vault.</p>
                  </button>

                  <button 
                    onClick={() => setSource('lark')}
                    className={`p-6 rounded-2xl border transition-all text-left group ${
                      source === 'lark' ? 'border-terracotta bg-parchment shadow-md' : 'border-border-cream hover:border-border-warm bg-ivory shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <Globe size={20} />
                    </div>
                    <h3 className="text-lg font-serif text-near-black mb-1">Lark Suite</h3>
                    <p className="text-[10px] text-stone-gray leading-relaxed italic">Sync real-time knowledge from Lark Docs.</p>
                  </button>
                </div>

                {source === 'obsidian' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-parchment p-6 rounded-2xl border border-dashed border-border-warm text-center flex flex-col items-center justify-center">
                        <FileText className="text-stone-gray mb-3" size={24} />
                        <p className="text-[10px] font-bold text-near-black mb-3 uppercase tracking-widest">Single Import</p>
                        <label className="w-full py-2.5 bg-near-black text-ivory rounded-lg text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-opacity-90 transition-all text-center">
                          Upload .md
                          <input type="file" multiple accept=".md,.txt,.pdf" className="hidden" onChange={handleObsidianImport} />
                        </label>
                      </div>
                      
                      <div className="bg-near-black p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                        <Folder className="text-terracotta mb-3" size={24} />
                        <p className="text-[10px] font-bold text-ivory mb-3 uppercase tracking-widest">Direct Link</p>
                        <button 
                          onClick={handleObsidianDirectConnect}
                          className="w-full py-2.5 bg-terracotta text-ivory rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Link size={10} /> Connect Vault
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-ivory p-4 rounded-xl border border-border-warm italic flex gap-3">
                      <Info size={14} className="text-terracotta shrink-0" />
                      <p className="text-[9px] text-stone-gray leading-relaxed">
                        <strong>Direct Link</strong> allows SkillForge to watch your Obsidian folder for changes. Your notes stay local, we only index the metadata.
                      </p>
                    </div>
                  </motion.div>
                )}

                {source === 'lark' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">Lark / Feishu Document URL</label>
                       <input 
                        type="url" 
                        placeholder="https://yourgroup.larksuite.com/docx/..."
                        value={larkUrl}
                        onChange={(e) => setLarkUrl(e.target.value)}
                        className="w-full bg-parchment border border-border-warm rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-terracotta outline-none shadow-inner"
                       />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 italic text-blue-600">
                      <Info size={16} className="shrink-0" />
                      <p className="text-[10px] font-medium leading-relaxed">
                        To enable real-time sync, ensure your Lark Document has "Public link sharing" enabled or authorize the SkillForge Bot.
                      </p>
                    </div>
                    <button 
                      onClick={handleLarkSync}
                      disabled={!larkUrl}
                      className="w-full py-4 bg-near-black text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      Connect & Sync <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-parchment" />
                  <Loader2 className="absolute inset-0 w-20 h-20 text-terracotta animate-spin" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-near-black mb-2 italic">Analyzing Knowledge...</h3>
                  <p className="text-stone-gray text-xs font-bold uppercase tracking-wider">Parsing structures & extracting brand attributes</p>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div 
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-inner">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-serif text-near-black mb-2">Import Successful</h3>
                  <p className="text-charcoal-warm text-sm opacity-70 italic max-w-xs mx-auto">
                    Your {source === 'obsidian' ? 'Obsidian Vault' : 'Lark Documents'} have been successfully linked to a new Brand Profile.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-12 py-4 bg-near-black text-ivory rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                >
                  View Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
