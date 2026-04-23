import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Save, 
  PlusCircle, 
  Trash2, 
  GripVertical,
  Search,
  ChevronDown,
  Settings,
  Eye,
  Info,
  X,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skill, InputField } from '../../types';

interface SkillBuilderProps {
  initialSkill?: Skill;
  onSave: (skill: Skill) => void;
  onCancel: () => void;
}

export default function SkillBuilder({ initialSkill, onSave, onCancel }: SkillBuilderProps) {
  const [skill, setSkill] = useState<Skill>(initialSkill || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    description: '',
    systemPromptTemplate: '',
    variables: [],
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    runCount: 0
  });

  const addVariable = () => {
    const newVar: InputField = {
      id: Math.random().toString(36).substr(2, 9),
      name: `field_${skill.variables.length + 1}`,
      label: 'New Variable',
      type: 'short_text',
      required: true
    };
    setSkill({ ...skill, variables: [...skill.variables, newVar] });
  };

  const removeVariable = (id: string) => {
    setSkill({ ...skill, variables: skill.variables.filter(v => v.id !== id) });
  };

  const updateVariable = (id: string, updates: Partial<InputField>) => {
    setSkill({ 
      ...skill, 
      variables: skill.variables.map(v => v.id === id ? { ...v, ...updates } : v) 
    });
  };

  const handleSave = () => {
    if (!skill.name) return alert('Skill name is required');
    onSave(skill);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      {/* Builder Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border-cream pb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-gray mb-4">
            <span onClick={onCancel} className="hover:text-terracotta cursor-pointer flex items-center gap-1">
              <ChevronLeft size={14} /> My Skills
            </span>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-near-black">{initialSkill ? 'Edit Skill' : 'New Skill'}</span>
          </nav>
          <h1 className="text-6xl font-serif text-near-black">{initialSkill ? 'Edit Skill' : 'Skill Builder'}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 bg-warm-sand text-charcoal-warm rounded-lg text-sm font-bold shadow-sm hover:bg-border-cream transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-terracotta text-ivory rounded-lg text-sm font-bold shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Save size={16} />
            {initialSkill ? 'Save Changes' : 'Publish Skill'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left: Configuration Steps */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          {/* Step 1: Basic Info */}
          <section className="bg-ivory border border-border-cream rounded-xl p-8 shadow-sm space-y-8">
            <h2 className="text-3xl font-serif text-near-black border-b border-border-cream pb-4">Basic Information</h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-charcoal-warm uppercase tracking-wider">Skill Name <span className="text-terracotta">*</span></label>
                <input 
                  type="text" 
                  value={skill.name}
                  onChange={(e) => setSkill({ ...skill, name: e.target.value })}
                  placeholder="e.g. Executive Summary Generator"
                  className="w-full bg-parchment border border-border-warm rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-charcoal-warm uppercase tracking-wider">Description</label>
                <textarea 
                  value={skill.description}
                  onChange={(e) => setSkill({ ...skill, description: e.target.value })}
                  placeholder="What does this skill achieve? Who is it for?"
                  className="w-full bg-parchment border border-border-warm rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow min-h-[80px] resize-none"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Variables */}
          <section className="bg-ivory border border-border-cream rounded-xl p-8 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-border-cream pb-4">
              <h2 className="text-3xl font-serif text-near-black">Input Variables</h2>
              <button 
                onClick={addVariable}
                className="text-terracotta hover:opacity-80 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <PlusCircle size={18} /> Add Variable
              </button>
            </div>
            
            <div className="space-y-4">
              {skill.variables.map((field) => (
                <div key={field.id} className="flex gap-4 items-start bg-parchment p-5 rounded-xl border border-border-warm group relative hover:border-terracotta/30 transition-all">
                   <div className="cursor-grab text-stone-gray/40 group-hover:text-stone-gray pt-1"><GripVertical size={20} /></div>
                   <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-4 space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-stone-gray/80">Key (Internal)</label>
                        <input 
                          type="text" 
                          value={field.name}
                          onChange={(e) => updateVariable(field.id, { name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-ivory border border-border-cream rounded font-mono text-xs text-near-black outline-none" 
                        />
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-stone-gray/80">Type</label>
                        <select 
                          value={field.type}
                          onChange={(e) => updateVariable(field.id, { type: e.target.value as any })}
                          className="w-full px-3 py-1.5 bg-ivory border border-border-cream rounded text-[11px] font-bold text-charcoal-warm outline-none appearance-none cursor-pointer"
                        >
                          <option value="short_text">Short Text</option>
                          <option value="long_text">Long Text</option>
                          <option value="select">Dropdown</option>
                        </select>
                      </div>
                      <div className="col-span-5 space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-stone-gray/80">Label (Public)</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => updateVariable(field.id, { label: e.target.value })}
                          className="w-full px-3 py-1.5 bg-ivory border border-border-cream rounded text-[11px] font-bold text-near-black outline-none" 
                        />
                      </div>
                      
                      {field.type === 'select' && (
                        <div className="col-span-12 mt-2 pt-2 border-t border-border-cream/50 space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-stone-gray/80 flex items-center gap-2">
                             Dropdown Options (comma separated) <Info size={12} className="text-stone-gray/40" />
                          </label>
                          <input 
                            type="text" 
                            placeholder="Option 1, Option 2, Option 3"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateVariable(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="w-full px-3 py-2 bg-ivory border border-border-cream rounded text-xs text-near-black outline-none italic placeholder:opacity-40" 
                          />
                        </div>
                      )}
                   </div>
                   <button 
                    onClick={() => removeVariable(field.id)}
                    className="text-stone-gray/30 hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all pt-7"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3: Prompt architecture */}
          <section className="bg-ivory border border-border-cream rounded-xl p-8 shadow-sm flex flex-col min-h-[400px] space-y-6">
            <h2 className="text-3xl font-serif text-near-black border-b border-border-cream pb-4">Prompt Template</h2>
            <div className="flex-1 flex flex-col bg-near-black rounded-xl border border-stone-800 overflow-hidden shadow-xl">
              <div className="bg-[#1e1e1e] px-6 py-3 border-b border-stone-800 flex justify-between items-center">
                <span className="font-mono text-[11px] text-stone-500 font-bold uppercase tracking-widest">system_prompt.txt</span>
                <div className="flex gap-2">
                  {skill.variables.map(v => (
                    <button 
                      key={v.id}
                      onClick={() => setSkill({ ...skill, systemPromptTemplate: skill.systemPromptTemplate + ` {{${v.name}}}` })}
                      className="text-stone-400 hover:text-ivory px-2 py-1 rounded bg-stone-800 text-[9px] font-bold uppercase tracking-widest transition-all"
                    >
                      +{v.name}
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                value={skill.systemPromptTemplate}
                onChange={(e) => setSkill({ ...skill, systemPromptTemplate: e.target.value })}
                className="w-full flex-1 p-8 bg-transparent border-none text-ivory font-mono text-sm leading-relaxed resize-none focus:ring-0 selection:bg-terracotta/30"
                placeholder="Act as a professional copy editor. Use {{variable_name}} to inject user inputs."
              />
            </div>
          </section>
        </div>

        {/* Right: Live Preview */}
        <aside className="col-span-12 lg:col-span-5 sticky top-24 self-start">
          <div className="bg-parchment rounded-xl border border-border-warm overflow-hidden shadow-inner flex flex-col min-h-[600px]">
            <div className="bg-ivory px-6 py-4 border-b border-border-warm flex justify-between items-center">
              <h3 className="font-serif font-bold text-xl text-near-black flex items-center gap-2">
                <Eye size={18} className="text-terracotta" /> Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-gray">Interactive</span>
              </div>
            </div>
            
            <div className="p-8 space-y-8 flex-1">
              <div className="bg-ivory border border-border-cream rounded-xl p-6 shadow-sm">
                <h4 className="text-xl font-serif text-near-black mb-6">{skill.name || 'Untitled Skill'}</h4>
                <div className="space-y-4">
                  {skill.variables.map(v => (
                    <div key={v.id} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">{v.label}</label>
                      {v.type === 'select' ? (
                        <div className="w-full px-4 py-3 bg-parchment border border-border-warm rounded-lg text-near-black text-sm font-medium flex justify-between items-center">
                          <span>{v.options?.[0] || 'Select option...'}</span>
                          <ChevronDown size={14} className="text-stone-gray" />
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-parchment border border-border-warm rounded-lg text-stone-gray/40 text-sm italic">
                          {v.type === 'long_text' ? 'Long text input preview...' : 'Enter value...'}
                        </div>
                      )}
                    </div>
                  ))}
                  {skill.variables.length === 0 && (
                    <div className="py-12 border border-dashed border-border-warm rounded-lg flex flex-col items-center justify-center text-stone-gray opacity-40">
                      <Info size={24} className="mb-2" />
                      <p className="text-xs italic">Define variables to see input preview</p>
                    </div>
                  )}
                  <button className="w-full py-2.5 bg-warm-sand text-charcoal-warm rounded-lg text-xs font-bold uppercase tracking-widest cursor-not-allowed opacity-50 mt-4">
                    Run Skill
                  </button>
                </div>
              </div>

               <div className="pt-8 border-t border-border-warm/50">
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-gray/60 mb-4 flex items-center gap-1.5">
                  <Info size={12} /> Prompt Compilation Trace
                </p>
                <div className="bg-near-black p-6 rounded-xl font-mono text-[11px] leading-relaxed text-stone-500 border border-stone-800 shadow-md">
                   {skill.systemPromptTemplate.split(/(\{\{.*?\}\})/).map((part, i) => (
                     part.startsWith('{{') ? <span key={i} className="text-terracotta bg-terracotta/10 px-1 rounded">{part}</span> : part
                   )) || 'Start typing in the prompt area to see preview trace...'}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
