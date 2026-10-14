"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const navigation = [
  ["/dashboard", "概览"],
  ["/products", "商品"],
  ["/inventory", "库存"],
  ["/orders", "订单"],
  ["/inquiries", "询盘"],
  ["/settings/markets", "市场"],
  ["/settings/security", "权限与审计"],
] as const;

export function AdminShell({ children, email, roleName, storefrontUrl }: { children: React.ReactNode; email: string; roleName: string; storefrontUrl: string }) {
  const pathname = usePathname();
  return <div className="admin-frame">
    <aside className="admin-sidebar">
      <div className="brand-block"><span className="brand-mark">R</span><div><strong>RIVET</strong><span>运营后台</span></div></div>
      <nav className="admin-nav" aria-label="后台主导航">{navigation.map(([href, label]) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return <Link key={href} href={href} className={active ? "active" : ""}>{label}</Link>;
      })}</nav>
      <div className="sidebar-footer">
        <div className="admin-identity"><strong>{roleName}</strong><span title={email}>{email}</span></div>
        <a href={storefrontUrl} target="_blank" rel="noreferrer" className="secondary-button">打开商城</a>
        <form action={logout}><SubmitButton pendingText="退出中…" className="quiet-button">退出登录</SubmitButton></form>
      </div>
    </aside>
    <div className="admin-workspace">
      <header className="mobile-bar"><div className="brand-block"><span className="brand-mark">R</span><strong>RIVET 后台</strong></div></header>
      <nav className="mobile-nav" aria-label="移动端后台导航">{navigation.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <main className="admin-content">{children}</main>
    </div>
  </div>;
}
