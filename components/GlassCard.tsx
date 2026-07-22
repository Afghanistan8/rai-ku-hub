export function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md transition-colors duration-300 hover:border-eye/40 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-eye/50 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-90" />
      {children}
    </div>
  );
}
