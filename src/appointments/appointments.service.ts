import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsGateway } from './appointments.gateway';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService, private readonly gateway: AppointmentsGateway) {}

  async create(dto: CreateAppointmentDto) {
    this.validateRange(dto.startAt, dto.endAt);
    try {
      const appointment = await this.prisma.appointment.create({ data: { resourceId: dto.resourceId, customer: dto.customer, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt) } });
      this.gateway.created(appointment);
      return appointment;
    } catch (error) { this.handleDatabaseError(error); }
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const current = await this.findOne(id);
    if (current.status === AppointmentStatus.CANCELLED) throw new BadRequestException('Cancelled appointments cannot be updated');
    const startAt = dto.startAt ?? current.startAt.toISOString();
    const endAt = dto.endAt ?? current.endAt.toISOString();
    this.validateRange(startAt, endAt);
    try {
      const appointment = await this.prisma.appointment.update({ where: { id }, data: { resourceId: dto.resourceId, customer: dto.customer, startAt: dto.startAt ? new Date(dto.startAt) : undefined, endAt: dto.endAt ? new Date(dto.endAt) : undefined } });
      this.gateway.updated(appointment);
      return appointment;
    } catch (error) { this.handleDatabaseError(error); }
  }

  async cancel(id: string) {
    const current = await this.findOne(id);
    if (current.status === AppointmentStatus.CANCELLED) return current;
    const appointment = await this.prisma.appointment.update({ where: { id }, data: { status: AppointmentStatus.CANCELLED } });
    this.gateway.cancelled(appointment);
    return appointment;
  }

  private validateRange(start: string, end: string) {
    if (new Date(start) >= new Date(end)) throw new BadRequestException('endAt must be later than startAt');
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('This time slot is already booked');
    const message = error instanceof Error ? error.message : '';
    if (message.includes('appointment_no_overlap') || message.includes('Exclusion constraint')) throw new ConflictException('This time slot overlaps another appointment');
    throw error;
  }
}
