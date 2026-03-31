import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { 
  Leaf, RotateCcw, Send, Loader2, Brain, 
  ShieldCheck, Settings, X, Rocket, LogOut,
  Music, Play, SkipForward, SkipBack, Volume2,
  Lock, User, ArrowRight, Database, Sparkles,
  Paperclip, FileText, CheckCircle2
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { playPulse, playComplete } from './utils/sound'; 

// --- CONFIG & CONSTANTS ---
// Remember to replace with your actual API key
const genAI = new GoogleGenerativeAI("AIzaSyCNccysbGA0KykT-gLX-C_Yl7nN5y1Md0E");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const RANKS = ["Initiate", "Observer", "Acolyte", "Scribe", "Sentinel", "Warden", "Scholar", "Adept", "Magus", "Architect", "Strategist", "Luminary", "Viscount", "Exarch", "High-Seer", "Grand-Master", "Oracle", "Sovereign", "Ethereal", "Nova", "Supernova", "Quasar", "Pulsar", "Singularity", "Void-Walker", "Star-Child", "Cosmic-Mind", "Eternal", "Zenith", "The Synapse"];

// --- ADVANCED COSMOS ENGINE ---
const generateDeepSpace = (variants: string[], count: number = 250) => {
  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      color: variants[Math.floor(Math.random() * variants.length)],
      depth: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() > 0.6,
      twinkleDur: 2 + Math.random() * 4
    });
  }
  return elements;
};

