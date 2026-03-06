import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes'; 
import restaurantRoutes from './routes/restaurantRoutes';
import menuRoutes from './routes/menuRoutes';
import tableRoutes from './routes/tableRoutes';
import orderRoutes from './routes/orderRoutes';
import kdsRoutes from './routes/kdsRoutes';
import billRoutes from './routes/billRoutes';
import paymentRoutes from './routes/paymentRoutes';
import stationRoutes from './routes/stationRoutes';
import uploadRoutes from './routes/uploadRoutes';






const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    //origin: process.env.CLIENT_URL || 'http://localhost:3000',
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);
// Middlewares
app.use(cors({
  //origin: process.env.CLIENT_URL || 'http://localhost:3000',
  origin: '*',
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kds', kdsRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/upload', uploadRoutes);



app.use('/{*any}', (req, res) => {  
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Socket.IO
import { registerSocketHandlers } from './socket/socketHandler';
registerSocketHandlers(io);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
