/**
 * Базовый интерфейс для запроса
 */
export interface BaseRequest {
	command: string;
}

export interface BaseSuccessResponse<T = any> {
	status: 'success';
	result: T;
}

export interface BaseErrorResponse {
	status: 'error';
	error: string;
	stack?: string;
}

export type BaseResponse<T = any> = BaseSuccessResponse<T> | BaseErrorResponse;