// --- AUTH PAGE COMPONENT ---
function AuthPage({ onLogin }: { onLogin: (user: string) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) onLogin(username.trim().toLowerCase());
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#020203] p-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative z-10 shadow-2xl"
      >
        <header className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-[#96AD8D]/10 text-[#96AD8D] mb-6">
            {isSignUp ? <Sparkles size={32} /> : <Database size={32} />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{isSignUp ? "Create Link" : "Neural Link"}</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Initialize Session</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input required type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-[#96AD8D]/40 transition-all text-white" />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input required type="password" placeholder="Access Code" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-[#96AD8D]/40 transition-all text-white" />
          </div>
          <button type="submit" className="w-full bg-[#96AD8D] text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all">
            {isSignUp ? "Establish Connection" : "Initialize Sync"} <ArrowRight size={16} />
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-8 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#96AD8D] transition-colors">
          {isSignUp ? "Existing Link? Sign In" : "New Neuron? Create Link"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// --- MAIN APPLICATION ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('synapse_active_user'));
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({ focus: 25, short: 5, long: 15 });
  const [seconds, setSeconds] = useState(config.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [activeAI, setActiveAI] = useState<'ELI5' | 'Flashcards' | 'Test' | 'Planner'>('ELI5');
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState(0);
  
  // File Upload State
  const [attachedFile, setAttachedFile] = useState<{name: string, data: any, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chat, setChat] = useState<{role: 'u' | 'a', t: string}[]>([{
    role: 'a', 
    t: "Neural Link established. I am your Synapse AI. I monitor your progress and can assist you with:\n\n• ELI5: Explaining complex topics simply.\n• Flashcards: Generating study materials (Upload a file to generate from notes!).\n• Test: Quizzing your knowledge.\n• Planner: Organizing your study sessions.\n\nSelect a mode above and issue a command or upload a file to begin."
  }]);

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`synapse_data_${user}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPoints(parsed.points || 0);
        setConfig(parsed.config || { focus: 25, short: 5, long: 15 });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem(`synapse_data_${user}`, JSON.stringify({ points, config }));
  }, [points, config, user]);

  const rank = useMemo(() => {
    const level = Math.min(Math.floor(Math.pow(points / 200, 0.7)), 29);
    return { title: RANKS[level], level: level + 1 };
  }, [points]);

  useEffect(() => { if (!isActive) setSeconds(config[mode] * 60); }, [config, mode, isActive]);

  // Proactive AI Function
  const triggerProactiveAI = async (type: 'finish' | 'motivate') => {
    setIsTyping(true);
    try {
      const prompt = type === 'finish' 
        ? "The user just successfully finished a focus timer session. Give them a short, 1-2 sentence positive reinforcement message congratulating their discipline."
        : "The user just paused their focus timer before it finished. Give them a short, gentle 1-sentence motivational nudge to resume their work.";
      const res = await model.generateContent(prompt);
      setChat(p => [...p, { role: 'a', t: res.response.text() }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    let it: any;
    if (isActive && seconds > 0) {
      it = setInterval(() => {
        setSeconds(s => s - 1);
        setPoints(p => p + (0.2 * rank.level));
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setPoints(p => p + 500);
      try { playComplete(); } catch(e){}
      triggerProactiveAI('finish');
    }
    return () => clearInterval(it);
  }, [isActive, seconds, rank.level]);

  const toggleTimer = () => {
    // If pausing and they have worked for at least 30 seconds
    if (isActive && seconds < (config[mode] * 60) - 30) {
      triggerProactiveAI('motivate');
    }
    setIsActive(!isActive);
  };

  const handleLogin = (u: string) => {
    localStorage.setItem('synapse_active_user', u);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('synapse_active_user');
    setUser(null);
    setIsActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        data: result
      });
      // Inform user in chat
      setChat(p => [...p, { role: 'a', t: `File attached: ${file.name}. You can now ask me questions about it, or select 'Flashcards'/'Test' mode to generate materials from it.`}]);
    };

    if (file.type.startsWith('text/') || file.type === 'application/json' || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file); // For images to be sent as inlineData
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const q = input; 
    setInput("");
    setChat(p => [...p, { role: 'u', t: q }]);
    setIsTyping(true);

    try {
      let aiPayload: any[] = [];
      
      // Structure the prompt context
      let textPrompt = `Current Mode: ${activeAI}\n`;
      if (activeAI === 'Flashcards') textPrompt += "Generate a set of highly effective study flashcards based on the user's request and provided file (if any).\n";
      if (activeAI === 'Test') textPrompt += "Generate a multiple-choice test based on the user's request and provided file (if any). Provide answers at the end.\n";
      
      textPrompt += `\nUser Command: ${q}`;

      // Handle attached files
      if (attachedFile) {
        if (attachedFile.data.startsWith('data:')) {
          // It's a Data URL (e.g. image)
          const base64Data = attachedFile.data.split(',')[1];
          aiPayload.push({ inlineData: { data: base64Data, mimeType: attachedFile.type } });
          textPrompt += `\n\n[Analyze the attached image/file for context]`;
        } else {
          // It's raw text
          textPrompt += `\n\n[Context from attached file '${attachedFile.name}':]\n${attachedFile.data}`;
        }
      }

      aiPayload.unshift(textPrompt);

      const res = await model.generateContent(aiPayload);
      setChat(p => [...p, { role: 'a', t: res.response.text() }]);
      setPoints(p => p + 50);
      
      // Clear file after one prompt to avoid huge token usage repeatedly unless re-attached
      if (attachedFile) {
        setAttachedFile(null);
      }

    } catch(err) { 
      console.error(err);
      setChat(p => [...p, { role: 'a', t: "Sync lost. File might be too large or API unavailable." }]); 
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    // Replaced h-screen with min-h-[100dvh] and h-[100dvh] for mobile browser compatibility
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col font-sans overflow-hidden relative">
      <SpaceBackground level={rank.level} isActive={isActive} />
      <SpotifyPlayer />

      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="loader" onComplete={() => setLoading(false)} />
        ) : !user ? (
          <AuthPage key="auth" onLogin={handleLogin} />
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative z-10">
            
            {/* Header: Responsive flex-wrap */}
            <header className="shrink-0 min-h-20 border-b border-white/5 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4 lg:gap-10">
                <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors"><LogOut size={18}/></button>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 text-[#96AD8D] text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    <ShieldCheck size={12}/> Lvl {rank.level} • {user}
                  </div>
                  <h1 className="text-sm font-bold tracking-widest uppercase">{rank.title}</h1>
                </div>
                
                {/* Mode Selector (Scrollable horizontally on very small screens) */}
                <nav className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                  {['ELI5', 'Flashcards', 'Test', 'Planner'].map((m: any) => (
                    <button key={m} onClick={() => setActiveAI(m)} className={`px-3 lg:px-4 py-1.5 whitespace-nowrap rounded-full text-[9px] lg:text-[10px] font-bold uppercase transition-all ${activeAI === m ? 'bg-[#96AD8D] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                  ))}
                </nav>
              </div>
              
              <div className="flex items-center gap-4 lg:gap-6 ml-auto">
                <div className="text-right">
                  <p className="text-[9px] font-black text-[#96AD8D] uppercase mb-1">Energy</p>
                  <p className="text-xs lg:text-sm font-mono">{Math.floor(points).toLocaleString()} NX</p>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 lg:p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"><Settings size={18}/></button>
              </div>
            </header>

            {/* Main Content Area - Responsive Stacking */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Side: Timer & Controls */}
              <main className="flex-shrink-0 lg:flex-[3] flex flex-col items-center justify-center p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 relative bg-black/20">
                <div className="flex gap-2 lg:gap-4 mb-8 lg:mb-12 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  {(['focus', 'short', 'long'] as const).map(m => (
                    <button key={m} onClick={() => {setIsActive(false); setMode(m)}} className={`px-4 lg:px-8 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>{m}</button>
                  ))}
                </div>
                
                <motion.h2 animate={isActive ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-[6rem] sm:text-[8rem] lg:text-[14rem] font-thin tracking-tighter tabular-nums leading-none mb-8 lg:mb-12">
                  {Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}
                </motion.h2>
                
                <div className="flex gap-3 lg:gap-5 w-full max-w-[460px]">
                  <button onClick={toggleTimer} className={`flex-[3] py-5 lg:py-8 rounded-3xl lg:rounded-[2.5rem] text-[10px] lg:text-[11px] font-black uppercase tracking-[0.6em] transition-all ${isActive ? 'bg-white/5 text-zinc-400 border border-white/10' : 'bg-[#96AD8D] text-black shadow-2xl shadow-[#96AD8D]/20'}`}>
                    {isActive ? 'Suspend' : 'Engage'}
                  </button>
                  <button onClick={() => {setIsActive(false); setSeconds(config[mode]*60)}} className="flex-1 bg-white/5 border border-white/10 rounded-3xl lg:rounded-[2.5rem] flex items-center justify-center text-zinc-500 hover:text-white transition-all"><RotateCcw size={24}/></button>
                </div>
              </main>

              {/* Right Side: Chat Section */}
              <section className="flex-[2] flex flex-col bg-black/50 backdrop-blur-3xl overflow-hidden">
                <div className="p-4 lg:p-10 flex-1 overflow-y-auto space-y-6">
                  {chat.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <Rocket size={48} className="mb-6" />
                      <p className="text-[10px] uppercase tracking-[0.5em] text-center">Neural Sync Idle</p>
                    </div>
                  ) : (
                    chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'u' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] lg:max-w-[85%] text-xs lg:text-[13px] leading-relaxed p-5 lg:p-6 rounded-3xl border whitespace-pre-wrap ${m.role === 'u' ? 'bg-[#96AD8D]/10 text-[#96AD8D] border-[#96AD8D]/20 rounded-tr-sm' : 'bg-white/5 text-zinc-300 border-white/10 rounded-tl-sm'}`}>{m.t}</div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 rounded-tl-sm">
                        <Loader2 size={18} className="animate-spin text-[#96AD8D] opacity-60" />
                      </div>
                    </div>
                  )}
                  {/* Invisible div to scroll to */}
                  <div ref={chatEndRef} className="h-4" />
                </div>
                
                {/* Fixed Input Bottom Area */}
                <div className="p-4 lg:p-8 border-t border-white/5 bg-black/60 shrink-0">
                  <AnimatePresence>
                    {attachedFile && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2 mb-3 px-4 py-2 bg-[#96AD8D]/10 text-[#96AD8D] rounded-xl text-xs border border-[#96AD8D]/20 w-max max-w-full">
                        <FileText size={14} className="shrink-0" />
                        <span className="truncate">{attachedFile.name}</span>
                        <button onClick={() => setAttachedFile(null)} className="ml-2 hover:text-white shrink-0"><X size={14}/></button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-4 p-2 text-zinc-500 hover:text-white transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept=".txt,.md,.csv,.json,image/png,image/jpeg,image/webp" 
                    />
                    
                    <input 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      placeholder="Neural command or query..." 
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-5 pl-14 pr-16 text-sm text-white focus:outline-none focus:border-[#96AD8D]/40 transition-all shadow-inner" 
                    />
                    
                    <button type="submit" disabled={!input.trim() && !attachedFile} className="absolute right-4 p-2 text-zinc-500 hover:text-[#96AD8D] transition-colors disabled:opacity-50">
                      <Send size={20}/>
                    </button>
                  </form>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettings} config={config} setConfig={setConfig} onClose={() => setShowSettings(false)} />
    </div>
  );
}

// --- UTILS & SUBCOMPONENTS ---

function SettingsModal({ isOpen, config, setConfig, onClose }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-[#080808] border border-white/10 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 relative shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Calibration</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24}/></button>
            </div>
            <div className="space-y-8">
              <CalibrateItem label="Focus" val={config.focus} set={(v) => setConfig({...config, focus: v})} />
              <CalibrateItem label="Short" val={config.short} set={(v) => setConfig({...config, short: v})} />
              <CalibrateItem label="Long" val={config.long} set={(v) => setConfig({...config, long: v})} />
            </div>
            <button onClick={onClose} className="w-full mt-12 py-5 lg:py-6 bg-[#96AD8D] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Sync Changes</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CalibrateItem({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="flex items-center gap-2 lg:gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
        <button onClick={() => set(Math.max(1, val - 1))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">-</button>
        <span className="w-10 lg:w-12 text-center text-xs lg:text-sm font-mono text-[#96AD8D]">{val}m</span>
        <button onClick={() => set(val + 1)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">+</button>
      </div>
    </div>
  );
}

// Improved Loading Screen
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setP(v => {
      if (v >= 100) { clearInterval(i); setTimeout(onComplete, 500); return 100; }
      if (v % 25 === 0) try { playPulse(); } catch(e){} 
      return v + 2;
    }), 30);
    return () => clearInterval(i);
  }, [onComplete]);

  return (
    <motion.div exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }} className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#020203]">
      <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.svg className="absolute inset-0 w-full h-full -rotate-90 opacity-20" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
          <circle cx="80" cy="80" r="78" stroke="#96AD8D" strokeWidth="1" fill="none" strokeDasharray="10 20" />
        </motion.svg>
        {/* Inner Progress Ring */}
        <svg className="w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="60" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
          <motion.circle cx="64" cy="64" r="60" stroke="#96AD8D" strokeWidth="3" fill="none" strokeDasharray="377" animate={{ strokeDashoffset: 377 - (377 * p) / 100 }} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(150,173,141,0.5)]" />
        </svg>
        <Brain size={32} className="absolute text-[#96AD8D] opacity-80 animate-pulse drop-shadow-[0_0_12px_rgba(150,173,141,0.8)]" />
      </div>
      <div className="h-4 overflow-hidden">
        <motion.p initial={{ y: 20 }} animate={{ y: 0 }} className="text-[10px] font-black uppercase tracking-[0.8em] text-[#96AD8D]">
          {p < 100 ? `Syncing Neurons: ${p}%` : "Neural Link Established"}
        </motion.p>
      </div>
    </motion.div>
  );
}

