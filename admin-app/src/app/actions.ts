"use server";

import { randomUUID, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { clearAdminSession, createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const text = (label: string, max: number) => z.string().trim().min(1, `${label}不能为空`).max(max, `${label}内容过长`);
const optionalText = (max: number) => z.string().trim().max(max, "内容过长").optional().transform((value) => value || null);
const wholeNumber = (label: string, max = 100000) => z.coerce.number().int(`${label}必须是整数`).min(0, `${label}不能小于 0`).max(max, `${label}数值过大`);
const moneyInput = z.coerce.number().finite().min(0, "价格不能小于 0").max(100000, "价格数值过大").transform((value) => Math.round(value * 100));
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "网址标识只能包含小写字母、数字和连字符").max(100);
const colorHex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "颜色代码必须类似 #242528");

const productSchema = z.object({
  id: z.string().min(1),
  name: text("商品名称", 120),
  slug,
  tagline: text("宣传语", 180),
  description: text("商品描述", 5000),
  imageUrl: text("主图路径", 500),
  featured: z.boolean(),
  categoryId: z.string().optional().transform((value) => value || null),
  productType: z.enum(["E_BIKE", "ACCESSORY"]),
  motorWatts: wholeNumber("电机功率", 5000),
  speedMph: wholeNumber("速度", 100),
  rangeMiles: wholeNumber("续航里程", 1000),
});

const createProductSchema = productSchema.omit({ id: true, featured: true }).extend({
  sku: text("SKU", 100),
  color: text("颜色名称", 100),
  colorHex,
  batteryWh: wholeNumber("电池容量", 10000),
  variantMotorWatts: wholeNumber("规格电机功率", 5000),
  tire: text("轮胎规格", 120),
  usPrice: moneyInput,
  stock: wholeNumber("初始库存", 100000),
});

const variantSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sku: text("SKU", 100),
  color: text("颜色名称", 100),
  colorHex,
  batteryWh: wholeNumber("电池容量", 10000),
  motorWatts: wholeNumber("电机功率", 5000),
  tire: text("轮胎规格", 120),
  usPrice: moneyInput,
  euPrice: moneyInput,
  onHand: wholeNumber("库存", 100000),
  usActive: z.boolean(),
  euActive: z.boolean(),
});

const createVariantSchema = variantSchema.omit({ id: true, usActive: true, euActive: true });
const marketSchema = z.object({
  productId: z.string().min(1),
  market: z.enum(["US", "EU"]),
  basePrice: moneyInput,
  published: z.boolean(),
  locale: text("语言区域", 20),
  seoTitle: optionalText(180),
  seoDescription: optionalText(500),
});
const specificationSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  group: text("参数分组", 80),
  name: text("参数名称", 100),
  value: text("参数值", 300),
  unit: optionalText(30),
});

type Actor = Awaited<ReturnType<typeof requireAdmin>>;
type DbClient = Prisma.TransactionClient | typeof prisma;

function same(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "提交内容有误";
}

function errorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "网址标识、SKU 或名称已被使用，请更换后重试。";
    if (error.code === "P2003") return "这条数据已被订单或其他记录引用，不能直接删除。";
    if (error.code === "P2025") return "目标记录不存在或已经变更，请刷新后重试。";
  }
  return error instanceof Error ? error.message : "操作失败，请重试。";
}

function safeDestination(form: FormData, fallback: string) {
  const candidate = String(form.get("returnTo") ?? fallback);
  return candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : fallback;
}

function finish(form: FormData, message: string, kind: "message" | "error" = "message", fallback = "/products"): never {
  const destination = new URL(safeDestination(form, fallback), "http://admin.local");
  destination.searchParams.set(kind, message);
  redirect(`${destination.pathname}${destination.search}${destination.hash}`);
}

async function audit(db: DbClient, actor: Actor, action: string, entityType: string, entityId: string | null, summary: string, before?: unknown, after?: unknown) {
  const normalize = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  await db.auditLog.create({
    data: {
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      entityType,
      entityId,
      summary,
      before: before === undefined ? undefined : normalize(before),
      after: after === undefined ? undefined : normalize(after),
    },
  });
}

