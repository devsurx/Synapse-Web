import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  Leaf, RotateCcw, Send, Loader2, Brain, 
  ShieldCheck, Zap, Trophy, Settings, X, Rocket
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { playPulse, playComplete } from './utils/sound'; 

// --- CONFIG & CONSTANTS ---
const genAI = new GoogleGenerativeAI("AIzaSyCNccysbGA0KykT-gLX-C_Yl7nN5y1Md0E");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const RANKS = [
  "Initiate", "Observer", "Acolyte", "Scribe", "Sentinel", "Warden",
  "Scholar", "Adept", "Magus", "Architect", "Strategist", "Luminary",
  "Viscount", "Exarch", "High-Seer", "Grand-Master", "Oracle", "Sovereign",
  "Ethereal", "Nova", "Supernova", "Quasar", "Pulsar", "Singularity",
  "Void-Walker", "Star-Child", "Cosmic-Mind", "Eternal", "Zenith", "The Synapse"
];

// --- STAR DISTRIBUTION ENGINE (Strict Anti-Clumping) ---
const generateDistributedStars = (variants: string[]) => {
  const stars = [];
  const gridSize = 14; 
  const occupied = new Set();

  for (let i = 0; i < 85; i++) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 30) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      const key = `${r}-${c}`;

      // Checks immediate and diagonal neighbors to enforce padding
      const hasNeighbor = [
        `${r}-${c}`, `${r-1}-${c}`, `${r+1}-${c}`, 
        `${r}-${c-1}`, `${r}-${c+1}`, `${r-1}-${c-1}`, `${r+1}-${c+1}`
      ].some(k => occupied.has(k));

      if (!hasNeighbor) {
        occupied.add(key);
        stars.push({
          x: (c * (100 / gridSize)) + (Math.random() * 3),
          y: (r * (100 / gridSize)) + (Math.random() * 3),
          size: Math.random() * 1.6 + 0.4,
          color: variants[i % variants.length],
          depth: Math.random() * 0.7 + 0.3, 
          duration: 15 + Math.random() * 15
        });
        placed = true;
      }
      attempts++;
    }
  }
  return stars;
};

