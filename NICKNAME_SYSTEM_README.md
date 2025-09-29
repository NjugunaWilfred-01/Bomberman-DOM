# Bomberman DOM - Nickname System

This document explains how to test the new nickname input system that has been added to the Bomberman DOM game.

## Features Added

### 1. Nickname Input Screen
- Beautiful, responsive nickname input form
- Real-time validation with visual feedback
- Connection status indicator
- Requirements display
- Loading states and error handling

### 2. Server Communication
- WebSocket client for real-time communication
- Automatic reconnection with fallback to offline mode
- Nickname validation and registration
- Game action broadcasting

### 3. Game Integration
- Player nickname display in game HUD
- Connection status indicator
- Server communication for game actions
- Seamless transition from nickname to game

## How to Test

### Option 1: Client-Only Testing (Offline Mode)
The system works without a server and will automatically fall back to offline mode.

1. **Start the web server:**
   ```bash
   python3 -m http.server 8080
   ```

2. **Open the game:**
   - Navigate to `http://localhost:8080`
   - You should see the nickname input screen

3. **Test the nickname input:**
   - Try entering various nicknames to test validation
   - Invalid examples: `a` (too short), `this-is-a-very-long-nickname-that-exceeds-limit` (too long), `nick@me` (invalid characters)
   - Valid examples: `Player1`, `BomberMan`, `test_user`, `cool-player`

4. **Submit and play:**
   - Enter a valid nickname and click "Start Game"
   - The system will show "Offline mode" and proceed to the game
   - Your nickname will appear in the game HUD

### Option 2: Full Server Testing
For complete functionality with real server communication:

1. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the WebSocket server:**
   ```bash
   npm start
   ```
   The server will run on `ws://localhost:3000`

3. **Start the web server (in another terminal):**
   ```bash
   cd ..
   python3 -m http.server 8080
   ```

4. **Test with server:**
   - Navigate to `http://localhost:8080`
   - The connection indicator should show "Connected to server"
   - Enter a nickname and submit
   - The server will validate and respond
   - Try using the same nickname in multiple browser tabs to test duplicate detection

## Testing Scenarios

### Nickname Validation
- **Too short:** `a` → Should show error
- **Too long:** `this-is-way-too-long-for-a-nickname` → Should show error  
- **Invalid characters:** `user@domain.com`, `player#1`, `test user` → Should show error
- **Valid nicknames:** `Player1`, `BomberMan`, `test_user`, `cool-player` → Should work

### Connection States
- **With server running:** Should show "Connected to server" (green dot)
- **Without server:** Should show "Offline mode" (red dot) 
- **Server disconnection:** Should attempt reconnection and fall back to offline

### Game Integration
- **Player nickname:** Should appear in the game HUD
- **Connection status:** Should show online/offline indicator in game
- **Game actions:** Bomb placement should be sent to server (check server logs)

## UI Features

### Nickname Screen
- **Responsive design:** Works on different screen sizes
- **Visual feedback:** Input validation with color coding
- **Loading states:** Shows spinner during connection/validation
- **Help text:** Clear requirements and keyboard shortcuts
- **Status indicators:** Real-time connection status

### Game Screen  
- **Player identification:** Nickname displayed in HUD
- **Connection indicator:** Shows online/offline status
- **Seamless integration:** No disruption to existing gameplay

## Server API

The WebSocket server accepts these message types:

### Set Nickname
```json
{
  "type": "set_nickname",
  "nickname": "PlayerName",
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "type": "nickname_response", 
  "success": true,
  "nickname": "PlayerName",
  "playerId": "player_abc123_1234567890",
  "message": "Nickname set successfully"
}
```

### Game Action
```json
{
  "type": "game_action",
  "action": {
    "type": "place_bomb",
    "position": {"x": 64, "y": 64},
    "playerId": "player_abc123_1234567890"
  },
  "timestamp": 1234567890
}
```

## File Structure

```
src/
├── app.js                          # Main application controller
├── core/
│   ├── game-state-manager.js       # Manages different screens and states
│   ├── server-client.js            # WebSocket communication
│   └── game-renderer.js            # Game rendering (updated)
├── components/
│   └── nickname-screen.js          # Nickname input UI component
└── game.js                         # Entry point (simplified)

server/
├── simple-server.js                # WebSocket server
├── package.json                    # Server dependencies
└── README.md                       # Server documentation

styles.css                          # Updated with nickname screen styles
```

## Next Steps

The nickname system is now fully functional and ready for:
- **Multiplayer features:** Player identification and game state synchronization
- **Leaderboards:** Player scoring and statistics
- **Chat system:** Player communication
- **Room management:** Multiple game rooms with player lists

The foundation is in place for expanding into a full multiplayer Bomberman experience!
