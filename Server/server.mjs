// server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('Received:', message);
    
    // Echo back the message
    ws.send(JSON.stringify({
      type: 'ECHO',
      content: message
    }));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('Server running on ws://localhost:8080');