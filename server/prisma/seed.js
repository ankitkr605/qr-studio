import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@qrstudio.app';
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Demo Creator',
      email,
      passwordHash,
    },
  });

  const existing = await prisma.qRCode.findUnique({ where: { codeId: 'demoLaunch' } });
  if (!existing) {
    const qr = await prisma.qRCode.create({
      data: {
        codeId: 'demoLaunch',
        userId: user.id,
        name: 'Product Launch Website',
        qrType: 'url',
        destinationUrl: 'https://example.com/launch',
        isDynamic: true,
        isActive: true,
        scanCount: 5,
        customization: {
          fgColor: '#4f46e5',
          bgColor: '#ffffff',
          size: 320,
          ecc: 'M',
          margin: 2,
          dotStyle: 'rounded',
          cornerStyle: 'rounded',
          title: 'Launch Page',
        },
      },
    });

    await prisma.qRScan.createMany({
      data: [
        { qrCodeId: qr.id, deviceCategory: 'Mobile', browserCategory: 'Safari', osCategory: 'iOS', country: 'US' },
        { qrCodeId: qr.id, deviceCategory: 'Mobile', browserCategory: 'Chrome', osCategory: 'Android', country: 'IN' },
        { qrCodeId: qr.id, deviceCategory: 'Desktop', browserCategory: 'Chrome', osCategory: 'macOS', country: 'GB' },
        { qrCodeId: qr.id, deviceCategory: 'Mobile', browserCategory: 'Safari', osCategory: 'iOS', country: 'US' },
        { qrCodeId: qr.id, deviceCategory: 'Desktop', browserCategory: 'Edge', osCategory: 'Windows', country: 'DE' },
      ],
    });
  }

  console.log('Seed completed: demo@qrstudio.app / DemoPass123!');
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
