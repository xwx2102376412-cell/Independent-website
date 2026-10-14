/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { createCategory, createProduct } from "@/app/actions";
import { Field, Notice, PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const statusLabels = { DRAFT: "草稿", ACTIVE: "已上架", ARCHIVED: "已下架" } as const;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; message?: string; error?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = ["DRAFT", "ACTIVE", "ARCHIVED"].includes(params.status ?? "") ? params.status as "DRAFT" | "ACTIVE" | "ARCHIVED" : undefined;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { ...(status ? { status } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] } : {}) },
      include: { category: true, marketVersions: true, variants: { include: { prices: true, inventory: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <>
    <PageHeader title="商品" description="集中管理商品资料、物理 SKU、共享库存以及 US/USD 与 EU/EUR 市场价格。" action={<a href="#new-product" className="primary-button">新增商品</a>} />
    <Notice message={params.message} error={params.error} />
    <form className="filter-bar">
      <input name="q" defaultValue={q} placeholder="搜索商品名称、Slug 或 SKU" />
      <select name="status" defaultValue={status ?? ""}><option value="">全部状态</option><option value="DRAFT">草稿</option><option value="ACTIVE">已上架</option><option value="ARCHIVED">已下架</option></select>
      <button className="secondary-button">筛选</button>
      {(q || status) && <Link href="/products" className="quiet-link">清除</Link>}
    </form>
    <section className="table-panel">
      <div className="table-summary"><strong>{products.length} 个商品</strong><span>欧洲价格不会自动按汇率生成</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>商品</th><th>分类</th><th>状态</th><th>市场</th><th>规格</th><th>库存</th><th>更新时间</th></tr></thead><tbody>{products.map((product) => {
        const us = product.marketVersions.find((item) => item.market === "US");
        const eu = product.marketVersions.find((item) => item.market === "EU");
        const stock = product.variants.reduce((sum, item) => sum + (item.inventory?.onHand ?? 0), 0);
        const reserved = product.variants.reduce((sum, item) => sum + (item.inventory?.reserved ?? 0), 0);
        return <tr key={product.id}><td><Link href={`/products/${product.id}`} className="product-cell"><img src={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${product.imageUrl}`} alt="" /><span><strong>{product.name}</strong><small>{product.slug}</small></span></Link></td><td>{product.category?.name ?? "未分类"}</td><td><StatusBadge tone={product.status === "ACTIVE" ? "success" : product.status === "ARCHIVED" ? "danger" : "warning"}>{statusLabels[product.status]}</StatusBadge></td><td><div className="market-stack"><span>US {us?.published ? "已发布" : "未发布"} · {money(us?.basePrice ?? 0, "USD")}</span><span>EU {eu?.published ? "已发布" : "未发布"} · {money(eu?.basePrice ?? 0, "EUR")}</span></div></td><td>{product.variants.length}</td><td>{stock - reserved} 可售<small className="cell-subline">{reserved} 已预留</small></td><td>{product.updatedAt.toLocaleDateString("zh-CN")}</td></tr>;
      })}</tbody></table></div>
      {products.length === 0 && <div className="empty-copy">没有符合当前筛选条件的商品。</div>}
    </section>
    <div className="two-column-section">
      <details id="new-product" className="panel" open><summary><h2>新增草稿商品</h2><span>同时建立美国和欧洲市场资料</span></summary><form action={createProduct} className="form-grid form-grid-3">
        <input type="hidden" name="returnTo" value="/products" />
        <Field name="name" label="商品名称" /><Field name="slug" label="网址标识" /><label className="field"><span>商品类型</span><select name="productType" defaultValue="E_BIKE"><option value="E_BIKE">电动自行车</option><option value="ACCESSORY">配件</option></select></label>
        <label className="field"><span>分类</span><select name="categoryId" defaultValue={categories[0]?.id ?? ""}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <Field name="tagline" label="英文宣传语" /><Field name="imageUrl" label="初始图片路径" value="/images/rivet-hero.png" />
        <label className="field field-span"><span>英文商品描述</span><textarea name="description" required rows={4} /></label>
        <Field name="motorWatts" label="整车电机功率 W" type="number" min="0" /><Field name="speedMph" label="最高速度 mph" type="number" min="0" /><Field name="rangeMiles" label="标称续航 mi" type="number" min="0" />
        <Field name="sku" label="首个 SKU" /><Field name="color" label="颜色" /><Field name="colorHex" label="颜色代码" value="#242528" />
        <Field name="batteryWh" label="电池容量 Wh" type="number" min="0" /><Field name="variantMotorWatts" label="规格电机功率 W" type="number" min="0" /><Field name="tire" label="轮胎规格" />
        <Field name="usPrice" label="美国售价 USD" type="number" min="0" step="0.01" /><Field name="stock" label="初始共享库存" type="number" min="0" value="0" />
        <div className="form-actions field-span"><SubmitButton className="primary-button">创建草稿商品</SubmitButton></div>
      </form></details>
      <details className="panel"><summary><h2>新增分类</h2><span>商品可重新归类</span></summary><form action={createCategory} className="form-stack"><input type="hidden" name="returnTo" value="/products" /><Field name="name" label="分类名称" /><Field name="slug" label="分类 Slug" /><label className="field"><span>说明</span><textarea name="description" rows={3} /></label><SubmitButton className="secondary-button">保存分类</SubmitButton></form></details>
    </div>
  </>;
}
