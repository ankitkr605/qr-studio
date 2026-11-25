-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qrType" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "isDynamic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "customization" JSONB NOT NULL DEFAULT '{}',
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRScan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceCategory" TEXT NOT NULL DEFAULT 'Other',
    "browserCategory" TEXT NOT NULL DEFAULT 'Other',
    "osCategory" TEXT NOT NULL DEFAULT 'Other',
    "country" TEXT NOT NULL DEFAULT 'Unknown',

    CONSTRAINT "QRScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_codeId_key" ON "QRCode"("codeId");

-- CreateIndex
CREATE INDEX "QRCode_userId_createdAt_idx" ON "QRCode"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QRCode_qrType_idx" ON "QRCode"("qrType");

-- CreateIndex
CREATE INDEX "QRCode_isActive_idx" ON "QRCode"("isActive");

-- CreateIndex
CREATE INDEX "QRScan_qrCodeId_scannedAt_idx" ON "QRScan"("qrCodeId", "scannedAt");

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
