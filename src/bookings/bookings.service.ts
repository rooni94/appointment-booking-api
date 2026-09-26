import { HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { ApiError } from '../common/api-error';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsGateway } from './bookings.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BookingsGateway,
  ) {}

  async create(dto: CreateBookingDto) {
    const slot = await this.prisma.slot.findUnique({ where: { id: dto.slotId }, select: { id: true } });
    if (!slot) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'SLOT_NOT_FOUND', 'The requested slot was not found.');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          slotId: dto.slotId,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
        },
        select: this.fields(),
      });
      this.gateway.booked(booking.slotId, booking.id);
      return { booking };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ApiError(HttpStatus.CONFLICT, 'SLOT_UNAVAILABLE', 'This slot already has an active booking.');
      }
      throw error;
    }
  }

  async cancel(id: string) {
    const transition = await this.prisma.booking.updateMany({
      where: { id, status: BookingStatus.active },
      data: { status: BookingStatus.cancelled },
    });
    const booking = await this.prisma.booking.findUnique({ where: { id }, select: this.fields() });
    if (!booking) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The booking was not found.');
    }
    if (transition.count === 1) {
      this.gateway.released(booking.slotId, booking.id);
    }
    return { booking };
  }

  private fields() {
    return { id: true, slotId: true, customerName: true, customerEmail: true, status: true } as const;
  }
}
