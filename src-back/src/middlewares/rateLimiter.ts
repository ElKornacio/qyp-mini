import rateLimit from 'express-rate-limit';

export const sqlRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 10, // Maximum 10 requests per minute per IP
	message: {
		success: false,
		error: 'Too many SQL requests from this IP, please try again later.',
		timestamp: new Date().toISOString(),
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Maximum 100 requests per minute per IP
	message: {
		success: false,
		error: 'Too many requests from this IP, please try again later.',
		timestamp: new Date().toISOString(),
	},
	standardHeaders: true,
	legacyHeaders: false,
});
