import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/', path: '/socket.io' })
export class BookingsGateway {
  @WebSocketServer()
  server: Server;

  booked(slotId: string, bookingId: string) {
    this.server.emit('slot.booked', { slotId, bookingId, available: false });
  }

  released(slotId: string, bookingId: string) {
    this.server.emit('slot.released', { slotId, bookingId, available: true });
  }
}
