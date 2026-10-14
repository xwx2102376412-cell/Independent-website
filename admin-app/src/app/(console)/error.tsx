"use client";

export default function ConsoleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="error-state"><strong>后台页面暂时无法加载</strong><p>数据库连接或页面数据可能发生变化。请重试；如果仍失败，再检查终端错误信息。</p><button onClick={reset} className="primary-button">重新加载</button></section>;
}
