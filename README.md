# Appointment Booking API

A small NestJS API for booking predefined appointment slots safely under concurrent requests.

## Stack

- TypeScript and NestJS
- PostgreSQL and Prisma ORM
- Socket.IO
- Swagger / OpenAPI
- Jest and Supertest

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Setup

Copy `.env.example` to `.env`, then update the two PostgreSQL connection strings. The application and tests must use separate databases.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appointments?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appointments_test?schema=public"
PORT=3000
```

Create the databases with your PostgreSQL administration tool or `psql`:

```sql
CREATE DATABASE appointments;
CREATE DATABASE appointments_test;
```

Install dependencies, generate Prisma Client, apply the migration, seed the fixed slots, and start the API:

```bash
npm install
npx prisma generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

The API base URL is `http://localhost:3000`. No authentication is required.

## API and documentation

- `GET /slots` lists currently available slots.
- `POST /bookings` books a predefined slot.
- `DELETE /bookings/{bookingId}` cancels a booking idempotently.
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

## Tests

`TEST_DATABASE_URL` is mandatory and must not match `DATABASE_URL`. The E2E suite resets only the test database, applies all migrations, seeds deterministic slots, and exercises the real HTTP API and PostgreSQL.

```bash
npm run test:e2e
```

The focused suite covers successful booking and availability, two concurrent booking requests with different customer data, one-active-booking persistence, cancellation, rebooking, and idempotent cancellation of the older booking.

## Socket.IO

Socket.IO uses the default `/` namespace and `/socket.io` path. It accepts no application events from clients and does not use authentication or rooms.

Start the API, then run the listener in another terminal:

```bash
npm run socket:listen
```

A committed booking emits `slot.booked`; the first active-to-cancelled transition emits `slot.released`. Rejected bookings and repeated cancellation emit nothing. Event payloads contain only `slotId`, `bookingId`, and `available`.

## Design decisions

Slots are fixed records created by the repeatable Prisma seed. Availability is derived from the absence of an active booking, while cancelled bookings remain stored.

PostgreSQL enforces one active booking per slot with a partial unique index. This keeps the rule safe even when two requests reach the API at the same time: one insert commits and the other becomes `409 SLOT_UNAVAILABLE`. Cancelled bookings do not participate in that index, so their slots can be booked again.

Cancellation updates only the requested booking ID and only when its status is active. This makes repeated or concurrent cancellation idempotent and prevents an older cancelled booking from affecting a newer active booking.

Possible improvements include broader negative-case E2E coverage and automated Socket.IO integration tests.

## Submission notes

Actual implementation time: [FILL BEFORE SUBMISSION]

Incomplete requirements: the actual implementation time must be filled by the candidate before submission.

## AI usage

AI-assisted coding tools were used during implementation and review. The generated changes were reviewed manually, and the project was built and tested against PostgreSQL. The concurrency behavior, API responses, OpenAPI documentation, and automated tests were verified before submission.
