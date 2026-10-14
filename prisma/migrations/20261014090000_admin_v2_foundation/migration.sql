CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

ALTER TABLE "Product"
  ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'E_BIKE',
  ADD COLUMN "categoryId" TEXT;

ALTER TABLE "MarketVersion"
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT;

ALTER TABLE "Variant" ADD COLUMN "productId" TEXT;

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductMedia" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
  "url" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductSpecification" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "group" TEXT NOT NULL DEFAULT 'General',
  "name" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "unit" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOption" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOptionValue" (
  "id" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VariantOptionValue" (
  "variantId" TEXT NOT NULL,
  "optionValueId" TEXT NOT NULL,
  CONSTRAINT "VariantOptionValue_pkey" PRIMARY KEY ("variantId", "optionValueId")
);

CREATE TABLE "VariantPrice" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "market" "MarketCode" NOT NULL,
  "currency" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "compareAtPrice" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VariantPrice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductCompatibility" (
  "id" TEXT NOT NULL,
  "accessoryProductId" TEXT NOT NULL,
  "compatibleProductId" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCompatibility_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminRole" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "passwordHash" TEXT,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "actorEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "summary" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE UNIQUE INDEX "ProductMedia_productId_url_key" ON "ProductMedia"("productId", "url");
CREATE INDEX "ProductMedia_productId_position_idx" ON "ProductMedia"("productId", "position");
CREATE UNIQUE INDEX "ProductSpecification_productId_group_name_key" ON "ProductSpecification"("productId", "group", "name");
CREATE INDEX "ProductSpecification_productId_position_idx" ON "ProductSpecification"("productId", "position");
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "ProductOption"("productId", "name");
CREATE INDEX "ProductOption_productId_position_idx" ON "ProductOption"("productId", "position");
CREATE UNIQUE INDEX "ProductOptionValue_optionId_value_key" ON "ProductOptionValue"("optionId", "value");
CREATE INDEX "ProductOptionValue_optionId_position_idx" ON "ProductOptionValue"("optionId", "position");
CREATE UNIQUE INDEX "VariantPrice_variantId_market_key" ON "VariantPrice"("variantId", "market");
CREATE INDEX "VariantPrice_market_active_idx" ON "VariantPrice"("market", "active");
CREATE UNIQUE INDEX "ProductCompatibility_accessoryProductId_compatibleProductId_key" ON "ProductCompatibility"("accessoryProductId", "compatibleProductId");
CREATE UNIQUE INDEX "AdminRole_code_key" ON "AdminRole"("code");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_roleId_active_idx" ON "AdminUser"("roleId", "active");
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_adminUserId_expiresAt_idx" ON "AdminSession"("adminUserId", "expiresAt");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_productType_idx" ON "Product"("productType");
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VariantOptionValue" ADD CONSTRAINT "VariantOptionValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VariantOptionValue" ADD CONSTRAINT "VariantOptionValue_optionValueId_fkey" FOREIGN KEY ("optionValueId") REFERENCES "ProductOptionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VariantPrice" ADD CONSTRAINT "VariantPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_accessoryProductId_fkey" FOREIGN KEY ("accessoryProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_compatibleProductId_fkey" FOREIGN KEY ("compatibleProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Category" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES ('cat_ebikes', '电动自行车', 'electric-bikes', 'RIVET 电动自行车整车商品。', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "Product" SET "categoryId" = 'cat_ebikes';

UPDATE "Variant" v
SET "productId" = mv."productId"
FROM "MarketVersion" mv
WHERE v."marketVersionId" = mv."id";

UPDATE "MarketVersion" mv
SET "published" = (p."status" = 'ACTIVE'), "locale" = 'en-US'
FROM "Product" p
WHERE mv."productId" = p."id" AND mv."market" = 'US';

INSERT INTO "MarketVersion" ("id", "productId", "market", "currency", "basePrice", "motorWatts", "speedMph", "rangeMiles", "published", "locale", "createdAt", "updatedAt")
SELECT 'mv_eu_' || substr(md5(p."id"), 1, 18), p."id", 'EU', 'EUR', 0, us."motorWatts", 0, 0, false, 'en-IE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Product" p
JOIN "MarketVersion" us ON us."productId" = p."id" AND us."market" = 'US'
ON CONFLICT ("productId", "market") DO NOTHING;

