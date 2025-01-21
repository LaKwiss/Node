import { WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

const WS_PORT = 8080;
const MONGO_URL = 'mongodb://192.168.20.144:27017/';
let mongoClient;

async function initMongoDB() {
  try {
    mongoClient = await MongoClient.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
    return mongoClient.db();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

function validateMessage(data) {
  try {
    const message = JSON.parse(data);
    // Add your validation logic here
    return message;
  } catch (error) {
    throw new Error('Invalid message format');
  }
}

async function handleMessage(ws, data, db) {
  try {
    const message = validateMessage(data);
    
    // Log message to MongoDB
    await db.collection('messages').insertOne({
      timestamp: new Date(),
      content: message
    });

    // Echo back the message
    ws.send(JSON.stringify({
      type: 'ECHO',
      content: message,
      timestamp: new Date()
    }));

    console.log('Message received:', message);
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: error.message
    }));
  }
}

async function startServer() {
  const db = await initMongoDB();
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('message', async (data) => {
      await handleMessage(ws, data, db);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await mongoClient?.close();
    process.exit(0);
  });

  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
}

startServer().catch(console.error);