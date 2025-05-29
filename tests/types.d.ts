/**
 * Type definitions for test environment
 */

import { jest } from '@jest/globals';

declare global {
  // Extend NodeJS namespace
  namespace NodeJS {
    // No need to extend global since Jest types are already available
  }

  // Re-export Jest
  const jest: typeof jest;
}

// Make this a module
export {}; 