import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Appointments', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => { await prisma.appointment.deleteMany(); });
  afterAll(async () => { await app.close(); });

  const slot = (resourceId = randomUUID()) => ({ resourceId, customer: 'Ramazan', startAt: '2026-10-01T10:00:00.000Z', endAt: '2026-10-01T11:00:00.000Z' });

  it('creates an appointment', async () => { await request(app.getHttpServer()).post('/appointments').send(slot()).expect(201); });

  it('rejects an invalid time range', async () => {
    const body = slot(); body.endAt = body.startAt;
    await request(app.getHttpServer()).post('/appointments').send(body).expect(400);
  });

  it('allows adjacent appointments', async () => {
    const resourceId = randomUUID();
    await request(app.getHttpServer()).post('/appointments').send(slot(resourceId)).expect(201);
    await request(app.getHttpServer()).post('/appointments').send({ ...slot(resourceId), startAt: '2026-10-01T11:00:00.000Z', endAt: '2026-10-01T12:00:00.000Z' }).expect(201);
  });

  it('rejects overlapping appointments', async () => {
    const resourceId = randomUUID();
    await request(app.getHttpServer()).post('/appointments').send(slot(resourceId)).expect(201);
    await request(app.getHttpServer()).post('/appointments').send({ ...slot(resourceId), startAt: '2026-10-01T10:30:00.000Z', endAt: '2026-10-01T11:30:00.000Z' }).expect(409);
  });

  it('prevents double booking from concurrent requests', async () => {
    const body = slot();
    const responses = await Promise.all([request(app.getHttpServer()).post('/appointments').send(body), request(app.getHttpServer()).post('/appointments').send(body)]);
    expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
  });

  it('allows the same slot after cancellation', async () => {
    const body = slot();
    const created = await request(app.getHttpServer()).post('/appointments').send(body).expect(201);
    await request(app.getHttpServer()).patch(`/appointments/${created.body.id}/cancel`).expect(200);
    await request(app.getHttpServer()).post('/appointments').send(body).expect(201);
  });

  it('rejects moving an appointment into an occupied slot', async () => {
    const resourceId = randomUUID();
    await request(app.getHttpServer()).post('/appointments').send(slot(resourceId)).expect(201);
    const second = await request(app.getHttpServer()).post('/appointments').send({ ...slot(resourceId), startAt: '2026-10-01T12:00:00.000Z', endAt: '2026-10-01T13:00:00.000Z' }).expect(201);
    await request(app.getHttpServer()).patch(`/appointments/${second.body.id}`).send({ startAt: '2026-10-01T10:30:00.000Z', endAt: '2026-10-01T11:30:00.000Z' }).expect(409);
  });
});
