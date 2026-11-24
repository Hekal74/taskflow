import '@testing-library/jest-dom/jest-globals';
import { cleanup } from '@testing-library/react/pure';
import { afterEach } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

afterEach(() => {
  cleanup();
});
