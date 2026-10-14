import { redirect } from "next/navigation";
import { login } from "@/app/actions";
import { isAdmin } from "@/lib/auth";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/");
  const error = (await searchParams).error;
  return (
    <main className="login-page">
      <section className="login-intro"><div className="brand-block"><span className="brand-mark">R</span><div><strong>RIVET</strong><span>运营后台</span></div></div><div><p className="login-kicker">独立管理应用 · 端口 3001</p><h1>让商品、市场和订单保持清楚。</h1><p>后台默认中文；美国商城保持英文。US 与 EU 使用同一组物理 SKU 和共享库存。</p></div><small>欧洲前台尚未开放，后台可提前维护 EUR 价格。</small></section>
      <form action={login} className="login-card">
        <div><h2>管理员登录</h2><p>继续进入 RIVET 运营后台。</p></div>
        <label className="field"><span>管理员邮箱</span><input name="email" type="email" required autoComplete="username" autoFocus /></label>
        <label className="field"><span>密码</span><input name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p className="notice notice-error">邮箱或密码不正确。</p>}
        <button className="primary-button login-button">登录</button>
        <small>账号仍从本机环境变量读取，不会显示在页面或写入日志。</small>
      </form>
    </main>
  );
}
