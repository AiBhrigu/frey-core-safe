/**
 * AmplitudeController - Amplitude control for wave layers
 * 
 * Manages global and per-layer amplitude with envelope
 * support for smooth transitions.
 */

import type { AmplitudeState, ControllerRange } from './types.js';
import { PHI } from './types.js';

/**
 * Default amplitude ranges
 */
const DEFAULT_RANGES: Record<string, ControllerRange> = {
  global: { min: 0, max: 1, default: 0.8, step: 0.01 },
  layer: { min: 0, max: 2, default: 1, step: 0.01 },
  attack: { min: 1, max: 1000, default: 50, step: 1 },
  release: { min: 1, max: 2000, default: 200, step: 1 },
};

/**
 * AmplitudeController class
 */
export class AmplitudeController {
  private state: AmplitudeState;
  private readonly ranges: Record<string, ControllerRange>;
  
  // Envelope computation state
  private targetAmplitude: number;
  private envelopeVelocity: number = 0;
  private lastUpdateTime: number = 0;
  
  constructor() {
    this.state = {
      global: DEFAULT_RANGES.global.default,
      layers: new Map(),
      attackMs: DEFAULT_RANGES.attack.default,
      releaseMs: DEFAULT_RANGES.release.default,
      envelope: 1,
    };
    
    this.ranges = { ...DEFAULT_RANGES };
    this.targetAmplitude = this.state.global;
  }
  
  /**
   * Set global amplitude (triggers envelope)
   */
  setGlobal(value: number): void {
    const clamped = Math.max(this.ranges.global.min, Math.min(this.ranges.global.max, value));
    this.targetAmplitude = clamped;
  }
  
  /**
   * Set global amplitude immediately (no envelope)
   */
  setGlobalImmediate(value: number): void {
    const clamped = Math.max(this.ranges.global.min, Math.min(this.ranges.global.max, value));
    this.state.global = clamped;
    this.targetAmplitude = clamped;
    this.envelopeVelocity = 0;
  }
  
  /**
   * Get current global amplitude
   */
  getGlobal(): number {
    return this.state.global;
  }
  
  /**
   * Set layer amplitude
   */
  setLayer(layerId: string, value: number): void {
    const clamped = Math.max(this.ranges.layer.min, Math.min(this.ranges.layer.max, value));
    this.state.layers.set(layerId, clamped);
  }
  
  /**
   * Get layer amplitude
   */
  getLayer(layerId: string): number {
    return this.state.layers.get(layerId) ?? this.ranges.layer.default;
  }
  
  /**
   * Get effective amplitude for a layer (global × layer)
   */
  getEffective(layerId: string): number {
    return this.state.global * this.getLayer(layerId) * this.state.envelope;
  }
  
  /**
   * Set attack time
   */
  setAttack(ms: number): void {
    this.state.attackMs = Math.max(this.ranges.attack.min, Math.min(this.ranges.attack.max, ms));
  }
  
  /**
   * Set release time
   */
  setRelease(ms: number): void {
    this.state.releaseMs = Math.max(this.ranges.release.min, Math.min(this.ranges.release.max, ms));
  }
  
  /**
   * Update envelope (call every frame)
   */
  update(timestamp: number): void {
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = timestamp;
      return;
    }
    
    const dt = (timestamp - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = timestamp;
    
    // Smooth envelope transition using φ-based interpolation
    const diff = this.targetAmplitude - this.state.global;
    const timeConstant = diff > 0 ? this.state.attackMs : this.state.releaseMs;
    const rate = 1000 / timeConstant;
    
    // φ-smooth exponential approach
    const alpha = 1 - Math.exp(-dt * rate * PHI);
    this.state.global += diff * alpha;
    
    // Update envelope position
    this.state.envelope = Math.abs(diff) < 0.001 ? 1 : 1 - Math.abs(diff);
  }
  
  /**
   * Trigger envelope (for musical events)
   */
  trigger(amplitude: number = 1): void {
    this.state.global = 0;
    this.targetAmplitude = amplitude;
    this.state.envelope = 0;
  }
  
  /**
   * Release envelope
   */
  release(): void {
    this.targetAmplitude = 0;
  }
  
  /**
   * Get state (readonly)
   */
  getState(): Readonly<AmplitudeState> {
    return this.state;
  }
  
  /**
   * Get range for a parameter
   */
  getRange(param: string): ControllerRange | undefined {
    return this.ranges[param];
  }
  
  /**
   * Reset to defaults
   */
  reset(): void {
    this.state.global = DEFAULT_RANGES.global.default;
    this.state.layers.clear();
    this.state.attackMs = DEFAULT_RANGES.attack.default;
    this.state.releaseMs = DEFAULT_RANGES.release.default;
    this.state.envelope = 1;
    this.targetAmplitude = this.state.global;
    this.envelopeVelocity = 0;
    this.lastUpdateTime = 0;
  }
}

/**
 * Create an AmplitudeController instance
 */
export function createAmplitudeController(): AmplitudeController {
  return new AmplitudeController();
}
