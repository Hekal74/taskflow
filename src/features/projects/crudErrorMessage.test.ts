import { describe, expect, it } from '@jest/globals';
import { ApiError } from '../../api/api';
import { getCrudErrorMessage } from './crudErrorMessage';

describe('getCrudErrorMessage', () => {
  const fallback = 'Failed to save project. Please try again.';

  it.each(['Project not found', 'You are not authorized'])(
    'preserves useful API message: %s',
    (message) => {
      expect(getCrudErrorMessage(new ApiError(message, 404), fallback)).toBe(
        message,
      );
    },
  );

  it.each([
    'Internal server error: database credentials unavailable',
    'Error: request failed\n    at saveProject (node_modules/app.js:1:1)',
    'Request failed',
  ])('uses the fallback for technical or generic API message: %s', (message) => {
    expect(getCrudErrorMessage(new ApiError(message, 500), fallback)).toBe(
      fallback,
    );
  });

  it('uses the fallback for non-API errors', () => {
    expect(getCrudErrorMessage(new Error('private details'), fallback)).toBe(
      fallback,
    );
  });
});
