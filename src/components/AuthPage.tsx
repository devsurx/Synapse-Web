import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { 
  Leaf, RotateCcw, Send, Loader2, Brain, 
  ShieldCheck, Settings, X, Rocket, LogOut,
  Music, Play, SkipForward, SkipBack, Volume2,
  Lock, User, ArrowRight, Database, Sparkles,
  Paperclip, FileText, CheckCircle2, Smartphone
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { playPulse, playComplete } from '../utils/sound'; 

// --- FIREBASE IMPORTS ---
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const RANKS = ["Initiate", "Observer", "Acolyte", "Scribe", "Sentinel", "Warden", "Scholar", "Adept", "Magus", "Architect", "Strategist", "Luminary", "Viscount", "Exarch", "High-Seer", "Grand-Master", "Oracle", "Sovereign", "Ethereal", "Nova", "Supernova", "Quasar", "Pulsar", "Singularity", "Void-Walker", "Star-Child", "Cosmic-Mind", "Eternal", "Zenith", "The Synapse"];

// --- SETTINGS MODAL ---
function SettingsModal({ isOpen, config, setConfig, onClose }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} 
            className="w-full max-w-sm bg-[#080808] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 relative shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Calibration</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24}/></button>
            </div>
            <div className="space-y-8">
              <CalibrateItem label="Focus" val={config.focus} set={(v) => setConfig({...config, focus: v})} />
              <CalibrateItem label="Short" val={config.short} set={(v) => setConfig({...config, short: v})} />
              <CalibrateItem label="Long" val={config.long} set={(v) => setConfig({...config, long: v})} />
            </div>
            <button onClick={onClose} className="w-full mt-12 py-5 bg-[#96AD8D] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
              Sync Changes
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CalibrateItem({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
        <button onClick={() => set(Math.max(1, val - 1))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white">-</button>
        <span className="w-10 text-center text-xs font-mono text-[#96AD8D]">{val}m</span>
        <button onClick={() => set(val + 1)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white">+</button>
      </div>
    </div>
  );
}

// --- SPLASH SCREEN ---
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
    <motion.div exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }} 
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[#020203]">
      <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
        <motion.svg className="absolute inset-0 w-full h-full -rotate-90 opacity-20" 
          animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
          <circle cx="80" cy="80" r="78" stroke="#96AD8D" strokeWidth="1" fill="none" strokeDasharray="10 20" />
        </motion.svg>
        <svg className="w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="60" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
          <motion.circle cx="64" cy="64" r="60" stroke="#96AD8D" strokeWidth="3" fill="none" 
            strokeDasharray="377" animate={{ strokeDashoffset: 377 - (377 * p) / 100 }} 
            strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(150,173,141,0.5)]" />
        </svg>
        <Brain size={32} className="absolute text-[#96AD8D] opacity-80 animate-pulse" />
      </div>
      <div className="h-4 overflow-hidden">
        <motion.p initial={{ y: 20 }} animate={{ y: 0 }} className="text-[10px] font-black uppercase tracking-[0.8em] text-[#96AD8D]">
          {p < 100 ? `Syncing Neurons: ${p}%` : "Neural Link Established"}
        </motion.p>
      </div>
    </motion.div>
  );
}
// --- SPACE BACKGROUND ---
function SpaceBackground({ level, isActive }: { level: number, isActive: boolean }) {
  const mX = useMotionValue(0); 
  const mY = useMotionValue(0);
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
    if (level < 10) return { main: '#96AD8D', variants: ['#F0FFF0', '#96AD8D', '#4A5D43'], bloom: 'rgba(150, 173, 141, 0.15)' };
    if (level < 20) return { main: '#a79dff', variants: ['#E6E6FA', '#a79dff', '#4B0082'], bloom: 'rgba(167, 157, 255, 0.15)' };
    return { main: '#ffd27d', variants: ['#FFFACD', '#ffd27d', '#8B4513'], bloom: 'rgba(255, 210, 125, 0.15)' };
  }, [level]);

  // Use the generator function you have at the top of your file
  const stars = useMemo(() => generateDeepSpace(theme.variants, 150), [theme]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#010102] z-0">
      <motion.div style={{ x: useTransform(smoothX, v => v * 0.2), y: useTransform(smoothY, v => v * 0.2) }} className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[80%] h-[80%] rounded-full blur-[160px]" 
          style={{ background: `radial-gradient(circle, ${theme.bloom} 0%, transparent 70%)` }} />
      </motion.div>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute pointer-events-auto cursor-default flex items-center justify-center"
          style={{
            left: `${star.x}%`, top: `${star.y}%`,
            width: `${star.size * 6}px`, height: `${star.size * 6}px`,
            x: useTransform(smoothX, v => v * -star.depth),
            y: useTransform(smoothY, v => v * -star.depth),
          }}
          whileHover={{ scale: 2.5, zIndex: 50 }}
        >
          <motion.div className="rounded-full" 
            style={{ width: `${star.size}px`, height: `${star.size}px`, backgroundColor: star.color, boxShadow: star.size > 1.5 ? `0 0 6px ${star.color}` : 'none' }} 
            animate={star.twinkle ? { opacity: [0.3, 1, 0.3] } : {}} 
            transition={{ duration: star.twinkleDur, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      ))}
    </div>
  );
}

