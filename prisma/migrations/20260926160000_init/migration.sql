CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE "AppointmentStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "appointment_valid_range" CHECK ("endAt" > "startAt")
);

CREATE INDEX "Appointment_resourceId_startAt_endAt_idx" ON "Appointment"("resourceId", "startAt", "endAt");

ALTER TABLE "Appointment"
ADD CONSTRAINT "appointment_no_overlap"
EXCLUDE USING gist (
    "resourceId" WITH =,
    tsrange("startAt", "endAt", '[)') WITH &&
) WHERE ("status" = 'CONFIRMED');
