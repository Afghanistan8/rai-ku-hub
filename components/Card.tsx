import { HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-card-border bg-card-gradient p-6 transition-colors duration-200 hover:border-card-borderHover ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