// --- GLOBAL BACKGROUND COMPONENT ---
function SpaceBackground({ level, isActive }: { level: number, isActive: boolean }) {
  const orbitCount = useMemo(() => Math.min(Math.floor(level / 3) + 4, 12), [level]);
  const [flash, setFlash] = useState(false);
  const prevLevel = useRef(level);

  // Parallax Motion Values
  const mX = useMotionValue(0);
  const mY = useMotionValue(0);
  const smoothX = useSpring(mX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mX.set((e.clientX / window.innerWidth - 0.5) * 45);
      mY.set((e.clientY / window.innerHeight - 0.5) * 45);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mX, mY]);

  // Rank-Up Visual Feedback
  useEffect(() => {
    if (level > prevLevel.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
    prevLevel.current = level;
  }, [level]);

  const theme = useMemo(() => {
    if (level < 10) return { main: '#96AD8D', nebula: 'rgba(150, 173, 141, 0.08)', variants: ['#F0FFF0', '#96AD8D', '#C1D7AE'] };
    if (level < 20) return { main: '#a79dff', nebula: 'rgba(107, 70, 193, 0.12)', variants: ['#E6E6FA', '#a79dff', '#7B68EE'] };
    return { main: '#ffd27d', nebula: 'rgba(255, 165, 0, 0.1)', variants: ['#FFFACD', '#ffd27d', '#DAA520'] };
  }, [level]);

  const stars = useMemo(() => generateDistributedStars(theme.variants), [theme]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#020203] z-0">
      {/* Supernova Flash Overlay */}
      <motion.div 
        animate={{ opacity: flash ? [0, 0.7, 0] : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-50 bg-white pointer-events-none"
      />

      {/* Nebula Layer with Parallax */}
      <motion.div style={{ x: smoothX, y: smoothY }} className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20" style={{ background: theme.nebula }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20" style={{ background: theme.nebula }} />
      </motion.div>

      {/* Spatially Distributed Parallax Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={`${theme.main}-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: `0 0 5px ${star.color}88`,
            x: useSpring(mX.get() * -star.depth, { stiffness: 80, damping: 25 }),
            y: useSpring(mY.get() * -star.depth, { stiffness: 80, damping: 25 }),
          }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: star.duration, repeat: Infinity }}
        />
      ))}

      {/* Ranks-based Orbits */}
      <motion.div 
        style={{ x: smoothX, y: smoothY, rotateX: 75 }}
        className="absolute inset-0 flex items-center justify-center perspective-[1500px]"
      >
        {Array.from({ length: orbitCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-white/[0.03] rounded-[50%]"
            style={{ width: `${(i + 1) * 85 + 220}px`, height: `${(i + 1) * 85 + 220}px` }}
            animate={{ rotateZ: 360 }}
            transition={{ duration: isActive ? 12 + i * 2 : 45 + i * 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute w-1.5 h-1.5 rounded-full top-[-3px] left-1/2" style={{ backgroundColor: theme.main, boxShadow: `0 0 10px ${theme.main}` }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState({ focus: 25, short: 5, long: 15 });
  const [seconds, setSeconds] = useState(config.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');

  const [activeAI, setActiveAI] = useState<'ELI5' | 'Flashcards' | 'Test' | 'Planner'>('ELI5');
  const [chat, setChat] = useState<{role: 'u' | 'a', t: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState(() => Number(localStorage.getItem('synapse_nx')) || 0);

  const rank = useMemo(() => {
    const level = Math.min(Math.floor(Math.pow(points / 200, 0.7)), 29);
    const nextGoal = Math.floor(Math.pow(level + 1, 1.4) * 200);
    return { title: RANKS[level], level: level + 1, progress: (points / nextGoal) * 100 };
  }, [points]);

  useEffect(() => { if (!isActive) setSeconds(config[mode] * 60); }, [config, mode, isActive]);

  useEffect(() => {
    let it: any;
    if (isActive && seconds > 0) {
      it = setInterval(() => {
        setSeconds(s => s - 1);
        setPoints(p => {
          const newPoints = p + (0.2 * rank.level);
          localStorage.setItem('synapse_nx', newPoints.toString());
          return newPoints;
        });
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      setPoints(p => p + 500);
      playComplete();
    }
    return () => clearInterval(it);
  }, [isActive, seconds, rank.level]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const q = input; setInput("");
    setChat(p => [...p, { role: 'u', t: q }]);
    setIsTyping(true);
    try {
      const res = await model.generateContent(`${activeAI}: ${q}`);
      setChat(p => [...p, { role: 'a', t: res.response.text() }]);
      setPoints(p => p + 50);
    } catch { setChat(p => [...p, { role: 'a', t: "Sync Interrupted." }]); } finally { setIsTyping(false); }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden">
      <SpaceBackground level={rank.level} isActive={isActive} />

      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="loader" onComplete={() => setLoading(false)} />
        ) : (
          <motion.div key="main-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative z-10">
            <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/20 backdrop-blur-xl">
              <div className="flex items-center gap-12">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1 text-[#96AD8D]">
                    <ShieldCheck size={12} />
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase">Level {rank.level}</span>
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase">{rank.title}</span>
                </div>
                <nav className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                  {['ELI5', 'Flashcards', 'Test', 'Planner'].map((m: any) => (
                    <button key={m} onClick={() => setActiveAI(m)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${activeAI === m ? 'bg-[#96AD8D] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#96AD8D] tracking-tighter uppercase mb-1">Total Energy</p>
                  <p className="text-sm font-mono text-white">{Math.floor(points).toLocaleString()} NX</p>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"><Settings size={20}/></button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <main className="flex-[3] flex flex-col items-center justify-center p-12 border-r border-white/5">
                <div className="flex gap-4 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  {(['focus', 'short', 'long'] as const).map(m => (
                    <button key={m} onClick={() => {setIsActive(false); setMode(m)}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>{m}</button>
                  ))}
                </div>
                <motion.h1 animate={isActive ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-[12rem] font-extralight tracking-tighter text-white tabular-nums leading-none mb-12">
                  {Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}
                </motion.h1>
                <div className="flex gap-4 w-full max-w-[440px]">
                  <button onClick={() => setIsActive(!isActive)} className={`flex-[3] py-7 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] transition-all ${isActive ? 'bg-white/5 text-zinc-500 border border-white/10' : 'bg-[#96AD8D] text-black shadow-2xl shadow-[#96AD8D]/30'}`}>
                    {isActive ? 'Suspend' : 'Engage'}
                  </button>
                  <button onClick={() => {setIsActive(false); setSeconds(config[mode]*60)}} className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><RotateCcw size={24}/></button>
                </div>
              </main>

              <section className="flex-[2] flex flex-col bg-[#050505]/40 backdrop-blur-2xl">
                <div className="p-8 flex-1 overflow-y-auto space-y-6">
                  {chat.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Rocket size={40} className="mb-4" />
                      <p className="text-[10px] uppercase tracking-[0.4em] text-center leading-loose">Waiting for neural sync...</p>
                    </div>
                  ) : (
                    chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'u' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] text-[13px] leading-relaxed p-5 rounded-3xl border ${m.role === 'u' ? 'bg-[#96AD8D]/10 text-[#96AD8D] border-[#96AD8D]/20' : 'bg-white/5 text-zinc-300 border-white/10'}`}>{m.t}</div>
                      </div>
                    ))
                  )}
                  {isTyping && <Loader2 size={16} className="animate-spin text-[#96AD8D] mx-auto opacity-50" />}
                </div>
                <div className="p-8 border-t border-white/5">
                  <form onSubmit={handleSend} className="relative">
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Send command..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-7 text-sm text-white focus:outline-none focus:border-[#96AD8D]/30 transition-all" />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-[#96AD8D] transition-colors"><Send size={20}/></button>
                  </form>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System Calibration</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="space-y-8">
                <CalibrateItem label="Focus" val={config.focus} set={(v) => setConfig({...config, focus: v})} />
                <CalibrateItem label="Short Break" val={config.short} set={(v) => setConfig({...config, short: v})} />
                <CalibrateItem label="Long Break" val={config.long} set={(v) => setConfig({...config, long: v})} />
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full mt-12 py-5 bg-[#96AD8D] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90">Apply Changes</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalibrateItem({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
        <button onClick={() => set(Math.max(1, val - 1))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">-</button>
        <span className="w-12 text-center text-sm font-mono text-[#96AD8D]">{val}m</span>
        <button onClick={() => set(val + 1)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">+</button>
      </div>
    </div>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setP(v => {
      if (v >= 100) { clearInterval(i); setTimeout(onComplete, 500); return 100; }
      if (v % 20 === 0) playPulse(); return v + 2;
    }), 30);
    return () => clearInterval(i);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.1 }} 
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r="62" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
          <motion.circle cx="64" cy="64" r="62" stroke="#96AD8D" strokeWidth="2" fill="none" strokeDasharray="389" animate={{ strokeDashoffset: 389 - (389 * p) / 100 }} />
        </svg>
        <Leaf size={32} className="absolute text-[#96AD8D] opacity-40 animate-pulse" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.8em] text-[#96AD8D] opacity-50">Syncing Neurons: {p}%</p>
    </motion.div>
  );
}