import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Clock,
  ShieldCheck,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        onLogin(result.user.email);
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let msg = 'Google sign-in failed.';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Popup blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console. Please add your current domain to Authorized Domains.';
      } else {
        msg = `Login error: ${err.message || 'Please check your connection.'}`;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // For this app, we'll focus on Google Sign-in mainly but simulate simple login here
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email || 'ducceo123@gmail.com');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left Panel: Brand */}
      <div className="hidden lg:flex w-1/2 bg-near-black flex-col p-16 justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/20 to-transparent opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-ivory mb-8">
            <Sparkles size={32} className="text-terracotta" fill="currentColor" />
            <span className="text-4xl font-serif italic border-l border-ivory/20 pl-4">SkillForge</span>
          </div>
          <h1 className="text-7xl font-serif text-ivory leading-tight mb-8">
            Build AI Skills <br />
            <span className="text-stone-gray italic">that know your brand.</span>
          </h1>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { icon: Layers, title: 'Skill Builder', desc: 'Craft custom workflows tailored to your guidelines.' },
            { icon: Sparkles, title: 'Execution Playground', desc: 'Run and refine AI output in real-time.' },
            { icon: Clock, title: 'History Log', desc: 'Track performance and iterate on every generation.' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex items-start gap-4 group"
            >
              <div className="bg-dark-surface p-3 rounded-lg text-terracotta group-hover:bg-terracotta group-hover:text-ivory transition-all">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-serif text-ivory">{feature.title}</h3>
                <p className="text-sm text-stone-gray leading-relaxed max-w-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-stone-gray text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Enterprise-grade AI orchestration
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-ivory rounded-2xl border border-border-cream p-10 shadow-xl"
        >
          <div className="text-center mb-10">
             <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <Sparkles size={24} className="text-terracotta" fill="currentColor" />
              <span className="text-2xl font-serif italic border-l border-near-black/20 pl-3">SkillForge</span>
            </div>
            <h2 className="text-4xl font-serif text-near-black mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-charcoal-warm font-serif italic">
              {isLogin ? 'Continue your AI editorial journey.' : 'Start building your first AI skill today.'}
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-near-black text-ivory rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Chrome size={18} />
              Sign in with Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border-cream" />
              <span className="text-[10px] font-bold text-stone-gray uppercase tracking-widest">or email</span>
              <div className="flex-1 h-px bg-border-cream" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-gray ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" size={16} />
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full pl-12 pr-4 py-3 bg-parchment border border-border-warm rounded-xl focus:ring-1 focus:ring-focus-blue outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-gray ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" size={16} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-parchment border border-border-warm rounded-xl focus:ring-1 focus:ring-focus-blue outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-gray">Password</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-terracotta hover:underline">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-parchment border border-border-warm rounded-xl focus:ring-1 focus:ring-focus-blue outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 text-center font-bold">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-terracotta text-ivory py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          <div className="mt-10 pt-10 border-t border-border-cream text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-stone-gray hover:text-terracotta transition-colors text-sm font-serif italic"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
