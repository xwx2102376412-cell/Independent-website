import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin-ui";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const inventory = await prisma.inventory.findMany({
    where: q ? { variant: { OR: [{ sku: { contains: q, mode: "insensitive" } }, { product: { name: { contains: q, mode: "insensitive" } } }] } } : undefined,
    include: { variant: { include: { product: true, prices: true } } },
    orderBy: { variant: { sku: "asc" } },
  });
  const totals = inventory.reduce((result, item) => ({ onHand: result.onHand + item.onHand, reserved: result.reserved + item.reserved }), { onHand: 0, reserved: 0 });
  return <><PageHeader title="共享库存" description="库存归属于物理 SKU；美国和欧洲市场使用同一库存余额。库存流水将在订单核心阶段补齐。" /><section className="inventory-summary"><div><span>账面库存</span><strong>{totals.onHand}</strong></div><div><span>已预留</span><strong>{totals.reserved}</strong></div><div><span>可售库存</span><strong>{totals.onHand - totals.reserved}</strong></div></section><form className="filter-bar"><input name="q" defaultValue={q} placeholder="搜索商品或 SKU" /><button className="secondary-button">搜索</button>{q && <Link href="/inventory" className="quiet-link">清除</Link>}</form><section className="table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>SKU</th><th>商品</th><th>市场价格</th><th>账面</th><th>预留</th><th>可售</th><th>状态</th></tr></thead><tbody>{inventory.map((item) => {
    const us = item.variant.prices.find((price) => price.market === "US"); const eu = item.variant.prices.find((price) => price.market === "EU"); const available = item.onHand - item.reserved;
    return <tr key={item.id}><td><Link href={`/products/${item.variant.productId}`} className="strong-link">{item.variant.sku}</Link><small className="cell-subline">{item.variant.color} · {item.variant.batteryWh}Wh</small></td><td>{item.variant.product?.name ?? "未关联商品"}</td><td><div className="market-stack"><span>US {money(us?.price ?? 0, "USD")}</span><span>EU {money(eu?.price ?? 0, "EUR")}</span></div></td><td>{item.onHand}</td><td>{item.reserved}</td><td><strong>{available}</strong></td><td><StatusBadge tone={available <= 0 ? "danger" : available <= 5 ? "warning" : "success"}>{available <= 0 ? "缺货" : available <= 5 ? "低库存" : "正常"}</StatusBadge></td></tr>;
  })}</tbody></table></div></section></>;
}
