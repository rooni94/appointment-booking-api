CREATE TYPE "BookingStatus" AS ENUM ('active', 'cancelled');

CREATE TABLE "Slot" (
    "id" UUID NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "slot_valid_range" CHECK ("endsAt" > "startsAt")
);

CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "slotId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'active',
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Slot_startsAt_id_idx" ON "Slot"("startsAt", "id");
CREATE INDEX "Booking_slotId_idx" ON "Booking"("slotId");
CREATE UNIQUE INDEX "Booking_one_active_per_slot" ON "Booking"("slotId") WHERE "status" = 'active';

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_slotId_fkey"
FOREIGN KEY ("slotId") REFERENCES "Slot"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
