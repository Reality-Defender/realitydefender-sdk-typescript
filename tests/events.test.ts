/**
 * Tests for event handling in the SDK
 */
import { TypedEventEmitter } from '../src/core/events';
import { RealityDefenderError } from '../src';
import { DetectionResult } from '../src';

describe('TypedEventEmitter', () => {
  it('should register event handlers with on() method', () => {
    const emitter = new TypedEventEmitter();

    // Create spy functions
    const resultHandler = jest.fn();
    const errorHandler = jest.fn();

    // Register handlers
    emitter.on('result', resultHandler);
    emitter.on('error', errorHandler);

    // Create mock data
    const mockResult: DetectionResult = {
      status: 'MANIPULATED',
      score: 95,
      models: [],
    };

    const mockError = new RealityDefenderError('Test error', 'unknown_error');

    // Emit events
    emitter.emit('result', mockResult);
    emitter.emit('error', mockError);

    // Verify handlers were called with correct arguments
    expect(resultHandler).toHaveBeenCalledWith(mockResult);
    expect(errorHandler).toHaveBeenCalledWith(mockError);
  });

  it('should allow removing event listeners', () => {
    const emitter = new TypedEventEmitter();

    const handler = jest.fn();

    // Register handler
    emitter.on('result', handler);

    // Remove handler using EventEmitter's removeListener method
    (emitter as any).removeListener('result', handler);

    // Emit event
    emitter.emit('result', { status: 'MANIPULATED', score: 90, models: [] });

    // Verify handler was not called
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return true when emitting event with listeners', () => {
    const emitter = new TypedEventEmitter();

    // Register handler
    emitter.on('result', () => {});

    // Check return value of emit()
    const result = emitter.emit('result', { status: 'MANIPULATED', score: 90, models: [] });

    expect(result).toBe(true);
  });

  it('should return false when emitting event without listeners', () => {
    const emitter = new TypedEventEmitter();

    // No handlers registered

    // Check return value of emit()
    const result = emitter.emit('result', { status: 'MANIPULATED', score: 90, models: [] });

    expect(result).toBe(false);
  });

  it('should support chaining on() method', () => {
    const emitter = new TypedEventEmitter();

    const handler1 = jest.fn();
    const handler2 = jest.fn();

    // Chain on() calls
    emitter.on('error', handler1).on('error', handler2);

    // Emit event
    const error = new RealityDefenderError('Test error', 'unknown_error');
    emitter.emit('error', error);

    // Verify both handlers were called
    expect(handler1).toHaveBeenCalledWith(error);
    expect(handler2).toHaveBeenCalledWith(error);
  });

  it('should allow removing all listeners with removeAllListeners()', () => {
    const emitter = new TypedEventEmitter();

    const handler1 = jest.fn();

    // Register handlers for both event types
    emitter.on('result', handler1);

    // Keep the error handler attached to properly handle the error
    const errorHandler = jest.fn(error => {
      // Handle the error to prevent unhandled rejection
      // No need to do anything, just make sure it's handled
    });
    emitter.on('error', errorHandler);

    // Remove all listeners except error handler
    (emitter as any).removeAllListeners('result');

    // Emit events
    emitter.emit('result', { status: 'MANIPULATED', score: 90, models: [] });

    // Create the error before emitting
    const testError = new RealityDefenderError('Test error', 'unknown_error');
    emitter.emit('error', testError);

    // Verify handlers were not called for result
    expect(handler1).not.toHaveBeenCalled();
    // Error handler should be called
    expect(errorHandler).toHaveBeenCalledWith(testError);
  });
});
