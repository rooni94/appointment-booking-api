import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Appointment } from '@prisma/client';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppointmentsGateway {
  @WebSocketServer()
  server: Server;

  created(appointment: Appointment) {
    this.server.emit('appointment.created', appointment);
  }

  updated(appointment: Appointment) {
    this.server.emit('appointment.updated', appointment);
  }

  cancelled(appointment: Appointment) {
    this.server.emit('appointment.cancelled', appointment);
  }
}
