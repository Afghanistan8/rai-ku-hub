import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  pulse?: boolean; // subtle animation for "live" figures
}

export function StatCard({ label, value, sublabel, pulse }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-widest2 text-ash-500">
        {label}
      </span>
      <span
        className={`text-3xl font-semibold text-ash-50 ${
          pulse ? "animate-pulseSoft" : ""
        }`}
      >
        {value}
      </span>
      {sublabel && (
        <span className="font-mono text-xs text-ash-600">{sublabel}</span>
      )}
    </Card>
  );
}
