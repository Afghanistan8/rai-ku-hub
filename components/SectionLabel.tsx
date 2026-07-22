export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 flex items-center justify-center gap-4">
      <span className="h-px w-10 bg-ash-700" />
      <span className="font-mono text-xs uppercase tracking-widest2 text-ash-500">
        {children}
      </span>
      <span className="h-px w-10 bg-ash-700" />
    </div>
  );
}
