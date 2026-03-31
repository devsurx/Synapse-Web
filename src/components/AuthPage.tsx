import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, Database, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string) => void;
}

export default function AuthPage({ onLogin }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      // In a real Firebase setup, you'd call signInWithEmailAndPassword here
      onLogin(username.trim().toLowerCase());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020203] p-6"
    >
      {/* Visual background element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#96AD8D]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative z-10 shadow-2xl"
      >
        <header className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-[#96AD8D]/10 text-[#96AD8D] mb-6 shadow-[0_0_20px_rgba(150,173,141,0.1)]">
            {isSignUp ? <Sparkles size={32} /> : <Database size={32} />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {isSignUp ? "Create Neural Link" : "Neural Link"}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {isSignUp ? "Registering New Synapse" : "Initialize Session"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              required 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-[#96AD8D]/40 transition-all text-white placeholder:text-zinc-600" 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              required 
              type="password" 
              placeholder="Access Code" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-[#96AD8D]/40 transition-all text-white placeholder:text-zinc-600" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#96AD8D] text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all mt-4"
          >
            {isSignUp ? "Create Account" : "Initialize Sync"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#96AD8D] transition-colors"
          >
            {isSignUp ? "Already have a link? Sign In" : "Need a new link? Create One"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}