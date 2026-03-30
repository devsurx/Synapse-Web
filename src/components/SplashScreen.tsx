function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setP(v => {
        if (v >= 100) {
          clearInterval(t);
          // Small delay so the user sees the 100% state
          setTimeout(onComplete, 500); 
          return 100;
        }
        return v + 2;
      });
    }, 30);
    return () => clearInterval(t);
  }, [onComplete]); // Added onComplete to dependency array

  return (
    <motion.div 
      exit={{ opacity: 0, y: -20 }} 
      className="fixed inset-0 bg-[#080808] z-[100] flex flex-col items-center justify-center"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full border border-[#96AD8D]/20 p-1 mb-8 relative">
          <div className="absolute inset-0 bg-[#96AD8D]/10 blur-xl rounded-full animate-pulse" />
          <img 
            src="/logo.png" 
            className="w-full h-full rounded-full relative z-10 object-cover" 
            alt="Logo"
          />
        </div>
        
        <h1 className="text-xl font-light tracking-[1em] uppercase text-white mb-4 ml-[1em]">
          Synapse
        </h1>
        
        <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${p}%` }} 
            className="absolute h-full bg-[#96AD8D]" 
          />
        </div>
        
        <p className="mt-4 text-[9px] tracking-[0.4em] text-zinc-500 uppercase font-bold">
          {p < 100 ? `Synchronizing... ${p}%` : "Connection Established"}
        </p>
      </motion.div>
    </motion.div>
  );
}