// --- SPOTIFY PLAYER ---
function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div initial={false} animate={{ x: isOpen ? 0 : '100%' }} 
      className="fixed right-0 top-24 lg:top-1/2 lg:-translate-y-1/2 z-[60] flex items-center">
      <button onClick={() => setIsOpen(!isOpen)} 
        className="absolute -left-12 bg-black/60 backdrop-blur-md border border-white/10 border-r-0 p-3 rounded-l-2xl text-[#96AD8D] hover:bg-white/5 transition-colors shadow-2xl">
        <Music size={20} className={isOpen ? "" : "animate-pulse"} />
      </button>
      <div className="w-[300px] lg:w-[340px] h-[380px] bg-[#020203] backdrop-blur-3xl border border-white/10 p-2 rounded-l-3xl shadow-2xl overflow-hidden">
        <iframe style={{ borderRadius: '20px' }} 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZqdCNm9SSTm?utm_source=generator&theme=0" 
          width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
        </iframe>
      </div>
    </motion.div>
  );
}

// --- COSMOS ENGINE ---
const generateDeepSpace = (variants: string[], count: number = 250) => {
  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      color: variants[Math.floor(Math.random() * variants.length)],
      depth: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() > 0.6, twinkleDur: 2 + Math.random() * 4
    });
  }
  return elements;
};

