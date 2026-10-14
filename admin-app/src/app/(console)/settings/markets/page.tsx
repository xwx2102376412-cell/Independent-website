import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin-ui";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function MarketsPage() {
  const products = await prisma.product.findMany({ include: { marketVersions: true, variants: { include: { prices: true } } }, orderBy: { name: "asc" } });
  return <><PageHeader title="市场" description="同一个商城未来切换 US/USD 与 EU/EUR。本阶段仅开放后台管理，欧洲前台保持关闭。" /><section className="market-overview"><article><StatusBadge tone="success">US / USD</StatusBadge><h2>美国市场</h2><p>当前商城公开市场。商品全局上架后，美国发布状态同步开启。</p></article><article><StatusBadge tone="info">EU / EUR</StatusBadge><h2>欧洲市场</h2><p>后台可维护 EUR 价格和发布准备状态，但前台入口尚未开放。</p></article></section><section className="table-panel"><div className="table-summary"><strong>市场准备矩阵</strong><span>欧洲发布前仍需税费、地址、物流和法规配置</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>商品</th><th>美国市场</th><th>美国规格</th><th>欧洲市场</th><th>欧洲规格</th><th>操作</th></tr></thead><tbody>{products.map((product) => {
    const us = product.marketVersions.find((market) => market.market === "US"); const eu = product.marketVersions.find((market) => market.market === "EU"); const usActive = product.variants.filter((variant) => variant.prices.some((price) => price.market === "US" && price.active)).length; const euActive = product.variants.filter((variant) => variant.prices.some((price) => price.market === "EU" && price.active && price.price > 0)).length;
    return <tr key={product.id}><td><strong>{product.name}</strong><small className="cell-subline">{product.variants.length} 个物理 SKU</small></td><td><StatusBadge tone={us?.published ? "success" : "neutral"}>{us?.published ? "已发布" : "未发布"}</StatusBadge><small className="cell-subline">{money(us?.basePrice ?? 0, "USD")}</small></td><td>{usActive}/{product.variants.length}</td><td><StatusBadge tone={eu?.published ? "info" : "neutral"}>{eu?.published ? "准备发布" : "未发布"}</StatusBadge><small className="cell-subline">{money(eu?.basePrice ?? 0, "EUR")}</small></td><td>{euActive}/{product.variants.length}</td><td><Link href={`/products/${product.id}`} className="strong-link">管理价格</Link></td></tr>;
  })}</tbody></table></div></section></>;
}
