import Link from "next/link";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-actions">{action}</div>}</header>;
}

export function Notice({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return <div role="status" className={`notice ${error ? "notice-error" : "notice-success"}`}>{error ?? message}</div>;
}

export function StatusBadge({ tone = "neutral", children }: { tone?: "success" | "warning" | "danger" | "neutral" | "info"; children: React.ReactNode }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function Metric({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function EmptyState({ title, description, href, linkLabel }: { title: string; description: string; href?: string; linkLabel?: string }) {
  return <div className="empty-state"><strong>{title}</strong><p>{description}</p>{href && linkLabel && <Link href={href} className="primary-button">{linkLabel}</Link>}</div>;
}

export function Field({ name, label, value, type = "text", min, step, required = true, help }: { name: string; label: string; value?: string; type?: string; min?: string; step?: string; required?: boolean; help?: string }) {
  return <label className="field"><span>{label}</span><input name={name} type={type} required={required} defaultValue={value} min={min} step={step} />{help && <small>{help}</small>}</label>;
}