async function refreshProductPrices(db: Prisma.TransactionClient, productId: string) {
  for (const market of ["US", "EU"] as const) {
    const prices = await db.variantPrice.findMany({ where: { variant: { productId }, market, active: true, price: { gt: 0 } }, select: { price: true } });
    await db.marketVersion.update({ where: { productId_market: { productId, market } }, data: { basePrice: prices.length > 0 ? Math.min(...prices.map((item) => item.price)) : 0 } });
  }
}

async function syncVariantOptions(db: Prisma.TransactionClient, productId: string, variantId: string, values: { color: string; batteryWh: number; tire: string }) {
  const entries = [
    { name: "Color", value: values.color, position: 0 },
    { name: "Battery", value: `${values.batteryWh}Wh`, position: 1 },
    { name: "Tire", value: values.tire, position: 2 },
  ];
  await db.variantOptionValue.deleteMany({ where: { variantId } });
  for (const entry of entries) {
    const option = await db.productOption.upsert({
      where: { productId_name: { productId, name: entry.name } },
      update: { position: entry.position },
      create: { productId, name: entry.name, position: entry.position },
    });
    const optionValue = await db.productOptionValue.upsert({
      where: { optionId_value: { optionId: option.id, value: entry.value } },
      update: {},
      create: { optionId: option.id, value: entry.value },
    });
    await db.variantOptionValue.create({ data: { variantId, optionValueId: optionValue.id } });
  }
}

function productUploadDirectory() {
  if (process.env.PRODUCT_UPLOAD_DIR) return path.resolve(process.env.PRODUCT_UPLOAD_DIR);
  const cwd = process.cwd();
  const root = existsSync(path.join(cwd, "admin-app")) ? cwd : path.resolve(cwd, "..");
  return path.join(root, "storage", "product-images");
}

export async function login(form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !same(email, expectedEmail) || !same(password, expectedPassword)) redirect("/login?error=1");
  await createAdminSession(email);
  redirect("/dashboard");
}

export async function logout() {
  await clearAdminSession();
  redirect("/login");
}

export async function createCategory(form: FormData) {
  const actor = await requireAdmin();
  const parsed = z.object({ name: text("分类名称", 80), slug, description: optionalText(500) }).safeParse({
    name: form.get("name"), slug: form.get("slug"), description: String(form.get("description") ?? ""),
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  try {
    const category = await prisma.category.create({ data: parsed.data });
    await audit(prisma, actor, "CREATE", "Category", category.id, `创建分类 ${category.name}`, undefined, parsed.data);
  } catch (error) {
    finish(form, errorMessage(error), "error");
  }
  revalidatePath("/products");
  finish(form, "商品分类已创建。");
}

export async function createProduct(form: FormData) {
  const actor = await requireAdmin();
  const parsed = createProductSchema.safeParse({
    name: form.get("name"), slug: form.get("slug"), tagline: form.get("tagline"), description: form.get("description"),
    imageUrl: form.get("imageUrl") || "/images/rivet-hero.png", categoryId: form.get("categoryId"), productType: form.get("productType") || "E_BIKE",
    motorWatts: form.get("motorWatts"), speedMph: form.get("speedMph"), rangeMiles: form.get("rangeMiles"),
    sku: form.get("sku"), color: form.get("color"), colorHex: form.get("colorHex"), batteryWh: form.get("batteryWh"),
    variantMotorWatts: form.get("variantMotorWatts"), tire: form.get("tire"), usPrice: form.get("usPrice"), stock: form.get("stock"),
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  let productId = "";
  try {
    productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name, slug: data.slug, tagline: data.tagline, description: data.description,
          imageUrl: data.imageUrl, imageUrls: [data.imageUrl], productType: data.productType, categoryId: data.categoryId, status: "DRAFT",
          media: { create: { url: data.imageUrl, altText: data.name, position: 0 } },
          specifications: { create: [
            { group: "Performance", name: "Motor", value: String(data.motorWatts), unit: "W", position: 0 },
            { group: "Performance", name: "Top speed", value: String(data.speedMph), unit: "mph", position: 1 },
            { group: "Performance", name: "Range", value: String(data.rangeMiles), unit: "mi", position: 2 },
          ] },
          marketVersions: { create: [
            { market: "US", currency: "USD", basePrice: data.usPrice, motorWatts: data.motorWatts, speedMph: data.speedMph, rangeMiles: data.rangeMiles, locale: "en-US" },
            { market: "EU", currency: "EUR", basePrice: 0, motorWatts: data.motorWatts, speedMph: 0, rangeMiles: 0, locale: "en-IE" },
          ] },
        },
      });
      const usMarket = await tx.marketVersion.findUniqueOrThrow({ where: { productId_market: { productId: product.id, market: "US" } } });
      const variant = await tx.variant.create({
        data: {
          productId: product.id, marketVersionId: usMarket.id, sku: data.sku, color: data.color, colorHex: data.colorHex,
          batteryWh: data.batteryWh, motorWatts: data.variantMotorWatts, tire: data.tire, price: data.usPrice,
          inventory: { create: { onHand: data.stock } },
          prices: { create: [
            { market: "US", currency: "USD", price: data.usPrice, active: true },
            { market: "EU", currency: "EUR", price: 0, active: false },
          ] },
        },
      });
      await syncVariantOptions(tx, product.id, variant.id, data);
      await audit(tx, actor, "CREATE", "Product", product.id, `创建草稿商品 ${product.name}`, undefined, { slug: product.slug, sku: data.sku });
      return product.id;
    });
  } catch (error) {
    finish(form, errorMessage(error), "error");
  }
  revalidatePath("/products");
  redirect(`/products/${productId}?message=${encodeURIComponent("商品已创建为草稿，请继续完善 US/EU 市场资料。")}`);
}

