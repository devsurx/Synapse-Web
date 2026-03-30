export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`
      bg-[#121212] 
      border border-white/[0.04] 
      rounded-2xl p-6
      transition-colors duration-300
      hover:border-synapse-green/20
      ${className}
    `}>
      {children}
    </div>
  );
};