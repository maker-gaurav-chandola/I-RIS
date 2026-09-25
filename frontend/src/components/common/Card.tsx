import { type ReactNode } from "react";

export function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      {(title || action) && (
        <header className="card-header">
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}
