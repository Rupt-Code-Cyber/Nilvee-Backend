-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "clientName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "company" VARCHAR(100),
    "serviceId" UUID NOT NULL,
    "projectTitle" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(12,2),
    "deadline" DATE,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_serviceId_idx" ON "orders"("serviceId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
