# Appointment Booking API

Small NestJS API for booking appointments safely when multiple requests arrive at the same time.

## Stack

- NestJS + TypeScript
- PostgreSQL
- Prisma ORM
- Socket.IO
- Swagger / OpenAPI
- Jest + Supertest
- Docker Compose

## Run locally

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

The API runs on `http://localhost:3000` and Swagger is available at `http://localhost:3000/docs`.

## Endpoints

- `POST /appointments` creates an appointment.
- `GET /appointments/:id` returns an appointment.
- `PATCH /appointments/:id` updates an appointment.
- `PATCH /appointments/:id/cancel` cancels an appointment.

## Real-time events

Socket.IO emits:

- `appointment.created`
- `appointment.updated`
- `appointment.cancelled`

Each event contains the current appointment object.

## Double-booking protection

The database has a PostgreSQL exclusion constraint for confirmed appointments. It prevents overlapping time ranges for the same resource. The range uses `[startAt, endAt)`, so an appointment can start exactly when the previous one ends.

Keeping this rule in PostgreSQL avoids the race condition caused by checking availability in application code before inserting. If concurrent requests try to reserve the same slot, one succeeds and the conflicting request receives `409 Conflict`. Cancelling an appointment removes it from the active constraint, so that time becomes bookable again.

## Tests

With PostgreSQL running and migrations applied:

```bash
npm run test:e2e
```

The tests cover creation, invalid ranges, adjacent slots, overlaps, concurrent requests, cancellation/rebooking, and conflicting updates.

## Challenge time

Actual implementation and verification time: approximately 2 hours.

Incomplete parts: none for the requested scope.
