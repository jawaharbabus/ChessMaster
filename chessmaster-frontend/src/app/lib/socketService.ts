// socketService.ts
import { io, Socket } from "socket.io-client";

type typeColor = "white" | "black";
type typeTime = 10 | 15 | 20 | 30 | null;

class SocketService {
  private socket: Socket | null = null;

  connect(url: string) {
    if (!this.socket) {
      this.socket = io(url,{
        rejectUnauthorized: false,
      });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  createRoom(name: string, roomName: string, color: typeColor, time: typeTime, callerId: string) {
    this.socket?.emit('createRoom', { name, roomName, color, callerId, time });
  }

  joinRoom(name: string, roomName: string, callerId: string) {
    this.socket?.emit('joinRoom', {name, roomName, callerId });
  }

  sendMessage(room: string, message: string): void {
    if (this.socket) {
      this.socket.emit("sendMessage", { room, message });
    }
  }

  onMessageReceived(
    onChessMove: (msg: any) => void,
    onRoomJoined: (msg: any) => void,
    onMemberJoined: (msg: any) => void,
    onStartGame: (msg: any) => void,
    onError: (err: any) => void,
  ) {
    if (!this.socket) return;

    this.socket.on('chessMove', (data) => onChessMove(data));
    this.socket.on('joinedRoom', (msg) => onRoomJoined(msg));
    this.socket.on('memberJoined', (msg) => onMemberJoined(msg));
    this.socket.on('startGame', (msg) => onStartGame(msg));
    this.socket.on('gameError', (err) => onError(err));
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }
}

// Create a singleton instance of the SocketService
const socketService = new SocketService();
export default socketService;
