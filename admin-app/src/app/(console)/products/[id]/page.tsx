/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { addCompatibility, createVariant, deleteSpecification, deleteVariant, detachProductImage, removeCompatibility, saveSpecification, setPrimaryImage, setProductStatus, updateMarketVersion, updateProduct, updateVariant, uploadProductImages } from "@/app/actions";
import { Field, Notice, PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { prisma } from "@/lib/prisma";

const statusLabels = { DRAFT: "草稿", ACTIVE: "已上架", ARCHIVED: "已下架" } as const;
const decimal = (value: number) => (value / 100).toFixed(2);

export default async function ProductDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ message?: string; error?: string }> }) {
  const { id } = await params;
  const feedback = await searchParams;
  const [product, categories, compatibleProducts] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: {
      category: true, media: { orderBy: { position: "asc" } }, specifications: { orderBy: [{ group: "asc" }, { position: "asc" }] }, options: { include: { values: true }, orderBy: { position: "asc" } },
      marketVersions: { orderBy: { market: "asc" } }, variants: { include: { inventory: true, prices: true, optionValues: { include: { optionValue: { include: { option: true } } } } }, orderBy: { createdAt: "asc" } },
      accessoryLinks: { include: { compatibleProduct: true } },
    } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { id: { not: id }, productType: "E_BIKE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  const us = product.marketVersions.find((item) => item.market === "US");
  const eu = product.marketVersions.find((item) => item.market === "EU");
  if (!us || !eu) throw new Error("商品缺少 US 或 EU 市场版本，请检查迁移状态。");
  const returnTo = `/products/${product.id}`;
  const storefrontUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return <>
    <div className="breadcrumbs"><Link href="/products">商品</Link><span>/</span><span>{product.name}</span></div>
    <PageHeader title={product.name} description={`最后更新 ${product.updatedAt.toLocaleString("zh-CN")} · 物理 SKU 在 US/EU 共享库存`} action={<><StatusBadge tone={product.status === "ACTIVE" ? "success" : product.status === "ARCHIVED" ? "danger" : "warning"}>{statusLabels[product.status]}</StatusBadge><a href={`${storefrontUrl}/bikes/${product.slug}`} target="_blank" rel="noreferrer" className="secondary-button">预览美国商城</a></>} />
    <Notice message={feedback.message} error={feedback.error} />
    <div className="detail-layout">
      <div className="detail-main">
        <section className="panel"><div className="panel-heading"><div><h2>基础资料</h2><p>商城英文内容、分类和商品类型。</p></div></div><form action={updateProduct} className="form-grid form-grid-2">
          <input type="hidden" name="id" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} />
          <Field name="name" label="商品名称" value={product.name} /><Field name="slug" label="网址标识" value={product.slug} />
          <label className="field"><span>商品类型</span><select name="productType" defaultValue={product.productType}><option value="E_BIKE">电动自行车</option><option value="ACCESSORY">配件</option></select></label>
          <label className="field"><span>分类</span><select name="categoryId" defaultValue={product.categoryId ?? ""}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <Field name="tagline" label="英文宣传语" value={product.tagline} /><Field name="imageUrl" label="主图路径" value={product.imageUrl} />
          <label className="field field-span"><span>英文商品描述</span><textarea name="description" required rows={6} defaultValue={product.description} /></label>
          <Field name="motorWatts" label="整车电机功率 W" type="number" min="0" value={String(us.motorWatts)} /><Field name="speedMph" label="最高速度 mph" type="number" min="0" value={String(us.speedMph)} /><Field name="rangeMiles" label="标称续航 mi" type="number" min="0" value={String(us.rangeMiles)} />
          <label className="check-field"><input name="featured" type="checkbox" defaultChecked={product.featured} /><span>设为精选商品</span></label>
          <div className="form-actions field-span"><SubmitButton className="primary-button">保存基础资料</SubmitButton></div>
        </form></section>
        <section className="panel"><div className="panel-heading"><div><h2>市场发布与定价</h2><p>欧洲前台尚未开放，但可以先维护 EUR 价格和发布准备状态。</p></div></div><div className="market-editor-grid"><MarketEditor productId={product.id} market={us} returnTo={returnTo} /><MarketEditor productId={product.id} market={eu} returnTo={returnTo} /></div></section>
        <section className="panel"><div className="panel-heading"><div><h2>规格、价格与共享库存</h2><p>一个物理 SKU 对应一份库存，US 与 EU 只保存独立售价和启用状态。</p></div></div><div className="variant-list">{product.variants.map((variant) => {
          const usPrice = variant.prices.find((price) => price.market === "US");
          const euPrice = variant.prices.find((price) => price.market === "EU");
          return <details key={variant.id} className="variant-card"><summary><div><strong>{variant.sku}</strong><span>{variant.color} · {variant.batteryWh}Wh · {variant.tire}</span></div><div><StatusBadge tone={usPrice?.active ? "success" : "neutral"}>US {usPrice?.active ? "启用" : "停用"}</StatusBadge><StatusBadge tone={euPrice?.active ? "info" : "neutral"}>EU {euPrice?.active ? "启用" : "停用"}</StatusBadge><strong>{variant.inventory?.onHand ?? 0} 件</strong></div></summary><form action={updateVariant} className="form-grid form-grid-4">
            <input type="hidden" name="id" value={variant.id} /><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} />
            <Field name="sku" label="SKU" value={variant.sku} /><Field name="color" label="颜色" value={variant.color} /><Field name="colorHex" label="颜色代码" value={variant.colorHex} /><Field name="batteryWh" label="电池 Wh" type="number" min="0" value={String(variant.batteryWh)} />
            <Field name="motorWatts" label="电机 W" type="number" min="0" value={String(variant.motorWatts)} /><Field name="tire" label="轮胎" value={variant.tire} /><Field name="onHand" label={`共享库存（预留 ${variant.inventory?.reserved ?? 0}）`} type="number" min={String(variant.inventory?.reserved ?? 0)} value={String(variant.inventory?.onHand ?? 0)} />
            <div className="field" />
            <Field name="usPrice" label="美国售价 USD" type="number" min="0" step="0.01" value={decimal(usPrice?.price ?? variant.price)} /><label className="check-field"><input name="usActive" type="checkbox" defaultChecked={usPrice?.active ?? variant.active} /><span>美国启用</span></label>
            <Field name="euPrice" label="欧洲售价 EUR" type="number" min="0" step="0.01" value={decimal(euPrice?.price ?? 0)} /><label className="check-field"><input name="euActive" type="checkbox" defaultChecked={euPrice?.active ?? false} /><span>欧洲启用</span></label>
            <div className="form-actions field-span"><SubmitButton className="primary-button">保存规格</SubmitButton></div>
          </form><form action={deleteVariant} className="danger-row"><input type="hidden" name="id" value={variant.id} /><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><span>有历史订单的规格只会停用，不会删除记录。</span><SubmitButton pendingText="处理中…" className="danger-button">安全移除规格</SubmitButton></form></details>;
        })}</div><details className="inline-create"><summary>新增一个物理 SKU</summary><form action={createVariant} className="form-grid form-grid-4"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><Field name="sku" label="SKU" /><Field name="color" label="颜色" /><Field name="colorHex" label="颜色代码" value="#242528" /><Field name="batteryWh" label="电池 Wh" type="number" min="0" /><Field name="motorWatts" label="电机 W" type="number" min="0" value={String(us.motorWatts)} /><Field name="tire" label="轮胎" /><Field name="onHand" label="共享库存" type="number" min="0" value="0" /><Field name="usPrice" label="美国售价 USD" type="number" min="0" step="0.01" /><Field name="euPrice" label="欧洲售价 EUR" type="number" min="0" step="0.01" value="0" /><div className="form-actions field-span"><SubmitButton className="secondary-button">添加规格</SubmitButton></div></form></details></section>
        <section className="panel"><div className="panel-heading"><div><h2>技术参数</h2><p>按分组维护可扩展参数，不再受固定字段限制。</p></div></div><div className="spec-list">{product.specifications.map((spec) => <form action={saveSpecification} key={spec.id} className="spec-row"><input type="hidden" name="id" value={spec.id} /><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><Field name="group" label="分组" value={spec.group} /><Field name="name" label="名称" value={spec.name} /><Field name="value" label="数值" value={spec.value} /><Field name="unit" label="单位" value={spec.unit ?? ""} required={false} /><SubmitButton className="secondary-button">保存</SubmitButton><button formAction={deleteSpecification} className="quiet-danger">移除</button></form>)}</div><form action={saveSpecification} className="spec-row spec-new"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><Field name="group" label="新参数分组" value="General" /><Field name="name" label="名称" /><Field name="value" label="数值" /><Field name="unit" label="单位" required={false} /><SubmitButton className="secondary-button">添加参数</SubmitButton></form></section>
        {product.productType === "ACCESSORY" && <section className="panel"><div className="panel-heading"><div><h2>适配车型</h2><p>定义该配件兼容的电动自行车。</p></div></div><div className="compact-list">{product.accessoryLinks.map((link) => <div className="compact-row" key={link.id}><div><strong>{link.compatibleProduct.name}</strong><span>{link.note ?? "无补充说明"}</span></div><form action={removeCompatibility}><input type="hidden" name="id" value={link.id} /><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><SubmitButton className="quiet-danger">移除</SubmitButton></form></div>)}</div><form action={addCompatibility} className="inline-form"><input type="hidden" name="accessoryProductId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><label className="field"><span>兼容车型</span><select name="compatibleProductId" required><option value="">请选择</option>{compatibleProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><Field name="note" label="说明" required={false} /><SubmitButton className="secondary-button">保存兼容关系</SubmitButton></form></section>}
      </div>
      <aside className="detail-sidebar">
        <section className="panel sticky-panel"><h2>商品状态</h2><p>美国商城目前仍以全局状态为准。</p><div className="status-actions">{(["DRAFT", "ACTIVE", "ARCHIVED"] as const).map((status) => <form action={setProductStatus} key={status}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="status" value={status} /><input type="hidden" name="returnTo" value={returnTo} /><SubmitButton className={product.status === status ? "primary-button" : "secondary-button"}>{statusLabels[status]}</SubmitButton></form>)}</div><hr /><h3>结构化选项</h3><div className="option-summary">{product.options.map((option) => <div key={option.id}><strong>{option.name}</strong><span>{option.values.map((value) => value.value).join("、")}</span></div>)}</div></section>
        <section className="panel"><h2>商品图片</h2><p>上传后由商城图片接口提供，主图修改后美国商城刷新即可看到。</p><form action={uploadProductImages} className="form-stack"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={returnTo} /><input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/avif" multiple required /><SubmitButton pendingText="上传中…" className="secondary-button">上传图片</SubmitButton></form><div className="media-grid">{product.media.map((media) => <div key={media.id} className="media-item"><img src={`${storefrontUrl}${media.url}`} alt={media.altText} /><small>{media.url}</small>{product.imageUrl === media.url ? <StatusBadge tone="success">主图</StatusBadge> : <form action={setPrimaryImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageUrl" value={media.url} /><input type="hidden" name="returnTo" value={returnTo} /><SubmitButton className="quiet-link">设为主图</SubmitButton></form>}<form action={detachProductImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageUrl" value={media.url} /><input type="hidden" name="returnTo" value={returnTo} /><SubmitButton className="quiet-danger">解除关联</SubmitButton></form></div>)}</div></section>
      </aside>
    </div>
  </>;
}

