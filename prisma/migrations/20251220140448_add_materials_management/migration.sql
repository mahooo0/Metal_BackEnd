-- CreateEnum
CREATE TYPE "material_status" AS ENUM ('IN_PROCESS', 'UNDER_REVIEW', 'PLANNING', 'EXPIRED', 'LAUNCH');

-- CreateEnum
CREATE TYPE "purchase_status" AS ENUM ('IN_PROCESS', 'UNDER_REVIEW', 'PLANNING', 'EXPIRED', 'LAUNCH', 'RECEIVED');

-- CreateEnum
CREATE TYPE "purchase_item_status" AS ENUM ('ORDERED', 'PARTIALLY_RECEIVED', 'READY', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "material_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "sheet_type" TEXT NOT NULL,
    "cutting_supply" DOUBLE PRECISION,
    "cutting_time" DOUBLE PRECISION,
    "description" TEXT,
    "type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "dimensions" TEXT,
    "volume" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "price_categories" JSONB NOT NULL DEFAULT '{}',
    "status" "material_status" NOT NULL DEFAULT 'IN_PROCESS',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "warning_qty" INTEGER,
    "material_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_address" TEXT,
    "actual_address" TEXT,
    "bank_details" TEXT,
    "edrpou" TEXT,
    "ipn" TEXT,
    "tax_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "supplier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "purchase_status" NOT NULL DEFAULT 'IN_PROCESS',
    "comment" TEXT,
    "supplier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "dimensions" TEXT,
    "volume" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "price_categories" JSONB NOT NULL DEFAULT '{}',
    "status" "purchase_item_status" NOT NULL DEFAULT 'ORDERED',
    "ordered_quantity" INTEGER NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "warning_qty" INTEGER,
    "purchase_id" TEXT NOT NULL,
    "material_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_items_type_id_idx" ON "material_items"("type_id");

-- CreateIndex
CREATE INDEX "material_items_thickness_idx" ON "material_items"("thickness");

-- CreateIndex
CREATE INDEX "material_items_sheet_type_idx" ON "material_items"("sheet_type");

-- CreateIndex
CREATE INDEX "materials_material_item_id_idx" ON "materials"("material_item_id");

-- CreateIndex
CREATE INDEX "materials_status_idx" ON "materials"("status");

-- CreateIndex
CREATE INDEX "materials_date_idx" ON "materials"("date");

-- CreateIndex
CREATE INDEX "supplier_contacts_supplier_id_idx" ON "supplier_contacts"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_purchase_id_key" ON "purchases"("purchase_id");

-- CreateIndex
CREATE INDEX "purchases_supplier_id_idx" ON "purchases"("supplier_id");

-- CreateIndex
CREATE INDEX "purchases_status_idx" ON "purchases"("status");

-- CreateIndex
CREATE INDEX "purchases_date_idx" ON "purchases"("date");

-- CreateIndex
CREATE INDEX "purchases_purchase_id_idx" ON "purchases"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_material_item_id_idx" ON "purchase_items"("material_item_id");

-- CreateIndex
CREATE INDEX "purchase_items_status_idx" ON "purchase_items"("status");

-- AddForeignKey
ALTER TABLE "material_items" ADD CONSTRAINT "material_items_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "metal_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_material_item_id_fkey" FOREIGN KEY ("material_item_id") REFERENCES "material_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_material_item_id_fkey" FOREIGN KEY ("material_item_id") REFERENCES "material_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
