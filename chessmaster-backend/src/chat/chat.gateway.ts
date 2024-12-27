import { ConsoleLogger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Client {
  id: string;
  name: string;
  color: "white" | "black";
};

@WebSocketGateway(4000,{
  cors: {
    origin: '*', // Allow all origins for testing; restrict in production
  },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private rooms: Record<string, Client[]> = {}; // Store rooms and their members

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove the client from any room they are part of
    for (const room in this.rooms) {
      this.rooms[room] = this.rooms[room].filter((c) => c.id !== client.id);
      if (this.rooms[room].length === 0) {
        delete this.rooms[room]; // Clean up empty rooms
      }
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, {room,name,color}:{room: string, name:string, color: 'white'|'black'}) {

    if (!this.rooms[room]) {
      this.rooms[room] = [];
    }

    if (this.rooms[room].length >= 2) {
      client.emit('roomJoinFail', 'This room already has two participants.');
      return 'Room full';
    }
    
    // Check if the name or color is already taken
    const isNameTaken = this.rooms[room].some((existingClient) => existingClient.name === name);
    const isColorTaken = this.rooms[room].some((existingClient) => existingClient.color === color);

    if (isNameTaken) {
      client.emit('roomJoinFail', `The name "${name}" is already taken in this room.`);
      return 'Name already taken';
    }

    if (isColorTaken) {
      client.emit('roomJoinFail', `The color "${color}" is already taken in this room.`);
      return 'Color already taken';
    }

    // Add the client to the room
    this.rooms[room].push({ id: client.id, name: name, color: color });room
    client.join(room);
    client.emit('joinedRoom', `You joined room: ${room}`);
    this.server.to(room).emit('roomUpdate', `User ${client.id} joined the room`);
    console.log(`User ${client.id} ${name} joined room ${room} with color ${color}`);
    return `User ${client.id} ${name} joined room ${room} with color ${color}`;
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, { room, message }: { room: string; message: string }): void {
    
    if (!this.rooms[room] || !this.rooms[room].some(c => client.id === c.id)) {
      client.emit('error', 'You are not part of this room.');
      return;
    }
    // Relay the message to the other user in the room
    client.to(room).emit('message', { sender: client.id, message });
  }
}