// Interactive Star Field Background
function SpaceBackground({ level, isActive }: { level: number, isActive: boolean }) {
  const mX = useMotionValue(0); const mY = useMotionValue(0);
  const smoothX = useSpring(mX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mY, { stiffness: 40, damping: 25 });
  
  useEffect(() => {
    const move = (e: MouseEvent) => {
      mX.set((e.clientX / window.innerWidth - 0.5) * 60);
      mY.set((e.clientY / window.innerHeight - 0.5) * 60);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mX, mY]);

  const theme = useMemo(() => {
    if (level < 10) return { main: '#96AD8D', variants: ['#F0FFF0', '#96AD8D', '#4A5D43', '#8FBC8F', '#2E8B57'], bloom: 'rgba(150, 173, 141, 0.15)' };
    if (level < 20) return { main: '#a79dff', variants: ['#E6E6FA', '#a79dff', '#4B0082', '#9370DB', '#8A2BE2'], bloom: 'rgba(167, 157, 255, 0.15)' };
    return { main: '#ffd27d', variants: ['#FFFACD', '#ffd27d', '#8B4513', '#FFA500', '#FFD700'], bloom: 'rgba(255, 210, 125, 0.15)' };
  }, [level]);

  const stars = useMemo(() => generateDeepSpace(theme.variants, 150), [theme]); // reduced count slightly for mobile performance

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#010102] z-0">
      <motion.div style={{ x: useTransform(smoothX, v => v * 0.2), y: useTransform(smoothY, v => v * 0.2) }} className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[80%] h-[80%] rounded-full blur-[160px]" style={{ background: `radial-gradient(circle, ${theme.bloom} 0%, transparent 70%)` }} />
      </motion.div>
      
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute pointer-events-auto cursor-default flex items-center justify-center"
          style={{
            left: `${star.x}%`, top: `${star.y}%`,
            width: `${star.size * 6}px`, 
            height: `${star.size * 6}px`,
            x: useTransform(smoothX, v => v * -star.depth),
            y: useTransform(smoothY, v => v * -star.depth),
          }}
          whileHover={{ scale: 2.5, zIndex: 50 }}
        >
          <motion.div 
            className="rounded-full"
            style={{
              width: `${star.size}px`, height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: star.size > 1.5 ? `0 0 6px ${star.color}` : 'none',
            }}
            animate={star.twinkle ? { opacity: [0.3, 1, 0.3] } : {}}
            transition={{ duration: star.twinkleDur, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Functional Spotify Iframe Embed (Responsive)
function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div initial={false} animate={{ x: isOpen ? 0 : '100%' }} className="fixed right-0 top-24 lg:top-1/2 lg:-translate-y-1/2 z-[60] flex items-center">
      {/* Tab Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="absolute -left-12 lg:-left-12 bg-black/60 backdrop-blur-md border border-white/10 border-r-0 p-3 rounded-l-2xl text-[#96AD8D] hover:bg-white/5 transition-colors shadow-2xl">
        <Music size={20} className={isOpen ? "" : "animate-pulse"} />
      </button>
      {/* Player Frame */}
      <div className="w-[300px] lg:w-[340px] h-[300px] lg:h-[380px] bg-[#020203] backdrop-blur-3xl border border-white/10 p-2 rounded-l-3xl shadow-2xl flex flex-col transform translate-x-0">
        <iframe 
          style={{ borderRadius: '20px' }} 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allowFullScreen={false} 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>
    </motion.div>
  );
}