export async function updateProduct(form: FormData) {
  const actor = await requireAdmin();
  const parsed = productSchema.safeParse({
    id: form.get("id"), name: form.get("name"), slug: form.get("slug"), tagline: form.get("tagline"),
    description: form.get("description"), imageUrl: form.get("imageUrl"), featured: form.get("featured") === "on",
    categoryId: form.get("categoryId"), productType: form.get("productType") || "E_BIKE", motorWatts: form.get("motorWatts"),
    speedMph: form.get("speedMph"), rangeMiles: form.get("rangeMiles"),
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.product.findUniqueOrThrow({ where: { id: data.id }, select: { name: true, slug: true, featured: true, categoryId: true, productType: true, imageUrls: true } });
      const imageUrls = [...new Set([data.imageUrl, ...before.imageUrls])];
      await tx.product.update({ where: { id: data.id }, data: { name: data.name, slug: data.slug, tagline: data.tagline, description: data.description, imageUrl: data.imageUrl, imageUrls, featured: data.featured, categoryId: data.categoryId, productType: data.productType } });
      await tx.productMedia.upsert({ where: { productId_url: { productId: data.id, url: data.imageUrl } }, update: { altText: data.name }, create: { productId: data.id, url: data.imageUrl, altText: data.name } });
      await tx.marketVersion.update({ where: { productId_market: { productId: data.id, market: "US" } }, data: { motorWatts: data.motorWatts, speedMph: data.speedMph, rangeMiles: data.rangeMiles } });
      await audit(tx, actor, "UPDATE", "Product", data.id, `更新商品 ${data.name}`, before, { name: data.name, slug: data.slug, featured: data.featured, categoryId: data.categoryId, productType: data.productType });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error");
  }
  revalidatePath("/products");
  revalidatePath(`/products/${data.id}`);
  finish(form, "商品基础资料已保存，美国商城刷新后立即读取新资料。", "message", `/products/${data.id}`);
}

export async function updateMarketVersion(form: FormData) {
  const actor = await requireAdmin();
  const parsed = marketSchema.safeParse({
    productId: form.get("productId"), market: form.get("market"), basePrice: form.get("basePrice"),
    published: form.get("published") === "on", locale: form.get("locale"), seoTitle: String(form.get("seoTitle") ?? ""), seoDescription: String(form.get("seoDescription") ?? ""),
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      if (data.published) {
        const activePrices = await tx.variantPrice.count({ where: { variant: { productId: data.productId }, market: data.market, active: true, price: { gt: 0 } } });
        if (activePrices === 0) throw new Error(`${data.market} 市场至少需要一个已启用且价格大于 0 的规格才能发布。`);
      }
      const before = await tx.marketVersion.findUniqueOrThrow({ where: { productId_market: { productId: data.productId, market: data.market } } });
      await tx.marketVersion.update({ where: { id: before.id }, data: { basePrice: data.basePrice, published: data.published, locale: data.locale, seoTitle: data.seoTitle, seoDescription: data.seoDescription } });
      await audit(tx, actor, "UPDATE_MARKET", "Product", data.productId, `更新 ${data.market} 市场发布资料`, { published: before.published, basePrice: before.basePrice }, { published: data.published, basePrice: data.basePrice });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error");
  }
  revalidatePath(`/products/${data.productId}`);
  revalidatePath("/settings/markets");
  finish(form, `${data.market} 市场资料已保存。`, "message", `/products/${data.productId}`);
}

export async function setProductStatus(form: FormData) {
  const actor = await requireAdmin();
  const parsed = z.object({ id: z.string().min(1), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]) }).safeParse({ id: form.get("id"), status: form.get("status") });
  if (!parsed.success) finish(form, "商品状态无效。", "error");
  const { id, status } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id }, include: { variants: { where: { active: true } }, marketVersions: { where: { market: "US" } } } });
      if (status === "ACTIVE" && (product.variants.length === 0 || product.marketVersions.length === 0)) throw new Error("商品至少需要一个启用的美国市场规格才能上架。");
      await tx.product.update({ where: { id }, data: { status } });
      await tx.marketVersion.update({ where: { productId_market: { productId: id, market: "US" } }, data: { published: status === "ACTIVE" } });
      await audit(tx, actor, "STATUS", "Product", id, `商品状态改为 ${status}`, { status: product.status }, { status });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error");
  }
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  finish(form, "商品状态已更新。", "message", `/products/${id}`);
}

