/**
 * PhaseController - Phase control for wave layers
 * 
 * Manages global and per-layer phase offsets with
 * φ-grid synchronization support.
 */

import type { PhaseState, ControllerRange } from './types.js';
import { PHI, PHI_ANGLE } from './types.js';

/**
 * Default phase ranges
 */
const DEFAULT_RANGES: Record<string, ControllerRange> = {
  globalOffset: { min: 0, max: 2 * Math.PI, default: 0, step: 0.01 },
  layerOffset: { min: 0, max: 2 * Math.PI, default: 0, step: 0.01 },
};

/**
 * PhaseController class
 */
export class PhaseController {
  private state: PhaseState;
  private readonly ranges: Record<string, ControllerRange>;
  
  // Smooth transition state
  private targetOffset: number = 0;
  private lastUpdateTime: number = 0;
  
  constructor() {
    this.state = {
      globalOffset: DEFAULT_RANGES.globalOffset.default,
      layers: new Map(),
      locked: false,
      phiSync: true,
    };
    
    this.ranges = { ...DEFAULT_RANGES };
    this.targetOffset = this.state.globalOffset;
  }
  
  /**
   * Set global phase offset
   */
  setGlobalOffset(value: number): void {
    const normalized = value % (2 * Math.PI);
    this.targetOffset = normalized;
    
    if (this.state.phiSync) {
      // Snap to φ-grid
      const gridStep = PHI_ANGLE;
      this.targetOffset = Math.round(normalized / gridStep) * gridStep;
    }
  }
  
  /**
   * Set global offset immediately (no smoothing)
   */
  setGlobalOffsetImmediate(value: number): void {
    const normalized = value % (2 * Math.PI);
    this.state.globalOffset = normalized;
    this.targetOffset = normalized;
  }
  
  /**
   * Get current global offset
   */
  getGlobalOffset(): number {
    return this.state.globalOffset;
  }
  
  /**
   * Set layer phase offset
   */
  setLayerOffset(layerId: string, value: number): void {
    const normalized = value % (2 * Math.PI);
    this.state.layers.set(layerId, normalized);
  }
  
  /**
   * Get layer phase offset
   */
  getLayerOffset(layerId: string): number {
    return this.state.layers.get(layerId) ?? 0;
  }
  
  /**
   * Get effective phase for a layer (global + layer)
   */
  getEffective(layerId: string): number {
    return (this.state.globalOffset + this.getLayerOffset(layerId)) % (2 * Math.PI);
  }
  
  /**
   * Set phase lock
   */
  setLocked(locked: boolean): void {
    this.state.locked = locked;
  }
  
  /**
   * Check if locked
   */
  isLocked(): boolean {
    return this.state.locked;
  }
  
  /**
   * Set φ-sync mode
   */
  setPhiSync(enabled: boolean): void {
    this.state.phiSync = enabled;
  }
  
  /**
   * Check if φ-sync is enabled
   */
  isPhiSync(): boolean {
    return this.state.phiSync;
  }
  
  /**
   * Update phase (call every frame)
   */
  update(timestamp: number): void {
    if (this.state.locked) return;
    
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = timestamp;
      return;
    }
    
    const dt = (timestamp - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = timestamp;
    
    // Smooth transition to target offset
    const diff = this.targetOffset - this.state.globalOffset;
    
    // Handle wraparound
    let shortestDiff = diff;
    if (Math.abs(diff) > Math.PI) {
      shortestDiff = diff > 0 ? diff - 2 * Math.PI : diff + 2 * Math.PI;
    }
    
    // φ-smooth interpolation
    const alpha = 1 - Math.exp(-dt * 10 * PHI);
    this.state.globalOffset = (this.state.globalOffset + shortestDiff * alpha) % (2 * Math.PI);
    
    if (this.state.globalOffset < 0) {
      this.state.globalOffset += 2 * Math.PI;
    }
  }
  
  /**
   * Reset phase (global or specific layer)
   */
  resetPhase(layerId?: string): void {
    if (layerId) {
      this.state.layers.set(layerId, 0);
    } else {
      this.state.globalOffset = 0;
      this.targetOffset = 0;
      this.state.layers.clear();
    }
  }
  
  /**
   * Advance phase by golden angle
   */
  advanceByPhi(): void {
    this.targetOffset = (this.state.globalOffset + PHI_ANGLE) % (2 * Math.PI);
  }
  
  /**
   * Align all layers to φ-grid
   */
  alignToPhiGrid(): void {
    const gridStep = PHI_ANGLE;
    
    // Align global
    this.state.globalOffset = Math.round(this.state.globalOffset / gridStep) * gridStep;
    this.targetOffset = this.state.globalOffset;
    
    // Align layers
    for (const [layerId, offset] of this.state.layers) {
      this.state.layers.set(layerId, Math.round(offset / gridStep) * gridStep);
    }
  }
  
  /**
   * Get state (readonly)
   */
  getState(): Readonly<PhaseState> {
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
    this.state.globalOffset = DEFAULT_RANGES.globalOffset.default;
    this.state.layers.clear();
    this.state.locked = false;
    this.state.phiSync = true;
    this.targetOffset = 0;
    this.lastUpdateTime = 0;
  }
}

/**
 * Create a PhaseController instance
 */
export function createPhaseController(): PhaseController {
  return new PhaseController();
}
