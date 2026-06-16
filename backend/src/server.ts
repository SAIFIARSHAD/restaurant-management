import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
import rawMaterialRoutes from './routes/rawMaterialRoutes';
import recipeRoutes from './routes/recipeRoutes';
import vendorRoutes from './routes/vendorRoutes';
import reportRoutes from './routes/reportRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import exportRoutes from './routes/exportRoutes';
import employeeRoutes from './routes/employeeRoutes';
import { startAttendanceCron } from './utils/attendanceCron';
import payrollRoutes from './routes/payrollRoutes';
import expenseRoutes from './routes/expenseRoutes';
import { helmetConfig, sanitize, hppProtect, generalLimiter, authLimiter } from './middleware/security';
import { auditLogger } from './middleware/auditLogger';
import auditRoutes from './routes/auditRoutes';
import { errorHandler } from './middleware/errorHandler';
import settingsRoutes from './routes/settingsRoutes';
import { createIndexes } from './config/indexes';
import dashboardRoutes from './routes/dashboardRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);


app.use(helmetConfig);
app.use(hppProtect);
app.use(sanitize);

app.use(cors({
  origin: '*',
  credentials: false
}));


app.use(compression());


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', generalLimiter);


app.use('/api', auditLogger);


app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`
  });
});


app.use('/api/auth', authLimiter, authRoutes); 
app.use('/api/public', publicRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kds', kdsRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/inventory', rawMaterialRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);


 
app.use('/{*any}', (req, res) => {  
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


app.use(errorHandler);


import { registerSocketHandlers } from './socket/socketHandler';
registerSocketHandlers(io);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createIndexes();
  startAttendanceCron();
  httpServer.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