export async function uploadProductImages(form: FormData) {
  const actor = await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  if (!productId) finish(form, "缺少商品编号。", "error");
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0) finish(form, "请选择至少一张图片。", "error", `/products/${productId}`);
  if (files.length > 6) finish(form, "每次最多上传 6 张图片。", "error", `/products/${productId}`);
  const extensionByType: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
  if (files.reduce((sum, file) => sum + file.size, 0) > 24 * 1024 * 1024) finish(form, "本次图片总大小不能超过 24MB。", "error", `/products/${productId}`);
  for (const file of files) {
    if (!extensionByType[file.type]) finish(form, "仅支持 JPG、PNG、WebP 和 AVIF 图片。", "error", `/products/${productId}`);
    if (file.size > 8 * 1024 * 1024) finish(form, `图片 ${file.name} 超过 8MB。`, "error", `/products/${productId}`);
  }
  try {
    const current = await prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { name: true, imageUrl: true, imageUrls: true, media: { select: { position: true } } } });
    const uploadDir = productUploadDirectory();
    await mkdir(uploadDir, { recursive: true });
    const newUrls: string[] = [];
    for (const file of files) {
      const filename = `${randomUUID()}.${extensionByType[file.type]}`;
      await writeFile(path.join(/* turbopackIgnore: true */ uploadDir, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
      newUrls.push(`/api/product-images/${filename}`);
    }
    await prisma.$transaction(async (tx) => {
      const imageUrls = [...new Set([...current.imageUrls, ...newUrls])];
      const imageUrl = current.imageUrls.length === 0 ? newUrls[0] : current.imageUrl;
      await tx.product.update({ where: { id: productId }, data: { imageUrl, imageUrls } });
      const start = current.media.reduce((max, item) => Math.max(max, item.position), -1) + 1;
      for (const [index, url] of newUrls.entries()) await tx.productMedia.create({ data: { productId, url, altText: current.name, position: start + index } });
      await audit(tx, actor, "UPLOAD_MEDIA", "Product", productId, `上传 ${newUrls.length} 张商品图片`, undefined, { urls: newUrls });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${productId}`);
  }
  revalidatePath(`/products/${productId}`);
  finish(form, `已上传 ${files.length} 张图片。`, "message", `/products/${productId}`);
}

export async function setPrimaryImage(form: FormData) {
  const actor = await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const imageUrl = String(form.get("imageUrl") ?? "");
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { imageUrl: true, imageUrls: true } });
  if (!product || !product.imageUrls.includes(imageUrl)) finish(form, "图片不存在或不属于该商品。", "error", `/products/${productId}`);
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { imageUrl } });
    await audit(tx, actor, "PRIMARY_MEDIA", "Product", productId, "更新商品主图", { imageUrl: product.imageUrl }, { imageUrl });
  });
  revalidatePath(`/products/${productId}`);
  finish(form, "商品主图已更新。", "message", `/products/${productId}`);
}

export async function detachProductImage(form: FormData) {
  const actor = await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const imageUrl = String(form.get("imageUrl") ?? "");
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { imageUrl: true, imageUrls: true } });
  if (!product || !product.imageUrls.includes(imageUrl)) finish(form, "图片不存在或不属于该商品。", "error", `/products/${productId}`);
  if (product.imageUrls.length <= 1) finish(form, "商品至少需要保留一张图片。", "error", `/products/${productId}`);
  const imageUrls = product.imageUrls.filter((item) => item !== imageUrl);
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { imageUrls, imageUrl: product.imageUrl === imageUrl ? imageUrls[0] : product.imageUrl } });
    await tx.productMedia.deleteMany({ where: { productId, url: imageUrl } });
    await audit(tx, actor, "DETACH_MEDIA", "Product", productId, "从商品解除图片关联", { imageUrl }, undefined);
  });
  revalidatePath(`/products/${productId}`);
  finish(form, "图片已从商品中移除，磁盘原文件仍保留。", "message", `/products/${productId}`);
}

export async function createVariant(form: FormData) {
  const actor = await requireAdmin();
  const parsed = createVariantSchema.safeParse({
    productId: form.get("productId"), sku: form.get("sku"), color: form.get("color"), colorHex: form.get("colorHex"), batteryWh: form.get("batteryWh"),
    motorWatts: form.get("motorWatts"), tire: form.get("tire"), usPrice: form.get("usPrice"), euPrice: form.get("euPrice") || 0, onHand: form.get("onHand"),
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const market = await tx.marketVersion.findUniqueOrThrow({ where: { productId_market: { productId: data.productId, market: "US" } } });
      const variant = await tx.variant.create({ data: {
        productId: data.productId, marketVersionId: market.id, sku: data.sku, color: data.color, colorHex: data.colorHex,
        batteryWh: data.batteryWh, motorWatts: data.motorWatts, tire: data.tire, price: data.usPrice,
        inventory: { create: { onHand: data.onHand } }, prices: { create: [
          { market: "US", currency: "USD", price: data.usPrice, active: true },
          { market: "EU", currency: "EUR", price: data.euPrice, active: false },
        ] },
      } });
      await syncVariantOptions(tx, data.productId, variant.id, data);
      await refreshProductPrices(tx, data.productId);
      await audit(tx, actor, "CREATE", "Variant", variant.id, `新增规格 ${data.sku}`, undefined, { productId: data.productId, usPrice: data.usPrice, euPrice: data.euPrice });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${data.productId}`);
  }
  revalidatePath(`/products/${data.productId}`);
  finish(form, "新规格已添加，并建立 US/EU 独立价格。", "message", `/products/${data.productId}`);
}

export async function updateVariant(form: FormData) {
  const actor = await requireAdmin();
  const parsed = variantSchema.safeParse({
    id: form.get("id"), productId: form.get("productId"), sku: form.get("sku"), color: form.get("color"), colorHex: form.get("colorHex"),
    batteryWh: form.get("batteryWh"), motorWatts: form.get("motorWatts"), tire: form.get("tire"), usPrice: form.get("usPrice"), euPrice: form.get("euPrice"),
    onHand: form.get("onHand"), usActive: form.get("usActive") === "on", euActive: form.get("euActive") === "on",
  });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  if (data.euActive && data.euPrice <= 0) finish(form, "启用欧洲销售前必须填写大于 0 的 EUR 价格。", "error", `/products/${data.productId}`);
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.variant.findUniqueOrThrow({ where: { id: data.id }, include: { inventory: true, prices: true } });
      if (current.productId !== data.productId) throw new Error("规格与商品不匹配。");
      if (data.onHand < (current.inventory?.reserved ?? 0)) throw new Error(`库存不能低于已预留数量 ${current.inventory?.reserved ?? 0}。`);
      if (!data.usActive && current.active) {
        const activeCount = await tx.variant.count({ where: { productId: data.productId, active: true } });
        const product = await tx.product.findUniqueOrThrow({ where: { id: data.productId }, select: { status: true } });
        if (activeCount <= 1 && product.status === "ACTIVE") throw new Error("已上架商品至少需要一个启用的美国规格；请先下架商品。");
      }
      await tx.variant.update({ where: { id: data.id }, data: { sku: data.sku, color: data.color, colorHex: data.colorHex, batteryWh: data.batteryWh, motorWatts: data.motorWatts, tire: data.tire, price: data.usPrice, active: data.usActive } });
      await tx.inventory.upsert({ where: { variantId: data.id }, update: { onHand: data.onHand }, create: { variantId: data.id, onHand: data.onHand } });
      await tx.variantPrice.upsert({ where: { variantId_market: { variantId: data.id, market: "US" } }, update: { price: data.usPrice, active: data.usActive, currency: "USD" }, create: { variantId: data.id, market: "US", currency: "USD", price: data.usPrice, active: data.usActive } });
      await tx.variantPrice.upsert({ where: { variantId_market: { variantId: data.id, market: "EU" } }, update: { price: data.euPrice, active: data.euActive, currency: "EUR" }, create: { variantId: data.id, market: "EU", currency: "EUR", price: data.euPrice, active: data.euActive } });
      await syncVariantOptions(tx, data.productId, data.id, data);
      await refreshProductPrices(tx, data.productId);
      await audit(tx, actor, "UPDATE", "Variant", data.id, `更新规格 ${data.sku}`, { sku: current.sku, onHand: current.inventory?.onHand, prices: current.prices }, { sku: data.sku, onHand: data.onHand, usPrice: data.usPrice, euPrice: data.euPrice, usActive: data.usActive, euActive: data.euActive });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${data.productId}`);
  }
  revalidatePath(`/products/${data.productId}`);
  finish(form, "规格、共享库存和 US/EU 价格已保存。", "message", `/products/${data.productId}`);
}

export async function deleteVariant(form: FormData) {
  const actor = await requireAdmin();
  const productId = String(form.get("productId") ?? "");
  const variantId = String(form.get("id") ?? "");
  try {
    await prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUniqueOrThrow({ where: { id: variantId } });
      if (variant.productId !== productId) throw new Error("规格与商品不匹配。");
      const [remaining, orderCount] = await Promise.all([tx.variant.count({ where: { productId } }), tx.orderItem.count({ where: { variantId } })]);
      if (remaining <= 1) throw new Error("商品至少需要保留一个规格。");
      if (orderCount > 0) {
        await tx.variant.update({ where: { id: variantId }, data: { active: false } });
        await tx.variantPrice.updateMany({ where: { variantId }, data: { active: false } });
        await audit(tx, actor, "DEACTIVATE", "Variant", variantId, `规格 ${variant.sku} 已有订单，安全停用`, { active: true }, { active: false });
        return;
      }
      await tx.variant.delete({ where: { id: variantId } });
      await refreshProductPrices(tx, productId);
      await audit(tx, actor, "DELETE", "Variant", variantId, `删除无订单规格 ${variant.sku}`);
    });
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${productId}`);
  }
  revalidatePath(`/products/${productId}`);
  finish(form, "规格已安全处理。", "message", `/products/${productId}`);
}

