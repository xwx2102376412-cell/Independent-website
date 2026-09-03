CREATE TYPE "MarketCode" AS ENUM ('US', 'EU');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'FULFILLED', 'REFUNDED');
CREATE TYPE "InquiryType" AS ENUM ('DEALER', 'WHOLESALE', 'CONTACT');
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'NEGOTIATING', 'WON', 'LOST');

CREATE TABLE "Product" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "tagline" TEXT NOT NULL, "description" TEXT NOT NULL, "imageUrl" TEXT NOT NULL, "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT', "featured" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
CREATE TABLE "MarketVersion" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "market" "MarketCode" NOT NULL, "currency" TEXT NOT NULL, "basePrice" INTEGER NOT NULL, "motorWatts" INTEGER NOT NULL, "speedMph" INTEGER NOT NULL, "rangeMiles" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "MarketVersion_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Variant" ("id" TEXT NOT NULL, "marketVersionId" TEXT NOT NULL, "sku" TEXT NOT NULL, "color" TEXT NOT NULL, "colorHex" TEXT NOT NULL, "batteryWh" INTEGER NOT NULL, "motorWatts" INTEGER NOT NULL, "tire" TEXT NOT NULL, "price" INTEGER NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Variant_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Inventory" ("id" TEXT NOT NULL, "variantId" TEXT NOT NULL, "onHand" INTEGER NOT NULL DEFAULT 0, "reserved" INTEGER NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Order" ("id" TEXT NOT NULL, "orderNumber" TEXT NOT NULL, "email" TEXT NOT NULL, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "phone" TEXT, "address1" TEXT NOT NULL, "address2" TEXT, "city" TEXT NOT NULL, "state" TEXT NOT NULL, "postalCode" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'US', "market" "MarketCode" NOT NULL DEFAULT 'US', "currency" TEXT NOT NULL DEFAULT 'USD', "subtotal" INTEGER NOT NULL, "shipping" INTEGER NOT NULL, "tax" INTEGER NOT NULL DEFAULT 0, "total" INTEGER NOT NULL, "status" "OrderStatus" NOT NULL DEFAULT 'PENDING', "paypalOrderId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Order_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OrderItem" ("id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "variantId" TEXT NOT NULL, "productName" TEXT NOT NULL, "sku" TEXT NOT NULL, "optionLabel" TEXT NOT NULL, "unitPrice" INTEGER NOT NULL, "quantity" INTEGER NOT NULL, CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"));
CREATE TABLE "PaymentEvent" ("id" TEXT NOT NULL, "provider" TEXT NOT NULL, "eventId" TEXT NOT NULL, "eventType" TEXT NOT NULL, "orderId" TEXT, "payload" JSONB NOT NULL, "processed" BOOLEAN NOT NULL DEFAULT false, "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Inquiry" ("id" TEXT NOT NULL, "type" "InquiryType" NOT NULL, "status" "InquiryStatus" NOT NULL DEFAULT 'NEW', "companyName" TEXT, "contactName" TEXT NOT NULL, "country" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "website" TEXT, "businessType" TEXT, "expectedQuantity" INTEGER, "interestedModels" TEXT[], "message" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "MarketVersion_market_idx" ON "MarketVersion"("market");
CREATE UNIQUE INDEX "MarketVersion_productId_market_key" ON "MarketVersion"("productId", "market");
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");
CREATE INDEX "Variant_marketVersionId_idx" ON "Variant"("marketVersionId");
CREATE UNIQUE INDEX "Inventory_variantId_key" ON "Inventory"("variantId");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_paypalOrderId_key" ON "Order"("paypalOrderId");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE UNIQUE INDEX "PaymentEvent_eventId_key" ON "PaymentEvent"("eventId");
CREATE INDEX "Inquiry_type_status_idx" ON "Inquiry"("type", "status");

ALTER TABLE "MarketVersion" ADD CONSTRAINT "MarketVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_marketVersionId_fkey" FOREIGN KEY ("marketVersionId") REFERENCES "MarketVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
