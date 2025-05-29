/**
 * Event-related type definitions
 */

import { DetectionResult } from './sdk';
import { RealityDefenderError } from '../errors';

/**
 * Event handler types for the Reality Defender SDK
 */
export interface RealityDefenderEvents {
  /** Emitted when detection results are available */
  result: (result: DetectionResult) => void;
  /** Emitted when an error occurs during analysis or polling */
  error: (error: RealityDefenderError) => void;
}

/**
 * Event names supported by the SDK
 */
export type EventName = keyof RealityDefenderEvents;
