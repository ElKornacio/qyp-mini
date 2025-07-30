import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
	console.error('Error:', err);

	const errorResponse: ErrorResponse = {
		success: false,
		error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
		timestamp: new Date().toISOString(),
	};

	res.status(500).json(errorResponse);
};
