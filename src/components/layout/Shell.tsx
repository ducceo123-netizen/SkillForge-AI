import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Sparkles, 
  BookOpen, 
  History, 
  Settings, 
  Plus, 
  Bell, 
  HelpCircle,
  Search,
  Menu,
  ChevronRight,
  X,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'skills', label: 'My Skills', icon: Sparkles },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'history', label: 'Execution History', icon: History },
];

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  profileImage: string;
  orgId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: string) => void;
  onCreateAction: () => void;
}

export default function Shell({ children, activeTab, profileImage, orgId, searchQuery, onSearchChange, onTabChange, onCreateAction }: ShellProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to SkillForge', message: 'You can now start building your custom AI editorial tools.', time: 'Just now', read: false },
    { id: 2, title: 'Beta Access Granted', message: 'You have unlimited runs for the next 24 hours.', time: '1h ago', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-8 z-50 bg-ivory border-b border-border-cream shadow-sm">
        <div className="flex items-center gap-4">
          <span 
            onClick={() => onTabChange('dashboard')}
            className="text-2xl font-serif italic font-bold text-near-black cursor-pointer hover:text-terracotta transition-colors"
          >
            SkillForge.io
          </span>
          <div className="h-6 w-px bg-border-warm mx-2 hidden md:block" />
          <span className="font-sans text-[10px] font-bold text-stone-gray hidden md:block uppercase tracking-widest">{orgId.replace('-org', '')} Workspace</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-parchment border border-border-cream rounded-full text-sm focus:ring-1 focus:ring-focus-blue outline-none w-48 transition-all focus:w-64"
            />
          </div>
          
          <div className="flex items-center gap-4 text-charcoal-warm h-10">
            <div className="relative h-10 flex items-center">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-parchment hover:text-terracotta transition-all relative ${showNotifications ? 'bg-parchment text-terracotta' : ''}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-terracotta text-ivory text-[8px] flex items-center justify-center rounded-full font-bold ring-2 ring-ivory">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-ivory border border-border-cream rounded-2xl shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-4 bg-parchment border-b border-border-cream flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-near-black">Notifications</h4>
                      <button onClick={markAllRead} className="text-[9px] font-bold text-terracotta uppercase tracking-tighter hover:underline">Clear all</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-border-warm hover:bg-parchment/50 transition-colors cursor-default ${!n.read ? 'bg-terracotta/[0.03]' : ''}`}>
                          <div className="flex gap-3">
                             {!n.read && <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />}
                             <div className="flex-1">
                               <p className="text-xs font-bold text-near-black mb-0.5">{n.title}</p>
                               <p className="text-[11px] text-stone-gray leading-relaxed mb-1.5">{n.message}</p>
                               <span className="text-[9px] font-medium text-stone-gray/60">{n.time}</span>
                             </div>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center text-stone-gray/30">
                            <Bell size={24} />
                          </div>
                          <p className="text-stone-gray text-xs italic">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => onTabChange('support')}
              className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-parchment hover:text-terracotta transition-all ${activeTab === 'support' ? 'bg-parchment text-terracotta' : ''}`}
            >
              <HelpCircle size={20} />
            </button>
            <div className="h-6 w-px bg-border-warm mx-1 hidden sm:block" />
            <button 
              onClick={() => onTabChange('profile')}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === 'profile' ? 'p-0.5 border-2 border-terracotta' : 'p-0 hover:bg-parchment'}`}
            >
              <div className="w-8 h-8 rounded-full border border-border-cream overflow-hidden shadow-sm">
                <img 
                  src={profileImage} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] bg-ivory border-r border-border-cream p-4 gap-2 fixed left-0 top-16 z-40">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-terracotta border border-border-warm">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-near-black leading-tight">Workspace</h2>
              <p className="text-xs font-medium text-stone-gray">Editorial AI</p>
            </div>
          </div>

          <button 
            onClick={onCreateAction}
            className="mb-6 bg-terracotta text-ivory rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium text-sm shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            New Skill
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all active:scale-[0.98] ${
                  activeTab === item.id 
                    ? 'text-terracotta font-bold bg-surface-container shadow-sm' 
                    : 'text-stone-gray hover:text-terracotta hover:bg-surface-container/50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-serif tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-stone-gray hover:text-terracotta hover:bg-surface-container/50 w-full transition-all">
              <Settings size={20} />
              <span className="font-serif tracking-tight">Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-8 min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
