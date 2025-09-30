/**
 * Simple WebSocket Server for Bomberman Game
 * Handles nickname registration and basic game communication
 */

const WebSocket = require('ws');
const http = require('http');

class BombermanServer {
  constructor(port = 3000) {
    this.port = port;
    this.players = new Map();
    this.gameRooms = new Map();
    
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.setupWebSocketHandlers();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws) => {
      console.log('New client connected');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
        console.log('Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  handleMessage(ws, message) {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'set_nickname':
        this.handleSetNickname(ws, message);
        break;
        
      case 'game_action':
        this.handleGameAction(ws, message);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
        this.sendError(ws, 'Unknown message type');
    }
  }

  handleSetNickname(ws, message) {
    const { nickname } = message;
    
    // Validate nickname
    if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
      this.sendNicknameResponse(ws, false, 'Invalid nickname length (2-20 characters required)');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname.trim())) {
      this.sendNicknameResponse(ws, false, 'Invalid characters in nickname (only letters, numbers, underscore, and dash allowed)');
      return;
    }
    
    // Check if nickname is already taken
    const sanitizedNickname = nickname.trim();
    const existingPlayer = Array.from(this.players.values()).find(p => p.nickname === sanitizedNickname);
    
    if (existingPlayer) {
      this.sendNicknameResponse(ws, false, 'Nickname already taken');
      return;
    }
    
    // Create player
    const playerId = this.generatePlayerId();
    const player = {
      id: playerId,
      nickname: sanitizedNickname,
      ws: ws,
      joinedAt: new Date(),
      isActive: true
    };
    
    this.players.set(playerId, player);
    ws.playerId = playerId;
    
    this.sendNicknameResponse(ws, true, 'Nickname set successfully', sanitizedNickname, playerId);
    
    console.log(`Player ${sanitizedNickname} (${playerId}) joined the game`);
  }

  handleGameAction(ws, message) {
    const playerId = ws.playerId;
    if (!playerId) {
      this.sendError(ws, 'Player not registered');
      return;
    }
    
    const player = this.players.get(playerId);
    if (!player) {
      this.sendError(ws, 'Player not found');
      return;
    }
    
    console.log(`Game action from ${player.nickname}:`, message.action);
    
    // Broadcast game action to other players (if in multiplayer mode)
    this.broadcastGameAction(playerId, message.action);
  }

  handleDisconnect(ws) {
    const playerId = ws.playerId;
    if (playerId && this.players.has(playerId)) {
      const player = this.players.get(playerId);
      console.log(`Player ${player.nickname} (${playerId}) disconnected`);
      this.players.delete(playerId);
    }
  }

  sendNicknameResponse(ws, success, message, nickname = null, playerId = null) {
    const response = {
      type: 'nickname_response',
      success,
      message,
      nickname,
      playerId,
      timestamp: Date.now()
    };
    
    this.sendMessage(ws, response);
  }

  sendError(ws, message) {
    const response = {
      type: 'error',
      message,
      timestamp: Date.now()
    };
    
    this.sendMessage(ws, response);
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcastGameAction(fromPlayerId, action) {
    const message = {
      type: 'game_update',
      fromPlayer: fromPlayerId,
      action,
      timestamp: Date.now()
    };
    
    this.players.forEach((player, playerId) => {
      if (playerId !== fromPlayerId && player.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(player.ws, message);
      }
    });
  }

  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getPlayerCount() {
    return this.players.size;
  }

  getPlayerList() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      joinedAt: p.joinedAt,
      isActive: p.isActive
    }));
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Bomberman WebSocket server running on port ${this.port}`);
      console.log(`WebSocket endpoint: ws://localhost:${this.port}`);
    });
  }

  stop() {
    this.wss.close();
    this.server.close();
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new BombermanServer(3000);
  server.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = BombermanServer;
