-- CreateEnum
CREATE TYPE "order_request_status" AS ENUM ('new_order', 'calculation', 'clarification', 'extra_services');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PLANNING', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'CALCULATION', 'DONE', 'CANCELED');

-- CreateEnum
CREATE TYPE "timeline_action" AS ENUM ('START', 'STOP', 'END', 'RESTART');

-- CreateTable
CREATE TABLE "order_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "index_like" TEXT NOT NULL,
    "status" "order_request_status" NOT NULL DEFAULT 'new_order',
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "order_type_id" TEXT NOT NULL,
    "counterparty_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_request_files" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_request_id" TEXT NOT NULL,

    CONSTRAINT "order_request_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_request_comments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "order_request_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_request_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metal_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metal_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_records" (
    "id" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "plan_number" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "metal_thickness" DOUBLE PRECISION NOT NULL,
    "metal_brand_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_record_files" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan_record_id" TEXT NOT NULL,

    CONSTRAINT "plan_record_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'PLANNING',
    "start_execution_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "task_type_id" TEXT NOT NULL,
    "order_request_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "responsible_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_files" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "task_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_timeline_items" (
    "id" TEXT NOT NULL,
    "action_name" "timeline_action" NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "task_timeline_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_types_name_key" ON "order_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "order_requests_index_like_key" ON "order_requests"("index_like");

-- CreateIndex
CREATE INDEX "order_requests_order_type_id_idx" ON "order_requests"("order_type_id");

-- CreateIndex
CREATE INDEX "order_requests_counterparty_id_idx" ON "order_requests"("counterparty_id");

-- CreateIndex
CREATE INDEX "order_requests_created_by_id_idx" ON "order_requests"("created_by_id");

-- CreateIndex
CREATE INDEX "order_requests_status_idx" ON "order_requests"("status");

-- CreateIndex
CREATE INDEX "order_requests_index_like_idx" ON "order_requests"("index_like");

-- CreateIndex
CREATE INDEX "order_request_files_order_request_id_idx" ON "order_request_files"("order_request_id");

-- CreateIndex
CREATE INDEX "order_request_comments_order_request_id_idx" ON "order_request_comments"("order_request_id");

-- CreateIndex
CREATE INDEX "order_request_comments_author_id_idx" ON "order_request_comments"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "metal_brands_name_key" ON "metal_brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plan_records_plan_number_key" ON "plan_records"("plan_number");

-- CreateIndex
CREATE INDEX "plan_records_metal_brand_id_idx" ON "plan_records"("metal_brand_id");

-- CreateIndex
CREATE INDEX "plan_records_created_by_id_idx" ON "plan_records"("created_by_id");

-- CreateIndex
CREATE INDEX "plan_records_registration_date_idx" ON "plan_records"("registration_date");

-- CreateIndex
CREATE INDEX "plan_records_plan_number_idx" ON "plan_records"("plan_number");

-- CreateIndex
CREATE INDEX "plan_records_order_number_idx" ON "plan_records"("order_number");

-- CreateIndex
CREATE INDEX "plan_record_files_plan_record_id_idx" ON "plan_record_files"("plan_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_types_name_key" ON "task_types"("name");

-- CreateIndex
CREATE INDEX "tasks_task_type_id_idx" ON "tasks"("task_type_id");

-- CreateIndex
CREATE INDEX "tasks_order_request_id_idx" ON "tasks"("order_request_id");

-- CreateIndex
CREATE INDEX "tasks_created_by_id_idx" ON "tasks"("created_by_id");

-- CreateIndex
CREATE INDEX "tasks_responsible_user_id_idx" ON "tasks"("responsible_user_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_start_execution_date_idx" ON "tasks"("start_execution_date");

-- CreateIndex
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");

-- CreateIndex
CREATE INDEX "task_comments_task_id_idx" ON "task_comments"("task_id");

-- CreateIndex
CREATE INDEX "task_comments_author_id_idx" ON "task_comments"("author_id");

-- CreateIndex
CREATE INDEX "task_files_task_id_idx" ON "task_files"("task_id");

-- CreateIndex
CREATE INDEX "task_timeline_items_task_id_idx" ON "task_timeline_items"("task_id");

-- AddForeignKey
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_order_type_id_fkey" FOREIGN KEY ("order_type_id") REFERENCES "order_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_counterparty_id_fkey" FOREIGN KEY ("counterparty_id") REFERENCES "counterparties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_request_files" ADD CONSTRAINT "order_request_files_order_request_id_fkey" FOREIGN KEY ("order_request_id") REFERENCES "order_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_request_comments" ADD CONSTRAINT "order_request_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_request_comments" ADD CONSTRAINT "order_request_comments_order_request_id_fkey" FOREIGN KEY ("order_request_id") REFERENCES "order_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_records" ADD CONSTRAINT "plan_records_metal_brand_id_fkey" FOREIGN KEY ("metal_brand_id") REFERENCES "metal_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_records" ADD CONSTRAINT "plan_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_record_files" ADD CONSTRAINT "plan_record_files_plan_record_id_fkey" FOREIGN KEY ("plan_record_id") REFERENCES "plan_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_type_id_fkey" FOREIGN KEY ("task_type_id") REFERENCES "task_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_order_request_id_fkey" FOREIGN KEY ("order_request_id") REFERENCES "order_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_files" ADD CONSTRAINT "task_files_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_timeline_items" ADD CONSTRAINT "task_timeline_items_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
