/**
 * Tests for event type definitions
 */
import { RealityDefenderEvents, EventName } from '../../src/types';
import { DetectionResult } from '../../src';
import { RealityDefenderError } from '../../src';

describe('Event Types', () => {
  it('should define proper event handler types', () => {
    // Create a mock implementation of the event handlers
    const handlers: RealityDefenderEvents = {
      result: (result: DetectionResult) => {
        // This is just for type checking, no actual implementation needed
        return;
      },
      error: (error: RealityDefenderError) => {
        // This is just for type checking, no actual implementation needed
        return;
      },
    };

    // Check that the handler types are properly defined
    expect(typeof handlers.result).toBe('function');
    expect(typeof handlers.error).toBe('function');
  });

  it('should define event names correctly', () => {
    // Check the type definition by creating variables of the EventName type
    const resultEvent: EventName = 'result';
    const errorEvent: EventName = 'error';

    // Check literal values
    expect(resultEvent).toBe('result');
    expect(errorEvent).toBe('error');
  });
});
