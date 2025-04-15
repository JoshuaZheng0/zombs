import WebSocket, { WebSocketServer } from 'ws'; 
import { v4 as uuidv4 } from 'uuid';
import { ClientsMap, PlayerStatesMap } from './types';

// Create a WebSocket server that listens on port 3000
const wss = new WebSocketServer({ port: 3000 });

// Maps to keep track of clients and their corresponding player states
const clientsMap: ClientsMap = new Map();
const playerStates: PlayerStatesMap = new Map();

// A variable to count the number of connected clients
let numClients = 0;

// Buffer and DataView for handling binary data (received from clients)
let buffer: ArrayBuffer;
let view: DataView;

// When a new client connects to the server
wss.on('connection', (ws: WebSocket) => {
  // Generate a unique ID for the client
  const clientId = uuidv4(); // Unique string identifier for the client
  numClients++;  // Increment the client count
  clientsMap.set(clientId, ws);  // Store the WebSocket connection associated with the client ID
  playerStates.set(clientId, { x: 0, y: 0 });  // Initialize player state for the new client with x, y coordinates
  console.log(`Client ${clientId} connected`);  // Log the new connection

  // Handle incoming messages from the client
  ws.on('message', (message: WebSocket.RawData) => {
    // Check if the received message is a Buffer (binary data)
    if (Buffer.isBuffer(message)) {
      // Convert the Buffer to an ArrayBuffer
      buffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength);
      
      // Create a DataView to read data from the ArrayBuffer
      view = new DataView(buffer);
      
      // Read the x and y coordinates from the DataView (little endian format)
      const x = view.getFloat32(0, true); // Get 4 bytes for x-coordinate
      const y = view.getFloat32(4, true); // Get 4 bytes for y-coordinate
      
      // Update the player state with the received coordinates
      playerStates.set(clientId, { x, y });
      console.log(`Received coords: ${x}, ${y}`);  // Log the received coordinates
    } else {
      // Handle non-binary messages (if needed)
      console.log('Received non-binary message:', message.toString());
    }
  });

  // Handle the client disconnecting
  ws.on('close', () => {
    numClients--;  // Decrement the client count
    clientsMap.delete(clientId);  // Remove the client from the map of connected clients
    console.log(`Client ${clientId} disconnected`);  // Log the disconnection
  });

  // Handle errors related to the client's WebSocket connection
  ws.on('error', (err: Error) => {
    console.error(`Error with client ${clientId}:`, err);  // Log any error
  });
});

// Set an interval to send updates to all connected clients every 100ms
setInterval(() => {
  // Create a snapshot of the player states to send to clients
  const playerData = Array.from(playerStates.entries()).map(([id, state]) => ({
    id,
    x: state.x,
    y: state.y,
  }));

  // Create a buffer to hold the data (2 floats per player, so 8 bytes per player)
  const buffer = new ArrayBuffer(playerData.length * 8);  // 8 bytes for each player (2 Float32 values for x and y)
  
  // Create a Float32Array to easily manipulate the data in the buffer
  const view = new Float32Array(buffer); 

  let offset = 0;
  // Loop through the player data and write their x and y coordinates to the buffer
  for (const { x, y } of playerData) {
    view[offset++] = x;  // Store x coordinate in the buffer
    view[offset++] = y;  // Store y coordinate in the buffer
  }

  // Send the buffer as binary data to all connected clients
  for (const [clientId, ws] of clientsMap.entries()) {
    try {
      ws.send(buffer);  // Send the ArrayBuffer as binary data to the client
    } catch (err) {
      console.error(`Failed to send to ${clientId}:`, err);  // Log if sending the data fails
    }
  }
}, 100); // Send updates every 100ms
