import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async available() {
    const slots = await this.prisma.slot.findMany({
      where: { bookings: { none: { status: BookingStatus.active } } },
      orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
    });
    return { slots };
  }
}
