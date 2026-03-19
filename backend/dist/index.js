"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // This MUST be the first line to load the .env file immediately!
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
// Import our controllers and middleware
const auth_controller_1 = require("./controllers/auth.controller");
const task_controller_1 = require("./controllers/task.controller");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Initialize and verify database connection
async function initDatabase() {
    try {
        console.log('📡 Verifying database connection...');
        const result = await prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connection verified');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Make sure DATABASE_URL in .env points to the correct database file');
        process.exit(1);
    }
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- PUBLIC AUTH ROUTES ---
app.post('/auth/register', auth_controller_1.register);
app.post('/auth/login', auth_controller_1.login);
app.post('/auth/refresh', auth_controller_1.refresh);
app.post('/auth/logout', auth_controller_1.logout);
// --- PROTECTED TASK ROUTES ---
app.get('/tasks', auth_1.authenticate, task_controller_1.getTasks);
app.post('/tasks', auth_1.authenticate, task_controller_1.createTask);
app.get('/tasks/:id', auth_1.authenticate, task_controller_1.getTask);
app.patch('/tasks/:id', auth_1.authenticate, task_controller_1.updateTask);
app.patch('/tasks/:id/toggle', auth_1.authenticate, task_controller_1.toggleTask);
app.delete('/tasks/:id', auth_1.authenticate, task_controller_1.deleteTask);
// Start the server
const PORT = process.env.PORT || 5000;
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
});
