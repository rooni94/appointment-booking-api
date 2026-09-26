# Appointment Booking API

A small NestJS API for booking predefined appointment slots safely under concurrent requests.

## Stack

- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Socket.IO
- Swagger / OpenAPI
- Jest / Supertest

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `PORT` (optional, defaults to `3000`)

The development and test databases must be separate. Create both databases before applying migrations.

```sql
CREATE DATABASE appointments;
CREATE DATABASE appointments_test;
```

```bash
npm install
npx prisma generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

## API

- `GET /slots`
- `POST /bookings`
- `DELETE /bookings/{bookingId}`

Swagger UI: `http://localhost:3000/docs`

OpenAPI JSON: `http://localhost:3000/openapi.json`

No authentication is required.

## Tests

`TEST_DATABASE_URL` must point to a dedicated PostgreSQL database that differs from `DATABASE_URL`.

```bash
npm run test:e2e
```

The tests exercise the real HTTP API and PostgreSQL. They include two concurrent booking requests for the same slot and verify that one succeeds, one returns `409`, and only one active booking is stored.

## Socket.IO

- Namespace: `/`
- Path: `/socket.io`

Run the listener while the API is running:

```bash
npm run socket:listen
```

A successful booking emits `slot.booked`. The first successful cancellation emits `slot.released`; repeated cancellation emits no additional event.

## Concurrency

PostgreSQL enforces one active booking per slot using a partial unique index. This prevents double booking when concurrent requests reach the API. Cancelled bookings remain stored but do not participate in the active-booking constraint.

## Design decisions

- Fixed slots are created by the Prisma seed.
- Cancelled bookings remain stored for history.
- Availability is based on the absence of an active booking.
- A database constraint protects the concurrency invariant.
- Cancellation is idempotent.

## Possible improvements

- Broader negative-case E2E coverage
- Automated Socket.IO integration tests

## Submission notes

Actual implementation time: Approximately 2 hours and 45 minutes.

Incomplete requirements: None.

## AI usage

AI-assisted tools were used for parts of the final review and testing, and to help refine the README. The final implementation was reviewed and tested before submission.

---

# واجهة API لحجز المواعيد

واجهة صغيرة مبنية باستخدام NestJS لحجز مواعيد محددة مسبقًا بأمان عند وصول طلبات متزامنة.

## التقنيات

- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Socket.IO
- Swagger / OpenAPI
- Jest / Supertest

## المتطلبات

- Node.js 20+
- PostgreSQL 14+

## الإعداد

انسخ `.env.example` إلى `.env`، ثم اضبط:

- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `PORT` (اختياري، والقيمة الافتراضية `3000`)

يجب استخدام قاعدتي بيانات منفصلتين للتطوير والاختبارات. أنشئ القاعدتين قبل تطبيق migrations.

```sql
CREATE DATABASE appointments;
CREATE DATABASE appointments_test;
```

```bash
npm install
npx prisma generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

## API

- `GET /slots`
- `POST /bookings`
- `DELETE /bookings/{bookingId}`

Swagger UI: `http://localhost:3000/docs`

OpenAPI JSON: `http://localhost:3000/openapi.json`

لا تتطلب الواجهة مصادقة.

## الاختبارات

يجب أن يشير `TEST_DATABASE_URL` إلى قاعدة PostgreSQL مخصصة للاختبارات ومختلفة عن `DATABASE_URL`.

```bash
npm run test:e2e
```

تستخدم الاختبارات واجهة HTTP الحقيقية وقاعدة PostgreSQL. ويتحقق اختبار التزامن من أن طلبي حجز متزامنين للموعد نفسه ينتجان نجاح طلب واحد وإرجاع `409` للآخر، مع تخزين حجز نشط واحد فقط.

## Socket.IO

- Namespace: `/`
- Path: `/socket.io`

شغّل المستمع أثناء تشغيل API:

```bash
npm run socket:listen
```

يصدر الحدث `slot.booked` بعد نجاح الحجز، ويصدر `slot.released` عند أول إلغاء ناجح. لا يصدر حدث إضافي عند تكرار الإلغاء.

## منع الحجز المزدوج

تفرض PostgreSQL وجود حجز نشط واحد فقط لكل موعد باستخدام partial unique index. يمنع ذلك الحجز المزدوج عند وصول طلبات متزامنة. تبقى الحجوزات الملغاة محفوظة، لكنها لا تدخل ضمن قيد الحجز النشط.

## أهم قرارات التصميم

- تُنشأ المواعيد الثابتة بواسطة Prisma seed.
- تبقى الحجوزات الملغاة محفوظة كسجل تاريخي.
- يعتمد التوفر على عدم وجود حجز نشط.
- يحمي قيد قاعدة البيانات من تعارض الحجوزات المتزامنة.
- عملية الإلغاء idempotent.

## تحسينات مستقبلية

- توسيع تغطية حالات الخطأ في اختبارات E2E
- إضافة اختبارات تكامل آلية لأحداث Socket.IO

## ملاحظات التسليم

وقت التنفيذ الفعلي: حوالي ساعتين و45 دقيقة.

المتطلبات غير المكتملة: لا يوجد.

## استخدام أدوات الذكاء الاصطناعي

استُخدمت أدوات مساعدة بالذكاء الاصطناعي في بعض أجزاء المراجعة والاختبار النهائي، والمساعدة في تحسين ملف README. تمت مراجعة واختبار النسخة النهائية قبل التسليم.
