import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect(userCode?: string) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    this.socket = io(socketUrl, {
      auth: {
        token: localStorage.getItem('auth_token') || localStorage.getItem('admin_token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      
      if (userCode) {
        this.socket?.emit('join-user-room', userCode);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Restore event listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  // Community real-time
  joinCommunity() {
    this.emit('join-community');
  }

  leaveCommunity() {
    this.emit('leave-community');
  }

  // Admin dashboard real-time
  joinAdminDashboard() {
    this.emit('join-admin-dashboard');
  }

  leaveAdminDashboard() {
    this.emit('leave-admin-dashboard');
  }

  // Messaging
  sendMessage(data: { recipientCode: string; message: string }) {
    this.emit('send-message', data);
  }
}

export const socketService = new SocketService();