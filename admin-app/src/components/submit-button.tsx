"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "正在保存…", className = "" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>{pending ? pendingText : children}</button>;
}
