import { ConsoleLogger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { Server, Socket } from 'socket.io';

interface Client {
  id: string;
  name: string;
  color: "white" | "black";
  callerId: string;
}

interface Room {
  roomName: string;
  time: string;
  host: Client;
  member?: Client;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for testing; restrict in production
  },
  // transports: ['websocket', 'polling'],
  // secure: true,
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private rooms: Record<string, Room> = {}; // Store rooms and their members

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove the client from any room they are part of
    for (const roomName in this.rooms) {
      const room = this.rooms[roomName];
      if (room.host.id === client.id) {
        delete this.rooms[roomName];
      } else if (room.member && room.member.id === client.id) {
        room.member = undefined;
      }
    }
  }


  @SubscribeMessage('createRoom')
  createRoom(client: Socket, { name, roomName, color, callerId, time }: { name: string; roomName: string; color: 'white' | 'black'; callerId: string; time: string }) {
    if (this.rooms[roomName]) {
      client.emit('gameError', `Room "${roomName}" already exists.`);
      return 'Room already exists';
    }

    const host: Client = { id: client.id, name, color, callerId };
    this.rooms[roomName] = { roomName, time, host };

    client.join(roomName);
    client.emit('createdRoom', `You created room: ${roomName}`);
    console.log(`Room "${roomName}" created by ${client.id} (${name}) with color ${color} at ${time}`);
    return `Room "${roomName}" created successfully`;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, { name, roomName, callerId }: { name:string; roomName: string; callerId: string }) {
    const room = this.rooms[roomName];
    if (!room) {
      client.emit('gameError', `Room "${roomName}" does not exist.`);
      return 'Room does not exist';
    }

    if (room.member) {
      client.emit('gameError', 'This room already has two participants.');
      return 'Room full';
    }

    const color = room.host.color === 'white' ? 'black' : 'white';
    const member: Client = { id: client.id, name: name, color, callerId };

    room.member = member;

    client.join(roomName);
    client.emit('joinedRoom', JSON.stringify({ room: roomName, color: color }));
    this.server.to(room.host.id).emit('memberJoined', JSON.stringify({ callerId: member.callerId }));
    this.server.to(roomName).emit('startGame', `Game started between ${room.host.name} and ${member.name}`);

    console.log(`User ${client.id} joined room ${roomName} with color ${color}`);
    return `User ${client.id} joined room ${roomName} with color ${color}`;
  }



  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, { room, message }: { room: string; message: string }): void {
    console.log(`Message from ${client.id} in room ${room}: ${message}`);
    if (!this.rooms[room] || (this.rooms[room].host.id !== client.id && (!this.rooms[room].member || this.rooms[room].member.id !== client.id))) {
      client.emit('gameError', 'You are not part of this room.');
      return;
    }
    // Relay the message to the other user in the room
    client.to(room).emit('chessMove', { sender: client.id, message });
  }
}
