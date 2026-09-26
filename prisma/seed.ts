import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const slots = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    startsAt: new Date('2030-01-15T09:00:00.000Z'),
    endsAt: new Date('2030-01-15T09:30:00.000Z'),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    startsAt: new Date('2030-01-15T09:30:00.000Z'),
    endsAt: new Date('2030-01-15T10:00:00.000Z'),
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    startsAt: new Date('2030-01-15T10:00:00.000Z'),
    endsAt: new Date('2030-01-15T10:30:00.000Z'),
  },
];

async function main() {
  for (const slot of slots) {
    await prisma.slot.upsert({ where: { id: slot.id }, update: slot, create: slot });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
