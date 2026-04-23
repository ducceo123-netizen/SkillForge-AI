import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Layers, 
  CheckCircle2,
  Clock,
  ChevronRight,
  Globe,
  Lock,
  BookOpen,
  X,
  PlusCircle,
  Edit3,
  Trash2,
  Quote,
  Mail,
  FileText,
  Settings,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandProfile, KnowledgeFile } from '../../types';
import { formatDate } from '../../lib/utils';
import { useRef } from 'react';
import ImportWizard from './ImportWizard';

interface KnowledgeBaseProps {
  profiles: BrandProfile[];
  searchQuery?: string;
  onSaveProfile: (profile: BrandProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export default function KnowledgeBase({ profiles, searchQuery = '', onSaveProfile, onDeleteProfile }: KnowledgeBaseProps) {
  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.guidelines.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedId, setSelectedId] = useState(filteredProfiles[0]?.id || profiles[0]?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<BrandProfile>>({});

  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedProfile = profiles.find(p => p.id === selectedId);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeletingId(id);
    try {
      onDeleteProfile(id);
      // Find the next profile to select before this one disappears
      const nextProfile = profiles.find(p => p.id !== id);
      setSelectedId(nextProfile?.id || null);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleSave = () => {
    if (selectedProfile || tempProfile.id) {
      const profileToSave = {
        ...(selectedProfile || {}),
        ...tempProfile,
        updatedAt: new Date().toISOString(),
      } as BrandProfile;
      
      onSaveProfile(profileToSave);
      setIsEditing(false);
      if (!selectedId) setSelectedId(profileToSave.id);
    }
  };

  const startEditing = () => {
    if (selectedProfile) {
      setTempProfile(selectedProfile);
      setIsEditing(true);
    }
  };

  const handleCreateNew = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newP: Partial<BrandProfile> = {
      id: newId,
      name: 'New Brand Profile',
      updatedAt: 'Now',
      isDefault: false,
      linkedSkills: 0,
      guidelines: 'Add brand guidelines here...',
      attributes: [],
      knowledgeFiles: []
    };
    setSelectedId(newId);
    setTempProfile(newP);
    setIsEditing(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple constraint: only small files for demo persistence in Firestore
    if (file.size > 500 * 1024) {
      alert('File is too large. Please upload files under 500KB.');
      return;
    }

    const newFile: KnowledgeFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: new Date().toISOString()
    };

    const currentFiles = tempProfile.knowledgeFiles || [];
    setTempProfile({ 
      ...tempProfile, 
      knowledgeFiles: [...currentFiles, newFile] 
    });
  };

  const handleRemoveFile = (fileId: string) => {
    const currentFiles = tempProfile.knowledgeFiles || [];
    setTempProfile({
      ...tempProfile,
      knowledgeFiles: currentFiles.filter(f => f.id !== fileId)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-cream pb-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest font-bold text-terracotta mb-4">Brand Directory</p>
          <h1 className="text-6xl font-serif text-near-black mb-4">Knowledge Base</h1>
          <p className="font-serif text-lg text-charcoal-warm italic opacity-80">
            Curated brand voices, stylistic guidelines, and reference materials. These profiles define the tonal parameters for generated content.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-warm-sand text-charcoal-warm rounded-xl py-4 px-6 border border-border-warm shadow-sm hover:bg-border-cream transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-widest"
          >
            <Download size={18} className="text-terracotta" />
            Import
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-near-black text-ivory rounded-xl py-4 px-8 shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-widest"
          >
            <Plus size={18} />
            New Profile
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isImportModalOpen && (
          <ImportWizard 
            onClose={() => setIsImportModalOpen(false)}
            onImport={(profile) => {
              onSaveProfile(profile);
              setSelectedId(profile.id);
            }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar: Profile List */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" size={16} />
            <input 
              type="text" 
              placeholder="Search brand profiles..."
              value={searchQuery}
              readOnly
              className="w-full bg-ivory border border-border-cream rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-1 focus:ring-focus-blue outline-none transition-shadow opacity-70 cursor-default"
            />
          </div>

          <div className="space-y-3">
            {filteredProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  setSelectedId(profile.id);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                  selectedId === profile.id 
                    ? 'bg-ivory border-terracotta shadow-md' 
                    : 'bg-ivory/50 border-border-cream hover:border-border-warm text-stone-gray hover:text-near-black outline-none'
                }`}
              >
                <div className="flex items-center gap-4">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} className="w-12 h-12 rounded-xl object-cover grayscale opacity-80" alt={profile.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-stone-gray">
                      <BookOpen size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-serif text-xl ${selectedId === profile.id ? 'text-near-black' : ''}`}>{profile.name}</h3>
                      {profile.isDefault && <CheckCircle2 size={14} className="text-terracotta" />}
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-stone-gray">Updated {formatDate(profile.updatedAt)}</p>
                  </div>
                </div>
              </button>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-border-warm rounded-2xl text-stone-gray italic px-6">
                <Search size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No brand profiles found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Content: Profile Details */}
        <div className="col-span-12 lg:col-span-8 bg-ivory border border-border-cream rounded-2xl p-10 shadow-sm relative min-h-[600px]">
          {(selectedProfile || isEditing) ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={isEditing ? 'editing' : selectedProfile?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                 <div className="flex justify-between items-start border-b border-border-cream pb-8">
                  <div className="flex gap-6 items-center flex-1">
                     {(isEditing ? tempProfile.logoUrl : selectedProfile?.logoUrl) && (
                       <img 
                        src={isEditing ? tempProfile.logoUrl : selectedProfile?.logoUrl} 
                        className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-border-warm" 
                        alt="" 
                       />
                     )}
                     <div className="flex-1">
                       {isEditing ? (
                         <input 
                           type="text" 
                           value={tempProfile.name || ''}
                           onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                           className="text-4xl font-serif text-near-black mb-2 bg-transparent border-b border-terracotta outline-none w-full"
                           placeholder="Enter brand name..."
                         />
                       ) : (
                         <h2 className="text-4xl font-serif text-near-black mb-2">{selectedProfile?.name}</h2>
                       )}
                       <div className="flex gap-4 items-center text-stone-gray text-xs font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Layers size={14} /> {(isEditing ? tempProfile.linkedSkills : selectedProfile?.linkedSkills) || 0} Linked Skills</span>
                         <span className="w-1 h-1 bg-border-warm rounded-full" />
                         <span className="flex items-center gap-1.5"><Clock size={14} /> Last sync {formatDate(isEditing ? tempProfile.updatedAt : selectedProfile?.updatedAt)}</span>
                       </div>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} className="bg-terracotta text-ivory px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="bg-surface-container px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-stone-gray hover:bg-border-cream transition-all">Cancel</button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={startEditing}
                          className="p-3 border border-border-warm rounded-xl text-stone-gray hover:text-terracotta hover:bg-parchment transition-all shadow-sm"
                        >
                          <Settings size={20} />
                        </button>
                        <button 
                          onClick={() => selectedProfile && handleDelete(selectedProfile.id)}
                          disabled={isDeleting}
                          className={`p-3 border border-border-warm rounded-xl transition-all shadow-sm ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : 'text-stone-gray hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {isDeleting && deletingId === selectedProfile?.id ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-near-black uppercase tracking-widest border-b border-border-cream pb-2 mb-4">Brand Voice Guidelines</h3>
                    {isEditing ? (
                      <textarea 
                        value={tempProfile.guidelines || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, guidelines: e.target.value })}
                        className="w-full bg-parchment border border-border-warm rounded-2xl p-8 text-lg font-serif leading-relaxed min-h-[350px] outline-none focus:ring-1 focus:ring-terracotta shadow-inner"
                        placeholder="Define the voice, tone, and formatting rules..."
                      />
                    ) : (
                      <div className="font-serif text-2xl leading-relaxed text-charcoal-warm italic opacity-95 p-10 bg-parchment rounded-2xl border border-border-warm shadow-inner">
                        "{selectedProfile?.guidelines}"
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-surface-container/20 p-8 rounded-2xl border border-border-warm">
                        <h3 className="text-[10px] font-bold text-stone-gray uppercase tracking-widest mb-6">Core Attributes</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {(isEditing ? (tempProfile.attributes || []) : (selectedProfile?.attributes || [])).map((tag, idx) => (
                            <span key={`${tag}-${idx}`} className="px-4 py-2 bg-ivory border border-border-warm rounded-full text-xs font-medium text-near-black shadow-sm flex items-center gap-2">
                              {tag}
                              {isEditing && (
                                <button 
                                  onClick={() => {
                                    const newAttrs = (tempProfile.attributes || []).filter((_, i) => i !== idx);
                                    setTempProfile({ ...tempProfile, attributes: newAttrs });
                                  }}
                                  className="text-terracotta hover:text-near-black"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </span>
                          ))}
                          {!(isEditing ? tempProfile.attributes : selectedProfile?.attributes)?.length && !isEditing && (
                            <span className="text-xs italic text-stone-gray opacity-60">No attributes defined</span>
                          )}
                        </div>
                        
                        {isEditing && (
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Add attribute..."
                              className="flex-1 bg-ivory border border-border-cream rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-terracotta"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = e.currentTarget.value.trim();
                                  if (val) {
                                    const currentAttrs = tempProfile.attributes || [];
                                    if (!currentAttrs.includes(val)) {
                                      setTempProfile({ ...tempProfile, attributes: [...currentAttrs, val] });
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }
                              }}
                            />
                            <button 
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                const val = input.value.trim();
                                if (val) {
                                  const currentAttrs = tempProfile.attributes || [];
                                  if (!currentAttrs.includes(val)) {
                                    setTempProfile({ ...tempProfile, attributes: [...currentAttrs, val] });
                                    input.value = '';
                                  }
                                }
                              }}
                              className="px-3 py-2 bg-near-black text-ivory rounded-lg text-[10px] font-bold uppercase tracking-widest"
                            >
                              Add
                            </button>
                          </div>
                        )}
                     </div>
                     
                     <div className="bg-near-black rounded-2xl p-8 text-ivory">
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-[10px] font-bold text-stone-gray/60 uppercase tracking-widest">Internal Knowledge Files</p>
                          {isEditing && (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[10px] font-bold text-terracotta hover:underline uppercase tracking-widest flex items-center gap-1"
                            >
                              <Plus size={12} /> Add File
                            </button>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </div>
                        
                        <div className="space-y-4 max-h-[160px] overflow-y-auto custom-scrollbar">
                          {(isEditing ? (tempProfile.knowledgeFiles || []) : (selectedProfile?.knowledgeFiles || [])).map(file => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl group/file">
                              <div className="flex items-center gap-3">
                                {file.type.includes('pdf') ? (
                                  <FileText size={14} className="text-terracotta" />
                                ) : (
                                  < Globe size={14} className="text-stone-gray" />
                                )}
                                <div className="flex flex-col">
                                   <span className="text-xs font-medium truncate max-w-[120px]">{file.name}</span>
                                   <span className="text-[9px] text-stone-500 uppercase tracking-tighter">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <button 
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="text-stone-500 hover:text-red-400 p-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                ) : (
                                  <ExternalLink size={12} className="text-stone-gray cursor-pointer hover:text-ivory" />
                                )}
                              </div>
                            </div>
                          ))}
                          {!(isEditing ? tempProfile.knowledgeFiles : selectedProfile?.knowledgeFiles)?.length && (
                            <div className="py-8 text-center border border-dashed border-stone-800 rounded-xl">
                               <p className="text-[10px] italic text-stone-500">No knowledge files attached</p>
                            </div>
                          )}
                        </div>
                        
                        {isEditing && (
                           <div className="mt-6 pt-4 border-t border-stone-800">
                             <p className="text-[9px] text-stone-500 leading-relaxed italic">
                               Files are securely stored and used to train the AI on your specific brand context. (Max 500KB per file)
                             </p>
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <BookOpen size={48} strokeWidth={1} />
              <p className="mt-4 italic font-serif">Select or create a brand profile to manage guidelines</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
