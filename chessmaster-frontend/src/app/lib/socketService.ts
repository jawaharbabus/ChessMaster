import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  // Connect to the Socket.IO server
  connect(url: string): void {
    if (!this.socket) {
      this.socket = io(url);

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });
    }
  }

  // Disconnect from the server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected");
    }
  }

  // Join a specific chat room
  joinRoom(room: string, name: string, color: "white"|"black"): void {
    if (this.socket) {
      console.log(`Joining room ${room} as ${name} with color ${color}`);
      this.socket.emit("joinRoom", {room,name,color});
    }
  }   

  // Leave a specific chat room
  leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit("leaveRoom", room);
    }
  }

  // Send a message to a specific chat room
  sendMessage(room: string, message: string): void {
    if (this.socket) {
      this.socket.emit("sendMessage", { room, message });
    }
  }

  // Listener for receiving messages
  onMessageReceived(messageCallBack: (message: any) => void,errorCallBack: (message: any) => void): void {
    if (this.socket) {
      this.socket.on("message", messageCallBack);
      this.socket.on("roomJoinFail", errorCallBack);
    }

  }

  // Listener for errors
  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }
}

// Create a singleton instance of the SocketService
const socketService = new SocketService();
export default socketService;