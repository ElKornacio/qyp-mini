export interface DatabaseCredentials {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	type: 'postgres' | 'mysql' | 'sqlite';
	ssl?: boolean;
}

export interface SqlRequest {
	credentials: DatabaseCredentials;
	query: string;
	parameters?: any[];
}

export interface SqlResponse {
	success: boolean;
	data?: any[];
	error?: string;
	executionTime?: number;
	rowCount?: number;
}

export interface ErrorResponse {
	success: false;
	error: string;
	timestamp: string;
}
