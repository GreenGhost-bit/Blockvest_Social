const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const algosdk = require('algosdk');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const documentRoutes = require('./routes/documents');
const mfaRoutes = require('./routes/mfa');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

global.io = io;

const uploadsDir = path.join(__dirname, 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const algodClient = new algosdk.Algodv2(
  '',
  'https://testnet-api.algonode.cloud',
  443
);

const indexerClient = new algosdk.Indexer(
  '',
  'https://testnet-idx.algonode.cloud',
  443
);

app.locals.algodClient = algodClient;
app.locals.indexerClient = indexerClient;

app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/mfa', mfaRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Blockvest Social API is running!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for real-time notifications`);
});