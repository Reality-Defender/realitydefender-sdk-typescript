/**
 * Event handling for the SDK
 */

import EventEmitter from 'events';
import { RealityDefenderEvents, EventName } from '../types/events';

/**
 * Enhanced EventEmitter with typed event handling
 */
export class TypedEventEmitter extends EventEmitter {
  /**
   * Register an event handler with typed parameters
   * @param event Event name
   * @param listener Event handler function
   * @returns this (for chaining)
   */
  public on<K extends EventName>(event: K, listener: RealityDefenderEvents[K]): this {
    return super.on(event, listener as (...args: any[]) => void);
  }

  /**
   * Emit an event with typed parameters
   * @param event Event name
   * @param args Event arguments
   * @returns Whether the event had listeners
   */
  public emit<K extends EventName>(
    event: K, 
    ...args: Parameters<RealityDefenderEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
  
  /**
   * Remove all listeners for all events, or for a specific event
   * @param event Optional event name
   * @returns this (for chaining)
   */
  public removeAllListeners(event?: string): this {
    return super.removeAllListeners(event);
  }
}
