-- AlterTable
ALTER TABLE "users" ADD COLUMN     "extra_phones" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "user_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_comments_user_id_created_at_idx" ON "user_comments"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_comments" ADD CONSTRAINT "user_comments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
