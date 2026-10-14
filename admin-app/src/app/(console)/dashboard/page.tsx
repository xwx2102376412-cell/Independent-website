import Link from "next/link";
import { Metric, PageHeader, StatusBadge } from "@/components/admin-ui";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [products, orders, inquiries, inventory, recentAudits] = await Promise.all([
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.inquiry.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
    prisma.inventory.findMany({ include: { variant: { include: { product: true } } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const productCount = products.reduce((sum, item) => sum + item._count._all, 0);
  const activeCount = products.find((item) => item.status === "ACTIVE")?._count._all ?? 0;
  const capturedRevenue = orders.filter((order) => ["PAID", "FULFILLED"].includes(order.status)).reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => ["PENDING", "APPROVED"].includes(order.status)).length;
  const lowStock = inventory.filter((item) => item.onHand - item.reserved <= 5).sort((left, right) => (left.onHand - left.reserved) - (right.onHand - right.reserved)).slice(0, 6);
  return <>
    <PageHeader title="运营概览" description="查看商品、订单、库存和待处理事项。数据直接来自 PostgreSQL。" />
    <section className="metric-grid"><Metric label="商品" value={productCount} helper={`${activeCount} 个已上架`} /><Metric label="待付款订单" value={pendingOrders} helper="尚未收到 PayPal 完成通知" /><Metric label="已确认收入" value={money(capturedRevenue)} helper="仅统计已付款或已履约订单" /><Metric label="待跟进询盘" value={inquiries} helper="未成交或未关闭" /></section>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-heading"><div><h2>近期订单</h2><p>付款事实仅由 PayPal Webhook 确认。</p></div><Link href="/orders">查看全部</Link></div><div className="compact-list">{orders.length ? orders.map((order) => <Link href="/orders" key={order.id} className="compact-row"><div><strong>{order.orderNumber}</strong><span>{order.email}</span></div><div className="row-end"><strong>{money(order.total, order.currency)}</strong><StatusBadge tone={order.status === "PAID" || order.status === "FULFILLED" ? "success" : order.status === "CANCELLED" ? "danger" : "warning"}>{order.status}</StatusBadge></div></Link>) : <p className="empty-copy">暂无订单</p>}</div></section>
      <section className="panel"><div className="panel-heading"><div><h2>低库存</h2><p>库存为共享物理 SKU，不按市场重复计算。</p></div><Link href="/inventory">库存管理</Link></div><div className="compact-list">{lowStock.length ? lowStock.map((item) => <Link href={`/products/${item.variant.productId}`} key={item.id} className="compact-row"><div><strong>{item.variant.sku}</strong><span>{item.variant.product?.name ?? "未关联商品"}</span></div><div className="row-end"><strong>{item.onHand - item.reserved} 可售</strong><span>{item.reserved} 已预留</span></div></Link>) : <p className="empty-copy">没有低库存 SKU</p>}</div></section>
      <section className="panel panel-wide"><div className="panel-heading"><div><h2>最近操作</h2><p>所有关键后台写操作都会进入审计日志。</p></div><Link href="/settings/security">查看审计</Link></div><div className="audit-list">{recentAudits.map((log) => <div key={log.id}><strong>{log.summary}</strong><span>{log.actorEmail} · {log.createdAt.toLocaleString("zh-CN")}</span></div>)}</div></section>
    </div>
  </>;
}
