import { ApiError } from '../../api/api';

export function getCrudErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;

  const message = error.message.trim();
  const genericMessages = new Set([
    'request failed',
    'network error',
    'invalid server response',
    'validation failed',
    'internal error',
    'internal server error',
  ]);
  const containsTechnicalDetails =
    message.length > 200 ||
    /[\r\n]|https?:\/\/|\b(?:Error|TypeError|ReferenceError|SyntaxError):|\bat\s+\S+\s+\(|(?:node_modules|webpack|chunk)[/\\]/i.test(
      message,
    ) ||
    /^internal(?:\s+(?:server\s+)?error)\b/i.test(message);

  return !message ||
    genericMessages.has(message.toLowerCase()) ||
    containsTechnicalDetails
    ? fallback
    : message;
}
