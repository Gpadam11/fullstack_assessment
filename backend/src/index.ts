import 'dotenv/config'; // This MUST be the first line to load the .env file immediately!
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Import our controllers and middleware
import { register, login, refresh, logout } from './controllers/auth.controller';
import { getTasks, createTask, getTask, updateTask, toggleTask, deleteTask } from './controllers/task.controller';
import { authenticate } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();

// Initialize and verify database connection
async function initDatabase() {
  try {
    console.log('📡 Verifying database connection...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure DATABASE_URL in .env points to the correct database file');
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// --- PUBLIC AUTH ROUTES ---
app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/auth/refresh', refresh);
app.post('/auth/logout', logout);

// --- PROTECTED TASK ROUTES ---
app.get('/tasks', authenticate, getTasks);
app.post('/tasks', authenticate, createTask);
app.get('/tasks/:id', authenticate, getTask);
app.patch('/tasks/:id', authenticate, updateTask);
app.patch('/tasks/:id/toggle', authenticate, toggleTask);
app.delete('/tasks/:id', authenticate, deleteTask);

// Start the server
const PORT = process.env.PORT || 5000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
});