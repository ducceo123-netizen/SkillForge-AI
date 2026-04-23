import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Search, 
  ArrowRight,
  ExternalLink,
  Mail,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I create a multi-variable skill?", a: "Go to My Skills > New Skill. In the Variables section, you can add as many fields as needed. Use {{variable_name}} in your template to map them dynamically during execution." },
    { q: "What is the prompt limit?", a: "Each prompt can be up to 10,000 characters. For best results with Gemini, keep templates focused on specific editorial goals and provide clear context." },
    { q: "Can I use external data?", a: "Yes, via the Knowledge Base. Create a Brand Profile to ground your generations in specific guidelines or external context like PDFs and wikis." },
    { q: "How does the streaming work?", a: "Streaming allows you to see the AI response as it is being generated word-by-word. This reduces perceived waiting time and lets you start reading immediately." }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 pb-20"
    >
      {/* Search Header */}
      <div className="bg-near-black rounded-3xl p-16 text-center text-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h1 className="text-6xl font-serif mb-6 relative z-10">How can we help?</h1>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-gray" />
            <input 
              type="text" 
              placeholder="Search documentation, guides, or troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800/50 border border-stone-700 rounded-2xl pl-16 pr-6 py-5 text-lg outline-none focus:ring-2 focus:ring-terracotta/50 transition-all placeholder:text-stone-600"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Book, title: "Documentation", desc: "Detailed guides on prompt engineering, variables, and brand profiles.", link: "Go to Docs" },
          { icon: Zap, title: "Quick Tutorials", desc: "Short video walkthroughs for common editorial workflows.", link: "Watch Now" },
          { icon: MessageCircle, title: "Live Support", desc: "Chat with our support team for complex technical issues.", link: "Start Chat" }
        ].map((kit, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -5 }}
            className="bg-ivory border border-border-cream rounded-2xl p-8 hover:shadow-md transition-all group cursor-pointer"
          >
            <kit.icon className="text-terracotta mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-2xl font-serif text-near-black mb-3">{kit.title}</h3>
            <p className="text-charcoal-warm opacity-70 mb-6 text-sm leading-relaxed">{kit.desc}</p>
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-terracotta group-hover:gap-3 transition-all">
              {kit.link} <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="bg-parchment rounded-3xl p-12 space-y-10">
        <h2 className="text-4xl font-serif text-near-black text-center mb-12 italic border-b border-border-warm pb-6">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="bg-ivory rounded-xl border border-border-cream overflow-hidden">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-parchment/30 transition-colors"
              >
                <span className="font-serif font-bold text-near-black flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta" /> {faq.q}
                </span>
                {expandedFaq === idx ? <ChevronUp size={18} className="text-stone-gray" /> : <ChevronDown size={18} className="text-stone-gray" />}
              </button>
              <AnimatePresence>
                {expandedFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-10 pb-6 pt-2 text-charcoal-warm opacity-80 leading-relaxed text-sm">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="py-12 text-center text-stone-gray italic">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {/* Contact Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-ivory border border-border-cream rounded-2xl p-8 gap-6 shadow-sm">
        <div className="flex items-center gap-6 text-center md:text-left">
           <div className="p-4 bg-parchment rounded-full text-terracotta">
             <Mail size={24} />
           </div>
           <div>
             <h4 className="text-xl font-serif text-near-black">Still have questions?</h4>
             <p className="text-sm text-stone-gray font-medium">Contact us directly and we'll get back to you within 24 hours.</p>
           </div>
        </div>
        <button className="bg-near-black text-ivory px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-90 transition-all active:scale-[0.98]">
          Open Support Ticket
        </button>
      </div>
    </motion.div>
  );
}
