import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

let counter = 0;

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // When the server receives a message from the client
  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}, Type: ${typeof message}`); // Log the type of the received message
    const messageString = Buffer.isBuffer(message) ? message.toString() : message;
    if (messageString === 'increment') {  // Trim spaces or invisible characters
      console.log(`received message: ${message}`);
      counter++;
      console.log(`Counter updated: ${counter}`);
      // Send the updated counter back to the client
      ws.send(counter.toString());
    }
  });

  // When the connection is closed
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error('WebSocket error: ', err);
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
