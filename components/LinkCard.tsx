import { Card } from "./Card";

interface LinkCardProps {
  title: string;
  badge?: string;
  description: string;
  href?: string;
  linkLabel?: string;
  pending?: boolean; // shows "Link coming soon" instead of an active link
}

export function LinkCard({
  title,
  badge,
  description,
  href,
  linkLabel = "OPEN",
  pending = false,
}: LinkCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ash-50">{title}</h3>
      </div>
      {badge && (
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash-500">
          {badge}
        </span>
      )}
      <p className="text-sm leading-relaxed text-ash-400">{description}</p>

      <div className="mt-2 border-t border-card-border pt-4">
        {pending || !href ? (
          <span className="font-mono text-xs italic text-ash-600">
            Link coming soon
          </span>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest2 text-signal transition-colors hover:text-signal-bright"
          >
            {linkLabel}
            <span className="transition-transform group-hover:translate-x-0.5">
              &gt;
            </span>
          </a>
        )}
      </div>
    </Card>
  );
}
