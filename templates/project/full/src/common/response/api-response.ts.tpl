export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { success: true, data, ...(meta && { meta }) };
}

export function created<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function noContent(): ApiResponse<never> {
  return { success: true };
}

export function fail(message: string): ApiResponse<never> {
  return { success: false, message };
}