export async function saveSpecification(form: FormData) {
  const actor = await requireAdmin();
  const parsed = specificationSchema.safeParse({ id: String(form.get("id") ?? "") || undefined, productId: form.get("productId"), group: form.get("group"), name: form.get("name"), value: form.get("value"), unit: String(form.get("unit") ?? "") });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  const data = parsed.data;
  try {
    const specification = data.id
      ? await prisma.productSpecification.update({ where: { id: data.id }, data: { group: data.group, name: data.name, value: data.value, unit: data.unit } })
      : await prisma.productSpecification.create({ data: { productId: data.productId, group: data.group, name: data.name, value: data.value, unit: data.unit } });
    await audit(prisma, actor, data.id ? "UPDATE" : "CREATE", "ProductSpecification", specification.id, `${data.id ? "更新" : "新增"}参数 ${data.name}`, undefined, data);
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${data.productId}`);
  }
  revalidatePath(`/products/${data.productId}`);
  finish(form, "技术参数已保存。", "message", `/products/${data.productId}`);
}

export async function deleteSpecification(form: FormData) {
  const actor = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const productId = String(form.get("productId") ?? "");
  try {
    const specification = await prisma.productSpecification.delete({ where: { id } });
    await audit(prisma, actor, "DELETE", "ProductSpecification", id, `删除参数 ${specification.name}`, specification, undefined);
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${productId}`);
  }
  revalidatePath(`/products/${productId}`);
  finish(form, "技术参数已移除。", "message", `/products/${productId}`);
}

