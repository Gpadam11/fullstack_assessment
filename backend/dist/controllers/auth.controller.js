"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper function to generate both tokens
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
// 1. REGISTER a new user
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        // Hash the password securely before saving it to the database
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error?.message || 'Internal server error' });
    }
};
exports.register = register;
// 2. LOGIN an existing user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Compare the plain text password to the hashed password in the DB
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate tokens and save the long-lived refresh token to the user's record
        const { accessToken, refreshToken } = generateTokens(user.id);
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        res.json({ accessToken, refreshToken });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
// 3. REFRESH the access token securely
const refresh = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }
        // Verify the refresh token is valid
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        // Make sure it matches the specific token saved in the database
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.refreshToken !== token) {
            res.status(403).json({ error: 'Invalid refresh token' });
            return;
        }
        // Issue a brand new short-lived access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
};
exports.refresh = refresh;
// 4. LOGOUT - Clear the refresh token from the database
const logout = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        // Clear the refresh token from the user's record
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to logout' });
    }
};
exports.logout = logout;
