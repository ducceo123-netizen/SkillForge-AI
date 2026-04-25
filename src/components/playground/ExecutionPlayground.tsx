import React, { useState } from 'react';
import { 
  Play, 
  Send, 
  Copy, 
  Save, 
  RefreshCw, 
  CheckCircle2,
  FileEdit,
  Clock,
  Sparkles,
  Info,
  Layers,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill, InputField, BrandProfile, Execution } from '../../types';
import { generateSkillContentStream } from '../../services/ai';

interface ExecutionPlaygroundProps {
  skill: Skill;
  profiles: BrandProfile[];
  onBack: () => void;
  onSaveExecution: (execution: Execution) => void;
}

export default function ExecutionPlayground({ skill, profiles, onBack, onSaveExecution }: ExecutionPlaygroundProps) {
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>(
    profiles.filter(p => p.isDefault).map(p => p.id) || (profiles[0] ? [profiles[0].id] : [])
  );
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const selectedProfiles = profiles.filter(p => selectedProfileIds.includes(p.id));

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setIsSaved(false);
    setOutput('');
    if (editorRef.current) editorRef.current.innerHTML = '';
    
    try {
      const stream = generateSkillContentStream(skill, inputData, selectedProfiles);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setOutput(fullText);
        if (editorRef.current) {
          // Convert markdown-ish newlines to <br> for the contentEditable area
          const html = fullText.replace(/\n/g, '<br>');
          editorRef.current.innerHTML = html;
        }
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      let errorMsg = 'Generation failed. Please check your API key or connection.';
      
      // If error has a message property, use it for more detail
      if (error && error.message) {
        errorMsg += ` Detail: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMsg += ` Detail: ${error}`;
      }
      
      setOutput(errorMsg);
      if (editorRef.current) editorRef.current.innerText = errorMsg;
    } finally {
      setIsGenerating(false);
    }
  };

  const execAction = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setOutput(editorRef.current.innerHTML);
    }
  };

  const handleSave = () => {
    const finalContent = editorRef.current ? editorRef.current.innerHTML : output;
    if (!finalContent) return;
    
    // Calculate simple stats
    const textOnly = editorRef.current ? editorRef.current.innerText : output;
    const words = textOnly.trim() ? textOnly.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));

    const execution: Execution = {
      id: Math.random().toString(36).substr(2, 9),
      skillId: skill.id,
      inputData: { ...inputData },
      output: finalContent,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      metadata: {
        model: skill.model || 'gemini-3-flash-preview',
        profilesUsed: selectedProfiles.map(p => p.name),
        temperature: skill.temperature,
        wordCount: words,
        readTime: readTime
      }
    };
    onSaveExecution(execution);
    setIsSaved(true);
  };

  const handleCopy = () => {
    const text = editorRef.current ? editorRef.current.innerText : output;
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-160px)]"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm pb-6 mb-8 border-b border-border-cream flex justify-between items-end">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-terracotta uppercase tracking-widest mb-2 hover:underline"
          >
            <ChevronLeft size={12} /> Back to Dashboard
          </button>
          <h1 className="text-5xl font-serif text-near-black leading-none">{skill.name}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">Active Voices ({selectedProfiles.length})</span>
            
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="bg-ivory border border-border-warm rounded-lg px-4 py-2 text-xs font-serif flex items-center gap-2 hover:border-terracotta transition-all shadow-sm"
            >
              <Layers size={14} className="text-terracotta" />
              {selectedProfiles.length === 0 ? 'Select Voices...' : 
               selectedProfiles.length === 1 ? selectedProfiles[0].name :
               `${selectedProfiles[0].name} +${selectedProfiles.length - 1} more`}
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-ivory border border-border-cream rounded-xl shadow-xl z-50 p-2 max-h-[300px] overflow-auto custom-scrollbar"
                >
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (selectedProfileIds.includes(p.id)) {
                          setSelectedProfileIds(selectedProfileIds.filter(id => id !== p.id));
                        } else {
                          setSelectedProfileIds([...selectedProfileIds, p.id]);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                        selectedProfileIds.includes(p.id) ? 'bg-parchment text-terracotta' : 'hover:bg-surface text-near-black'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-serif text-sm">{p.name}</span>
                        <span className="text-[9px] opacity-60 uppercase tracking-tighter">{p.attributes?.slice(0,2).join(', ')}</span>
                      </div>
                      {selectedProfileIds.includes(p.id) && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                  {profiles.length === 0 && <p className="p-4 text-xs italic text-center text-stone-gray">No profiles found</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-terracotta text-ivory font-medium px-8 py-3 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            Generate
          </button>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Input Form */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
          <div className="bg-ivory border border-border-cream rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-serif text-near-black mb-8 border-b border-border-cream pb-4">Input Parameters</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {skill.variables.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-charcoal-warm uppercase tracking-wider">{field.label}</label>
                  {field.type === 'long_text' ? (
                    <textarea 
                      placeholder={field.placeholder}
                      className="w-full bg-surface border border-border-warm rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow min-h-[120px] resize-none"
                      onChange={(e) => setInputData({ ...inputData, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      className="w-full bg-surface border border-border-warm rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow appearance-none cursor-pointer"
                      onChange={(e) => setInputData({ ...inputData, [field.name]: e.target.value })}
                    >
                      <option value="">Select option...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder={field.placeholder}
                      className="w-full bg-surface border border-border-warm rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow"
                      onChange={(e) => setInputData({ ...inputData, [field.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </form>
          </div>
        </div>

        {/* Right Column: Output Panel */}
        <div className="col-span-12 lg:col-span-7 flex flex-col min-h-0 bg-parchment rounded-xl border border-border-warm shadow-inner overflow-hidden">
          {/* RTF Toolbar */}
          <div className="bg-ivory border-b border-border-warm px-6 py-3 flex items-center gap-2">
            <button 
              onClick={() => execAction('bold')}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={() => execAction('italic')}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={() => execAction('underline')}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <Underline size={16} />
            </button>
            <div className="w-px h-5 bg-border-warm mx-1" />
            <button 
              onClick={() => execAction('insertUnorderedList')}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => execAction('insertOrderedList')}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <ListOrdered size={18} />
            </button>
            <div className="w-px h-5 bg-border-warm mx-1" />
            <button 
              onClick={() => {
                const url = prompt('Enter the link URL:');
                if (url) execAction('createLink', url);
              }}
              className="p-2 text-stone-gray hover:text-terracotta hover:bg-surface-dim rounded transition-all"
            >
              <LinkIcon size={16} />
            </button>
            
            <div className="ml-auto flex items-center gap-3">
              <AnimatePresence>
                {isSaved && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} /> Saved to History
                  </motion.span>
                )}
              </AnimatePresence>
              <button 
                onClick={handleSave}
                disabled={!output || isGenerating}
                className={`p-2 rounded transition-all ${output && !isGenerating ? 'text-stone-gray hover:text-terracotta' : 'text-stone-gray/30 cursor-not-allowed'}`}
                title="Save to History"
              >
                <Save size={18} />
              </button>
              <button 
                 onClick={handleCopy}
                 disabled={!output || isGenerating}
                 className={`p-2 rounded transition-all ${output && !isGenerating ? 'text-stone-gray hover:text-terracotta' : 'text-stone-gray/30 cursor-not-allowed'}`}
                 title="Copy to Clipboard"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {/* Insights Bar */}
            <AnimatePresence>
              {output && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-ivory border-b border-border-cream px-6 py-2 flex items-center gap-6"
                >
                  <div className="flex items-center gap-1.5">
                    <Type size={12} className="text-stone-gray" />
                    <span className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">
                      {output.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} Words
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-stone-gray" />
                    <span className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">
                      ~{Math.max(1, Math.ceil(output.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200))} Min Read
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Sparkles size={12} className="text-terracotta" />
                    <span className="text-[10px] font-bold text-terracotta uppercase tracking-widest">
                      Generated via {skill.model || 'Gemini 3'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              ref={editorRef}
              contentEditable={!isGenerating}
              onInput={(e) => setOutput(e.currentTarget.innerHTML)}
              className="flex-1 p-10 overflow-y-auto font-serif text-lg leading-relaxed text-charcoal-warm custom-scrollbar outline-none focus:ring-0 min-h-full"
              style={{ minHeight: '100%' }}
            />
            {!output && !isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-center max-w-sm mx-auto pointer-events-none">
                <FileEdit size={48} className="mb-6 text-stone-gray" strokeWidth={1} />
                <p className="text-xl italic px-8">
                  Configure your parameters on the left and click <strong>Generate</strong> to begin crafting the document.
                </p>
              </div>
            )}
            {isGenerating && (
              <div className="absolute bottom-10 right-10 flex items-center gap-2 bg-ivory/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border-cream shadow-sm text-[10px] font-bold uppercase tracking-widest text-terracotta animate-pulse">
                <RefreshCw size={12} className="animate-spin" /> Mixing editorial tones...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