export async function addCompatibility(form: FormData) {
  const actor = await requireAdmin();
  const parsed = z.object({ accessoryProductId: z.string().min(1), compatibleProductId: z.string().min(1), note: optionalText(300) }).safeParse({ accessoryProductId: form.get("accessoryProductId"), compatibleProductId: form.get("compatibleProductId"), note: String(form.get("note") ?? "") });
  if (!parsed.success) finish(form, firstIssue(parsed.error), "error");
  if (parsed.data.accessoryProductId === parsed.data.compatibleProductId) finish(form, "商品不能与自身建立兼容关系。", "error");
  try {
    const link = await prisma.productCompatibility.upsert({ where: { accessoryProductId_compatibleProductId: { accessoryProductId: parsed.data.accessoryProductId, compatibleProductId: parsed.data.compatibleProductId } }, update: { note: parsed.data.note }, create: parsed.data });
    await audit(prisma, actor, "UPSERT", "ProductCompatibility", link.id, "更新配件兼容关系", undefined, parsed.data);
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${parsed.data.accessoryProductId}`);
  }
  revalidatePath(`/products/${parsed.data.accessoryProductId}`);
  finish(form, "兼容车型已保存。", "message", `/products/${parsed.data.accessoryProductId}`);
}

export async function removeCompatibility(form: FormData) {
  const actor = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const productId = String(form.get("productId") ?? "");
  try {
    await prisma.productCompatibility.delete({ where: { id } });
    await audit(prisma, actor, "DELETE", "ProductCompatibility", id, "移除配件兼容关系");
  } catch (error) {
    finish(form, errorMessage(error), "error", `/products/${productId}`);
  }
  revalidatePath(`/products/${productId}`);
  finish(form, "兼容关系已移除。", "message", `/products/${productId}`);
}

export async function updateOrderStatus(form: FormData) {
  const actor = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const next = String(form.get("status")) as "PENDING" | "APPROVED" | "CANCELLED" | "FULFILLED";
  if (!["PENDING", "APPROVED", "CANCELLED", "FULFILLED"].includes(next)) finish(form, "付款和退款状态不能由后台手动伪造。", "error", "/orders");
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
      const allowed = order.status === next ||
        (["PENDING", "APPROVED"].includes(order.status) && next === "CANCELLED") ||
        (order.status === "PAID" && next === "FULFILLED");
      if (!allowed) throw new Error(`不允许把订单从 ${order.status} 改为 ${next}。`);
      if (next === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          const result = await tx.inventory.updateMany({ where: { variantId: item.variantId, reserved: { gte: item.quantity } }, data: { reserved: { decrement: item.quantity } } });
          if (result.count !== 1) throw new Error(`SKU ${item.sku} 的预留库存状态异常，已停止取消订单。`);
        }
      }
      await tx.order.update({ where: { id }, data: { status: next } });
      await audit(tx, actor, "STATUS", "Order", id, `订单 ${order.orderNumber} 状态改为 ${next}`, { status: order.status }, { status: next });
    });
  } catch (error) {
    finish(form, errorMessage(error), "error", "/orders");
  }
  revalidatePath("/orders");
  finish(form, "订单状态已保存。", "message", "/orders");
}

export async function updateInquiryStatus(form: FormData) {
  const actor = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status")) as "NEW" | "CONTACTED" | "QUALIFIED" | "QUOTED" | "NEGOTIATING" | "WON" | "LOST";
  try {
    const before = await prisma.inquiry.findUniqueOrThrow({ where: { id }, select: { status: true, contactName: true } });
    await prisma.inquiry.update({ where: { id }, data: { status } });
    await audit(prisma, actor, "STATUS", "Inquiry", id, `询盘 ${before.contactName} 状态改为 ${status}`, { status: before.status }, { status });
  } catch (error) {
    finish(form, errorMessage(error), "error", "/inquiries");
  }
  revalidatePath("/inquiries");
  finish(form, "询盘状态已保存。", "message", "/inquiries");
}
