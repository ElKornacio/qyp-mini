import 'reflect-metadata';

import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import { generalRateLimit } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import sqlRoutes from './routes/sql';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || true, // Allow all origins in development
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);

// General rate limiting
app.use(generalRateLimit);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'SQL Proxy Server is running',
		timestamp: new Date().toISOString(),
	});
});

// API routes
app.use('/api', sqlRoutes);

// Root endpoint
app.get('/', (req, res) => {
	res.json({
		success: true,
		message: 'SQL Proxy Server',
		version: '1.0.0',
		endpoints: {
			health: 'GET /health',
			select: 'POST /api/select',
		},
	});
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: 'Endpoint not found',
		timestamp: new Date().toISOString(),
	});
});

app.listen(PORT, () => {
	console.log(`🚀 SQL Proxy Server is running on port ${PORT}`);
	console.log(`📍 Health check: http://localhost:${PORT}/health`);
	console.log(`📡 API endpoint: http://localhost:${PORT}/api/select`);
});
