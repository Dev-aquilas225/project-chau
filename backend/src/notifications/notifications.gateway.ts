import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { Notification } from './entities/notification.entity';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@WebSocketGateway({ cors: { origin: true } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private jwtService: JwtService) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('Token manquant');
      const payload = this.jwtService.verify<JwtPayload>(token);
      socket.join(`user:${payload.sub}`);
    } catch {
      this.logger.warn(`Connexion WebSocket refusée: ${socket.id}`);
      socket.disconnect(true);
    }
  }

  emitToUser(userId: string, notification: Notification) {
    this.server?.to(`user:${userId}`).emit('notification', notification);
  }
}
