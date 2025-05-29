/**
 * Tests for TypedEventEmitter
 */
import { TypedEventEmitter } from '../../src/core/events';
import { RealityDefenderError } from '../../src/errors';
import { DetectionResult } from '../../src/types';

describe('TypedEventEmitter', () => {
  let emitter: TypedEventEmitter;
  
  beforeEach(() => {
    emitter = new TypedEventEmitter();
  });
  
  it('should register and emit a result event with typed parameters', () => {
    const mockResult: DetectionResult = {
      status: 'ARTIFICIAL',
      score: 95,
      models: [
        {
          name: 'model-1',
          status: 'ARTIFICIAL',
          score: 95
        }
      ]
    };
    
    // Create a mock listener
    const listener = jest.fn();
    
    // Register the listener
    emitter.on('result', listener);
    
    // Emit an event
    emitter.emit('result', mockResult);
    
    // Verify the listener was called with the correct parameters
    expect(listener).toHaveBeenCalledWith(mockResult);
  });
  
  it('should register and emit an error event with typed parameters', () => {
    const mockError = new RealityDefenderError('Test error', 'unknown_error');
    
    // Create a mock listener
    const listener = jest.fn();
    
    // Register the listener
    emitter.on('error', listener);
    
    // Emit an event
    emitter.emit('error', mockError);
    
    // Verify the listener was called with the correct parameters
    expect(listener).toHaveBeenCalledWith(mockError);
  });
  
  it('should allow multiple listeners for the same event', () => {
    const mockResult: DetectionResult = {
      status: 'AUTHENTIC',
      score: 10,
      models: []
    };
    
    // Create mock listeners
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    
    // Register multiple listeners
    emitter.on('result', listener1);
    emitter.on('result', listener2);
    
    // Emit an event
    emitter.emit('result', mockResult);
    
    // Verify both listeners were called with the correct parameters
    expect(listener1).toHaveBeenCalledWith(mockResult);
    expect(listener2).toHaveBeenCalledWith(mockResult);
  });
  
  it('should not emit events to incorrect event types', () => {
    const mockResult: DetectionResult = {
      status: 'ARTIFICIAL',
      score: 95,
      models: []
    };
    
    const mockError = new RealityDefenderError('Test error', 'unknown_error');
    
    // Create mock listeners
    const resultListener = jest.fn();
    const errorListener = jest.fn();
    
    // Register listeners
    emitter.on('result', resultListener);
    emitter.on('error', errorListener);
    
    // Emit events
    emitter.emit('result', mockResult);
    
    // Verify only the correct listener was called
    expect(resultListener).toHaveBeenCalledWith(mockResult);
    expect(errorListener).not.toHaveBeenCalled();
    
    // Reset mocks and test the other direction
    jest.clearAllMocks();
    emitter.emit('error', mockError);
    
    expect(errorListener).toHaveBeenCalledWith(mockError);
    expect(resultListener).not.toHaveBeenCalled();
  });
}); 