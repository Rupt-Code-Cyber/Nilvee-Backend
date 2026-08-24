-- CreateTable
CREATE TABLE "MigrationCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationCheck_pkey" PRIMARY KEY ("id")
);
