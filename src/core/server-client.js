/**
 * Server Client
 * Handles WebSocket communication with the game server
 */

export class ServerClient {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'ws://localhost:3000';
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 1000;
    
    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onMessage: null,
      onError: null,
      onNicknameResponse: null,
      onGameUpdate: null
    };
  }

  connect() {
    try {
      this.socket = new WebSocket(this.serverUrl);
      
      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Connected to server');
        
        if (this.callbacks.onConnect) {
          this.callbacks.onConnect();
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.log('Disconnected from server');
        
        if (this.callbacks.onDisconnect) {
          this.callbacks.onDisconnect();
        }
        
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
    } catch (error) {
      console.error('Failed to connect to server:', error);
      // For development, we'll simulate server responses
      this.simulateOfflineMode();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  send(message) {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: not connected to server');
      // Simulate response for offline development
      this.simulateResponse(message);
    }
  }

  sendNickname(nickname) {
    this.send({
      type: 'set_nickname',
      nickname: nickname,
      timestamp: Date.now()
    });
  }

  sendGameAction(action) {
    this.send({
      type: 'game_action',
      action: action,
      timestamp: Date.now()
    });
  }

  handleMessage(message) {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage(message);
    }

    switch (message.type) {
      case 'nickname_response':
        if (this.callbacks.onNicknameResponse) {
          this.callbacks.onNicknameResponse(message);
        }
        break;
      
      case 'game_update':
        if (this.callbacks.onGameUpdate) {
          this.callbacks.onGameUpdate(message);
        }
        break;
      
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached. Switching to offline mode.');
      this.simulateOfflineMode();
    }
  }

  simulateOfflineMode() {
    console.log('Running in offline mode (no server connection)');
    this.isConnected = false;
    
    // Simulate connection for development
    setTimeout(() => {
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    }, 100);
  }

  simulateResponse(message) {
    // Simulate server responses for offline development
    setTimeout(() => {
      if (message.type === 'set_nickname') {
        const response = {
          type: 'nickname_response',
          success: true,
          nickname: message.nickname,
          playerId: 'offline_' + Math.random().toString(36).substr(2, 9),
          message: 'Nickname set successfully (offline mode)'
        };
        
        if (this.callbacks.onNicknameResponse) {
          this.callbacks.onNicknameResponse(response);
        }
      }
    }, 200);
  }

  // Event listeners
  onConnect(callback) {
    this.callbacks.onConnect = callback;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
  }

  onMessage(callback) {
    this.callbacks.onMessage = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onNicknameResponse(callback) {
    this.callbacks.onNicknameResponse = callback;
  }

  onGameUpdate(callback) {
    this.callbacks.onGameUpdate = callback;
  }
}
