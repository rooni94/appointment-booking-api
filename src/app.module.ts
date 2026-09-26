import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AppointmentsModule],
})
export class AppModule {}