function MarketEditor({ productId, market, returnTo }: { productId: string; market: { market: "US" | "EU"; currency: string; basePrice: number; published: boolean; locale: string; seoTitle: string | null; seoDescription: string | null }; returnTo: string }) {
  return <form action={updateMarketVersion} className="market-editor"><input type="hidden" name="productId" value={productId} /><input type="hidden" name="market" value={market.market} /><input type="hidden" name="returnTo" value={returnTo} /><div className="market-title"><div><strong>{market.market}</strong><span>{market.currency}</span></div><StatusBadge tone={market.published ? "success" : "neutral"}>{market.published ? "已发布" : "未发布"}</StatusBadge></div><Field name="basePrice" label={`展示起价 ${market.currency}`} type="number" min="0" step="0.01" value={decimal(market.basePrice)} /><Field name="locale" label="语言区域" value={market.locale} /><Field name="seoTitle" label="SEO 标题" value={market.seoTitle ?? ""} required={false} /><label className="field"><span>SEO 描述</span><textarea name="seoDescription" rows={3} defaultValue={market.seoDescription ?? ""} /></label><label className="check-field"><input name="published" type="checkbox" defaultChecked={market.published} /><span>市场发布准备完成</span></label><SubmitButton className="secondary-button">保存 {market.market} 市场</SubmitButton></form>;
}