// --- AUTH PAGE COMPONENT ---
function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const virtualEmail = `${username.toLowerCase().trim()}@synapse.ai`;

    try {
  if (isSignUp) {
    const res = await createUserWithEmailAndPassword(auth, virtualEmail, password);
    console.log("User Created:", res.user.uid);
  } else {
    const res = await signInWithEmailAndPassword(auth, virtualEmail, password);
    console.log("User Signed In:", res.user.uid);
  }
} catch (err: any) {
  console.error("Firebase Auth Error:", err.code, err.message);
  setError(err.message); // This will show you exactly why it's not saving
}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-[#020203] p-6">
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-md p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative z-10">
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:border-[#96AD8D]/40 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input required type="password" placeholder="Access Code" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:border-[#96AD8D]/40 outline-none" />
          </div>
          {error && <p className="text-red-400 text-[10px] uppercase tracking-widest text-center">{error}</p>}
          <button disabled={loading} type="submit" className="w-full bg-[#96AD8D] text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : (isSignUp ? "Establish Connection" : "Initialize Sync")} <ArrowRight size={16} />
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-8 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#96AD8D]">
          {isSignUp ? "Existing Link? Sign In" : "New Neuron? Create Link"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// --- MAIN APPLICATION ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [config, setConfig] = useState({ focus: 25, short: 5, long: 15 });
  
  const [showSettings, setShowSettings] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [activeAI, setActiveAI] = useState<'ELI5' | 'Flashcards' | 'Test' | 'Planner'>('ELI5');
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState<{role: 'u' | 'a', t: string}[]>([]);

  // 1. Listen for Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fireUser) => {
      if (fireUser) {
        const name = fireUser.email?.split('@')[0] || "User";
        setUser(name);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Sync Data with Firestore (Cloud Storage)
  useEffect(() => {
    if (!user) return;
    const userDoc = doc(db, "users", user);
    
    const unsub = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPoints(data.points || 0);
        setConfig(data.config || { focus: 25, short: 5, long: 15 });
      } else {
        // Initialize new user in cloud
        setDoc(userDoc, { points: 0, config: { focus: 25, short: 5, long: 15 } });
      }
    });
    return () => unsub();
  }, [user]);

  // 3. Save progress to Cloud periodically or on change
  const saveToCloud = useCallback(async (newPoints: number) => {
    if (user) {
      await setDoc(doc(db, "users", user), { points: newPoints, config }, { merge: true });
    }
  }, [user, config]);

  const rank = useMemo(() => {
    const level = Math.min(Math.floor(Math.pow(points / 200, 0.7)), 29);
    return { title: RANKS[level], level: level + 1 };
  }, [points]);

  useEffect(() => { if (!isActive) setSeconds(config[mode] * 60); }, [config, mode, isActive]);

  useEffect(() => {
    let it: any;
    if (isActive && seconds > 0) {
      it = setInterval(() => {
        setSeconds(s => s - 1);
        setPoints(p => {
          const next = p + (0.2 * rank.level);
          if (Math.floor(next) % 10 === 0) saveToCloud(next); // Sync every 10 NX gained
          return next;
        });
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setPoints(p => p + 500);
      saveToCloud(points + 500);
      try { playComplete(); } catch(e){}
    }
    return () => clearInterval(it);
  }, [isActive, seconds, rank.level, saveToCloud, points]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsActive(false);
  };

  // ... (Remaining Logic for File Upload, AI Chat, UI Rendering stays exactly the same) ...

  if (loading) return <SplashScreen onComplete={() => {}} />;
  if (!user) return <AuthPage />;

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col font-sans overflow-hidden relative">
      <SpaceBackground level={rank.level} isActive={isActive} />
      <SpotifyPlayer />
      
      {/* Rest of the UI remains identical to your design */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative z-10">
          <header className="shrink-0 min-h-20 border-b border-white/5 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-4 lg:gap-10">
              <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors"><LogOut size={18}/></button>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-[#96AD8D] text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  <ShieldCheck size={12}/> Lvl {rank.level} • {user}
                </div>
                <h1 className="text-sm font-bold tracking-widest uppercase">{rank.title}</h1>
              </div>
              <nav className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                {['ELI5', 'Flashcards', 'Test', 'Planner'].map((m: any) => (
                  <button key={m} onClick={() => setActiveAI(m)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${activeAI === m ? 'bg-[#96AD8D] text-black' : 'text-zinc-500'}`}>{m}</button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-right">
                <p className="text-[9px] font-black text-[#96AD8D] uppercase">Energy</p>
                <p className="text-sm font-mono">{Math.floor(points).toLocaleString()} NX</p>
              </div>
              <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400"><Settings size={18}/></button>
            </div>
          </header>

          {/* ... Main Timer & Chat UI here ... */}
          <div className="text-center p-20">
              <h2 className="text-[10rem] font-thin">{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</h2>
              <button onClick={() => setIsActive(!isActive)} className="bg-[#96AD8D] text-black px-10 py-4 rounded-full font-black uppercase tracking-widest">
                {isActive ? 'Suspend' : 'Engage'}
              </button>
          </div>
      </motion.div>

      <SettingsModal isOpen={showSettings} config={config} setConfig={setConfig} onClose={() => setShowSettings(false)} />
    </div>
  );
}
// ... Include your subcomponents (SpaceBackground, SettingsModal, etc.) below ...