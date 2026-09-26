import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { execFileSync } from 'child_process';
import request = require('supertest');

function databaseTarget(connectionString: string) {
  const url = new URL(connectionString);
  const host = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'local' : url.hostname;
  const port = url.port || '5432';
  const database = decodeURIComponent(url.pathname.slice(1));
  const schema = url.searchParams.get('schema') || 'public';
  return `${host}:${port}/${database}?schema=${schema}`;
}

describe('booking API', () => {
  let app: INestApplication;
  let prisma: import('../src/prisma/prisma.service').PrismaService;
  const slotId = '11111111-1111-4111-8111-111111111111';
  const payload = {
    slotId,
    customerName: ' Alex Morgan ',
    customerEmail: ' alex@example.com ',
  };

  beforeAll(async () => {
    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    const applicationDatabaseUrl = process.env.DATABASE_URL;
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL is required');
    }
    if (applicationDatabaseUrl && databaseTarget(testDatabaseUrl) === databaseTarget(applicationDatabaseUrl)) {
      throw new Error('TEST_DATABASE_URL must be different from DATABASE_URL');
    }
    process.env.DATABASE_URL = testDatabaseUrl;
    const prismaCli = require.resolve('prisma/build/index.js');
    execFileSync(process.execPath, [prismaCli, 'migrate', 'reset', '--force', '--skip-seed'], {
      stdio: 'inherit',
      env: process.env,
    });
    execFileSync(process.execPath, [prismaCli, 'db', 'seed'], { stdio: 'inherit', env: process.env });

    const [{ createApp }, { PrismaService }] = await Promise.all([
      import('../src/main'),
      import('../src/prisma/prisma.service'),
    ]);
    app = await createApp();
    await app.init();
    prisma = app.get(PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await prisma.booking.deleteMany();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('books a slot and removes it from availability', async () => {
    const created = await request(app.getHttpServer()).post('/bookings').send(payload).expect(201);
    expect(created.body).toMatchObject({
      booking: {
        slotId,
        customerName: 'Alex Morgan',
        customerEmail: 'alex@example.com',
        status: 'active',
      },
    });
    const slots = await request(app.getHttpServer()).get('/slots').expect(200);
    expect(slots.body.slots.some((slot: { id: string }) => slot.id === slotId)).toBe(false);
  });

  it('allows only one active booking under concurrent requests', async () => {
    const [first, second] = await Promise.all([
      request(app.getHttpServer()).post('/bookings').send(payload),
      request(app.getHttpServer()).post('/bookings').send({
        ...payload,
        customerName: 'Different Customer',
        customerEmail: 'different@example.com',
      }),
    ]);
    expect([first.status, second.status].sort()).toEqual([201, 409]);
    const conflict = [first, second].find((response) => response.status === 409);
    expect(conflict?.body).toEqual({
      error: {
        code: 'SLOT_UNAVAILABLE',
        message: 'This slot already has an active booking.',
      },
    });
    expect(await prisma.booking.count({ where: { slotId, status: 'active' } })).toBe(1);
  });

  it('cancels, releases, rebooks, and keeps repeated cancellation idempotent', async () => {
    const original = await request(app.getHttpServer()).post('/bookings').send(payload).expect(201);
    const originalId = original.body.booking.id;

    const cancelled = await request(app.getHttpServer()).delete(`/bookings/${originalId}`).expect(200);
    expect(cancelled.body.booking.status).toBe('cancelled');
    const slots = await request(app.getHttpServer()).get('/slots').expect(200);
    expect(slots.body.slots.some((slot: { id: string }) => slot.id === slotId)).toBe(true);

    const replacement = await request(app.getHttpServer()).post('/bookings').send({
      ...payload,
      customerName: 'New Customer',
      customerEmail: 'new@example.com',
    }).expect(201);
    await request(app.getHttpServer()).delete(`/bookings/${originalId}`).expect(200);

    const replacementRow = await prisma.booking.findUnique({ where: { id: replacement.body.booking.id } });
    expect(replacementRow?.status).toBe('active');
    expect(await prisma.booking.count({ where: { slotId, status: 'active' } })).toBe(1);
    expect(await prisma.booking.count({ where: { slotId, status: 'cancelled' } })).toBe(1);
  });
});
