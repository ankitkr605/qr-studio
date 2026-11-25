import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`QR Studio API server listening on http://localhost:${env.port}`);
});

async function shutdown() {
  console.log('Shutting down QR Studio API server...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
