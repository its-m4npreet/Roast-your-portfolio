-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "RoastResult" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "roast" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'roast',
    "screenshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoastResult_pkey" PRIMARY KEY ("id")
);
