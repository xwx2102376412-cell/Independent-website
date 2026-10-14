import { PageHeader, StatusBadge } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export default async function SecurityPage() {
  const [users, roles, audits] = await Promise.all([
    prisma.adminUser.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } }),
    prisma.adminRole.findMany({ orderBy: { name: "asc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <><PageHeader title="权限与审计" description="当前继续使用环境变量单管理员登录；数据库已建立角色、用户、会话和审计基础。" /><section className="security-grid"><article className="panel"><div className="panel-heading"><div><h2>管理员</h2><p>当前只有所有者账号，暂不开放新增入口。</p></div><StatusBadge tone="warning">单管理员模式</StatusBadge></div><div className="compact-list">{users.map((user) => <div className="compact-row" key={user.id}><div><strong>{user.name}</strong><span>{user.email}</span></div><div className="row-end"><StatusBadge tone={user.active ? "success" : "danger"}>{user.active ? "启用" : "停用"}</StatusBadge><span>{user.role.name}</span></div></div>)}</div></article><article className="panel"><div className="panel-heading"><div><h2>角色基础</h2><p>未来切换多管理员时沿用此权限模型。</p></div></div><div className="compact-list">{roles.map((role) => <div className="compact-row" key={role.id}><div><strong>{role.name}</strong><span>{role.code}</span></div><code>{role.permissions.join(", ")}</code></div>)}</div></article></section><section className="table-panel"><div className="table-summary"><strong>操作审计</strong><span>最近 100 条后台写操作</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>时间</th><th>管理员</th><th>动作</th><th>对象</th><th>说明</th></tr></thead><tbody>{audits.map((log) => <tr key={log.id}><td>{log.createdAt.toLocaleString("zh-CN")}</td><td>{log.actorEmail}</td><td><StatusBadge>{log.action}</StatusBadge></td><td>{log.entityType}{log.entityId ? <small className="cell-subline">{log.entityId}</small> : null}</td><td>{log.summary}</td></tr>)}</tbody></table></div>{audits.length === 0 && <div className="empty-copy">新的后台操作会从这里开始记录。</div>}</section></>;
}