INSERT INTO "VariantPrice" ("id", "variantId", "market", "currency", "price", "active", "createdAt", "updatedAt")
SELECT 'vp_us_' || substr(md5(v."id"), 1, 18), v."id", 'US', 'USD', v."price", v."active", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Variant" v
ON CONFLICT ("variantId", "market") DO NOTHING;

INSERT INTO "VariantPrice" ("id", "variantId", "market", "currency", "price", "active", "createdAt", "updatedAt")
SELECT 'vp_eu_' || substr(md5(v."id"), 1, 18), v."id", 'EU', 'EUR', 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Variant" v
ON CONFLICT ("variantId", "market") DO NOTHING;

INSERT INTO "ProductMedia" ("id", "productId", "type", "url", "altText", "position", "createdAt", "updatedAt")
SELECT 'pm_' || substr(md5(p."id" || media."url"), 1, 21), p."id", 'IMAGE', media."url", p."name", media."position" - 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Product" p
CROSS JOIN LATERAL unnest(CASE WHEN cardinality(p."imageUrls") > 0 THEN p."imageUrls" ELSE ARRAY[p."imageUrl"] END) WITH ORDINALITY AS media("url", "position")
ON CONFLICT ("productId", "url") DO NOTHING;

INSERT INTO "ProductSpecification" ("id", "productId", "group", "name", "value", "unit", "position", "createdAt", "updatedAt")
SELECT 'ps_motor_' || substr(md5(p."id"), 1, 16), p."id", 'Performance', 'Motor', us."motorWatts"::TEXT, 'W', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p JOIN "MarketVersion" us ON us."productId" = p."id" AND us."market" = 'US'
UNION ALL
SELECT 'ps_speed_' || substr(md5(p."id"), 1, 16), p."id", 'Performance', 'Top speed', us."speedMph"::TEXT, 'mph', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p JOIN "MarketVersion" us ON us."productId" = p."id" AND us."market" = 'US'
UNION ALL
SELECT 'ps_range_' || substr(md5(p."id"), 1, 16), p."id", 'Performance', 'Range', us."rangeMiles"::TEXT, 'mi', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p JOIN "MarketVersion" us ON us."productId" = p."id" AND us."market" = 'US';

INSERT INTO "ProductOption" ("id", "productId", "name", "position", "createdAt", "updatedAt")
SELECT 'po_color_' || substr(md5(p."id"), 1, 16), p."id", 'Color', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p
UNION ALL SELECT 'po_battery_' || substr(md5(p."id"), 1, 16), p."id", 'Battery', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p
UNION ALL SELECT 'po_tire_' || substr(md5(p."id"), 1, 16), p."id", 'Tire', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "Product" p;

INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "position", "createdAt", "updatedAt")
SELECT 'pov_' || substr(md5(o."id" || source."value"), 1, 20), o."id", source."value", row_number() OVER (PARTITION BY o."id" ORDER BY source."value") - 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "ProductOption" o
JOIN LATERAL (
  SELECT DISTINCT CASE o."name" WHEN 'Color' THEN v."color" WHEN 'Battery' THEN v."batteryWh"::TEXT || 'Wh' ELSE v."tire" END AS "value"
  FROM "Variant" v WHERE v."productId" = o."productId"
) source ON true;

INSERT INTO "VariantOptionValue" ("variantId", "optionValueId")
SELECT v."id", ov."id"
FROM "Variant" v
JOIN "ProductOption" o ON o."productId" = v."productId"
JOIN "ProductOptionValue" ov ON ov."optionId" = o."id" AND ov."value" = CASE o."name" WHEN 'Color' THEN v."color" WHEN 'Battery' THEN v."batteryWh"::TEXT || 'Wh' ELSE v."tire" END;

INSERT INTO "AdminRole" ("id", "code", "name", "permissions", "createdAt", "updatedAt")
VALUES ('role_owner', 'OWNER', '所有者', ARRAY['*']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
