import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  LogOut, 
  Bell, 
  Globe,
  Settings,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfilePageProps {
  userEmail: string;
  profileImage: string;
  fullName: string;
  jobTitle: string;
  onUpdateProfileData: (data: { fullName: string, jobTitle: string, profileImage: string }) => void;
  onLogout: () => void;
}

export default function ProfilePage({ userEmail, profileImage, fullName: initialFullName, jobTitle: initialJobTitle, onUpdateProfileData, onLogout }: ProfilePageProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [fullName, setFullName] = useState(initialFullName);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [currentImage, setCurrentImage] = useState(profileImage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCurrentImage(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfileData({
        fullName,
        jobTitle,
        profileImage: currentImage
      });
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      <div className="border-b border-border-cream pb-8">
        <h1 className="text-5xl font-serif text-near-black mb-2">Account Settings</h1>
        <p className="font-serif text-lg text-charcoal-warm italic opacity-80">
          Manage your identity, security, and preferences on SkillForge.io.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Profile Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-ivory border border-border-cream rounded-2xl p-8 text-center flex flex-col items-center">
             <div className="relative group mb-6 cursor-pointer" onClick={handleImageClick}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-parchment shadow-md">
                  <img 
                    src={currentImage} 
                    className="w-full h-full object-cover"
                    alt="User Avatar"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera size={24} className="text-white" />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-terracotta text-ivory rounded-full shadow-lg">
                  <Camera size={16} />
                </button>
             </div>
             <h3 className="text-2xl font-serif text-near-black mb-1">{fullName}</h3>
             <p className="text-sm text-stone-gray mb-6">{userEmail}</p>
             <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-border-warm rounded-lg text-sm font-bold text-stone-gray hover:text-red-500 hover:border-red-200 transition-all"
             >
               <LogOut size={16} /> Sign Out
             </button>
          </div>

          <div className="bg-near-black rounded-2xl p-8 text-ivory">
             <h4 className="text-[10px] font-bold text-stone-gray uppercase tracking-widest mb-4">Subscription</h4>
             <div className="flex justify-between items-end mb-4">
               <div>
                 <p className="text-2xl font-serif">Pro Plan</p>
                 <p className="text-xs text-stone-gray">$29/month • Auto-renews</p>
               </div>
               <span className="px-2 py-1 bg-terracotta/20 text-terracotta rounded text-[9px] font-bold uppercase tracking-widest border border-terracotta/30">Active</span>
             </div>
             <button className="w-full py-2 bg-stone-800 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-stone-700 transition-all">Manage Billing</button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-ivory border border-border-cream rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-4 bg-parchment border-b border-border-cream flex items-center gap-2">
              <User size={16} className="text-terracotta" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-near-black">Personal Information</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-parchment border border-border-warm rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-terracotta" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-parchment border border-border-warm rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-terracotta" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">Email Address</label>
                <input type="email" value={userEmail} disabled className="w-full bg-surface-dim border border-border-cream rounded-xl px-4 py-2.5 text-sm text-stone-gray opacity-70" />
              </div>
            </div>
          </section>

          <section className="bg-ivory border border-border-cream rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-4 bg-parchment border-b border-border-cream flex items-center gap-2">
              <Shield size={16} className="text-terracotta" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-near-black">Security & Preferences</h3>
            </div>
            <div className="p-8 space-y-6">
               <div className="flex items-center justify-between py-4 border-b border-border-warm">
                 <div>
                   <h4 className="text-sm font-bold text-near-black">Two-Factor Authentication</h4>
                   <p className="text-xs text-stone-gray">Add an extra layer of security to your account.</p>
                 </div>
                 <button 
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${is2FAEnabled ? 'bg-terracotta' : 'bg-border-warm'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${is2FAEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
               </div>
               <div className="py-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h4 className="text-sm font-bold text-near-black">API Access Tokens</h4>
                     <p className="text-xs text-stone-gray">Manage keys for external integration.</p>
                   </div>
                   <button 
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="text-xs font-bold uppercase tracking-widest text-terracotta flex items-center gap-1"
                   >
                     {showApiKeys ? 'Hide Keys' : 'View Keys'} <Key size={14} />
                   </button>
                 </div>
                 
                 <AnimatePresence>
                   {showApiKeys && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 bg-parchment border border-border-warm rounded-xl p-4 overflow-hidden"
                     >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-stone-gray uppercase tracking-widest">Production Key</span>
                          <span className="text-[10px] text-near-black font-mono">sk_live_••••••••••••4281</span>
                        </div>
                        <button className="text-[9px] font-bold text-terracotta uppercase hover:underline">Regenerate Key</button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-6 text-right">
            {saveMessage && <span className="text-xs font-medium text-green-600 animate-pulse">{saveMessage}</span>}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 bg-terracotta text-ivory rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed scale-95' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
