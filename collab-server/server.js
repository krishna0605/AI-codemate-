const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { YSocketIO } = require('y-socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://ai-codemate.vercel.app'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Initialize Y-Socket.IO
const ySocketIO = new YSocketIO(io);

ySocketIO.initialize();

ySocketIO.on('document-loaded', (doc) => {
  console.log(`Document loaded: ${doc.name}`);
});

ySocketIO.on('document-update', (doc, update) => {
  console.log(`Document updated: ${doc.name}`);
});

ySocketIO.on('all-document-connections-closed', (doc) => {
  console.log(`All connections closed for: ${doc.name}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});
