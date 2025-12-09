/**
 * Φ-Adaptive Memory Engine (Q7.5-A)
 * 
 * Core memory layer introducing temporal continuity, emergent evolution,
 * and pattern persistence for predictive behavior and coherent state evolution.
 * 
 * No ML dependencies — purely deterministic φ-system memory.
 * 
 * Architecture:
 * - L0 (Frame Memory): Short-term ring buffer of last 60 emergent states
 * - L1 (Pattern Memory): Mid-term storage of last 200 pattern classifications with transition matrix
 * - L2 (Context Memory): Event memory tracking last 20 systemic events
 * 
 * @tag q7.5-adaptive-memory
 */

import type { EmergentClassification, EmergentState } from './emergent-engine.js';
import type { PatternClassification, PatternState } from './pattern-classifier.js';
import type { PresetId } from './preset-hotswitch.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Adaptive Memory Version
 */
export const Q7_MEMORY_VERSION = '7.5.0';

/**
 * Memory event types tracked in L2
 */
export type MemoryEventType = 
  | 'preset-switch'
  | 'signature-spike'
  | 'chaotic-transition'
  | 'emergent-threshold-shift'
  | 'pattern-change';

/**
 * L0 Frame Memory Record (Short-Term)
 */
interface FrameMemoryRecord {
  emergentState: EmergentState;
  amplitude: number;
  variance: number;
  gradient: number;
  timestamp: number;
}

/**
 * L1 Pattern Memory Record (Mid-Term)
 */
interface PatternMemoryRecord {
  state: PatternState;
  confidence: number;
  timestamp: number;
  frameIndex: number;
}

/**
 * L2 Context Event Record (Event Memory)
 */
interface ContextEventRecord {
  type: MemoryEventType;
  timestamp: number;
  data: any;
}

/**
 * Transition matrix entry
 */
interface TransitionEntry {
  fromState: PatternState;
  toState: PatternState;
  count: number;
}

/**
 * Memory state snapshot
 */
export interface MemoryState {
  l0: {
    frameCount: number;
    recentEmergentState: EmergentState | null;
    avgAmplitude: number;
    avgVariance: number;
    avgGradient: number;
  };
  l1: {
    patternCount: number;
    stateFrequencies: Record<PatternState, number>;
    predictiveGradientIndex: number;
    stabilityWindow: number;
  };
  l2: {
    eventCount: number;
    recentEvents: MemoryEventType[];
  };
  metrics: {
    memoryDriftIndex: number;
    predictedEmergentState: EmergentState | null;
  };
}

/**
 * Memory listener callback
 */
export type MemoryListener = (state: MemoryState) => void;

/**
 * Adaptive Memory configuration
 */
interface AdaptiveMemoryConfig {
  l0Capacity: number; // Frame memory capacity
  l1Capacity: number; // Pattern memory capacity
  l2Capacity: number; // Event memory capacity
}

const DEFAULT_CONFIG: AdaptiveMemoryConfig = {
  l0Capacity: 60,
  l1Capacity: 200,
  l2Capacity: 20,
};

/**
 * PhiAdaptiveMemory class implementing three-layer memory stack
 */
export class PhiAdaptiveMemory {
  private readonly config: AdaptiveMemoryConfig;
  
  // L0 - Frame Memory (Short-Term) - Zero-GC ring buffer
  private readonly l0Buffer: Float32Array; // [state, amplitude, variance, gradient, timestamp] * capacity
  private l0Index: number = 0;
  private l0Count: number = 0;
  private readonly l0Stride: number = 5; // 5 values per record
  private readonly l0StateMap: Map<EmergentState, number> = new Map([
    ['coherent', 0],
    ['drifting', 1],
    ['cycling', 2],
    ['turbulent', 3],
    ['threshold-shift', 4],
  ]);
  private readonly l0StateReverseMap: EmergentState[] = [
    'coherent',
    'drifting',
    'cycling',
    'turbulent',
    'threshold-shift',
  ];
  
  // L1 - Pattern Memory (Mid-Term) - Zero-GC ring buffer
  private readonly l1Buffer: Float32Array; // [state, confidence, timestamp, frameIndex] * capacity
  private l1Index: number = 0;
  private l1Count: number = 0;
  private readonly l1Stride: number = 4; // 4 values per record
  private readonly l1StateMap: Map<PatternState, number> = new Map([
    ['stable', 0],
    ['ascending', 1],
    ['descending', 2],
    ['volatile', 3],
    ['chaotic', 4],
  ]);
  private readonly l1StateReverseMap: PatternState[] = [
    'stable',
    'ascending',
    'descending',
    'volatile',
    'chaotic',
  ];
  
  // L1 Transition matrix (Markov-like) - 5x5 for 5 pattern states
  private readonly transitionMatrix: Float32Array; // 25 entries (5x5)
  private transitionTotal: number = 0;
  
  // L2 - Context Memory (Event Memory)
  private readonly l2Events: ContextEventRecord[];
  private l2Index: number = 0;
  
  // Listeners
  private listeners: MemoryListener[] = [];
  
  // Frame counter
  private frameCounter: number = 0;
  
  constructor(config: Partial<AdaptiveMemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Allocate L0 buffer
    this.l0Buffer = new Float32Array(this.config.l0Capacity * this.l0Stride);
    
    // Allocate L1 buffer
    this.l1Buffer = new Float32Array(this.config.l1Capacity * this.l1Stride);
    
    // Allocate transition matrix (5x5)
    this.transitionMatrix = new Float32Array(25);
    
    // Allocate L2 events
    this.l2Events = new Array(this.config.l2Capacity);
  }
  
  /**
   * Feed emergent state into L0 (Frame Memory)
   */
  feedEmergent(emergent: EmergentClassification, amplitude: number, variance: number, gradient: number): void {
    const stateNum = this.l0StateMap.get(emergent.state) ?? 0;
    const offset = this.l0Index * this.l0Stride;
    
    this.l0Buffer[offset] = stateNum;
    this.l0Buffer[offset + 1] = amplitude;
    this.l0Buffer[offset + 2] = variance;
    this.l0Buffer[offset + 3] = gradient;
    this.l0Buffer[offset + 4] = emergent.timestamp;
    
    this.l0Index = (this.l0Index + 1) % this.config.l0Capacity;
    if (this.l0Count < this.config.l0Capacity) {
      this.l0Count++;
    }
  }
  
  /**
   * Feed pattern into L1 (Pattern Memory)
   */
  feedPattern(pattern: PatternClassification): void {
    const stateNum = this.l1StateMap.get(pattern.state) ?? 0;
    const offset = this.l1Index * this.l1Stride;
    
    // Store pattern
    this.l1Buffer[offset] = stateNum;
    this.l1Buffer[offset + 1] = pattern.confidence;
    this.l1Buffer[offset + 2] = pattern.timestamp;
    this.l1Buffer[offset + 3] = this.frameCounter;
    
    // Update transition matrix if we have a previous state
    if (this.l1Count > 0) {
      const prevOffset = ((this.l1Index - 1 + this.config.l1Capacity) % this.config.l1Capacity) * this.l1Stride;
      const prevStateNum = this.l1Buffer[prevOffset];
      
      // Update transition count: prevState -> currentState
      const transitionIdx = Math.floor(prevStateNum) * 5 + stateNum;
      this.transitionMatrix[transitionIdx]++;
      this.transitionTotal++;
    }
    
    this.l1Index = (this.l1Index + 1) % this.config.l1Capacity;
    if (this.l1Count < this.config.l1Capacity) {
      this.l1Count++;
    }
    
    this.frameCounter++;
  }
  
  /**
   * Feed event into L2 (Context Memory)
   */
  feedEvent(type: MemoryEventType, data: any = null): void {
    const event: ContextEventRecord = {
      type,
      timestamp: performance.now(),
      data,
    };
    
    this.l2Events[this.l2Index] = event;
    this.l2Index = (this.l2Index + 1) % this.config.l2Capacity;
  }
  
  /**
   * Get current memory state snapshot
   */
  getMemoryState(): MemoryState {
    const l0 = this.computeL0Metrics();
    const l1 = this.computeL1Metrics();
    const l2 = this.computeL2Metrics();
    
    // Compute Memory Drift Index (MDI)
    const mdi = this.computeMemoryDriftIndex();
    
    // Predict emergent state
    const predictedEmergent = this.predictEmergentState();
    
    return {
      l0,
      l1,
      l2,
      metrics: {
        memoryDriftIndex: mdi,
        predictedEmergentState: predictedEmergent,
      },
    };
  }
  
  /**
   * Compute L0 (Frame Memory) metrics
   */
  private computeL0Metrics() {
    if (this.l0Count === 0) {
      return {
        frameCount: 0,
        recentEmergentState: null,
        avgAmplitude: 0,
        avgVariance: 0,
        avgGradient: 0,
      };
    }
    
    // Get most recent emergent state
    const recentIdx = (this.l0Index - 1 + this.config.l0Capacity) % this.config.l0Capacity;
    const recentOffset = recentIdx * this.l0Stride;
    const recentStateNum = Math.floor(this.l0Buffer[recentOffset]);
    const recentEmergentState = this.l0StateReverseMap[recentStateNum] || null;
    
    // Compute averages
    let sumAmplitude = 0;
    let sumVariance = 0;
    let sumGradient = 0;
    
    for (let i = 0; i < this.l0Count; i++) {
      const offset = i * this.l0Stride;
      sumAmplitude += this.l0Buffer[offset + 1];
      sumVariance += this.l0Buffer[offset + 2];
      sumGradient += this.l0Buffer[offset + 3];
    }
    
    return {
      frameCount: this.l0Count,
      recentEmergentState,
      avgAmplitude: sumAmplitude / this.l0Count,
      avgVariance: sumVariance / this.l0Count,
      avgGradient: sumGradient / this.l0Count,
    };
  }
  
  /**
   * Compute L1 (Pattern Memory) metrics
   */
  private computeL1Metrics() {
    if (this.l1Count === 0) {
      return {
        patternCount: 0,
        stateFrequencies: {
          stable: 0,
          ascending: 0,
          descending: 0,
          volatile: 0,
          chaotic: 0,
        },
        predictiveGradientIndex: 0,
        stabilityWindow: 0,
      };
    }
    
    // Compute state frequencies
    const frequencies: Record<PatternState, number> = {
      stable: 0,
      ascending: 0,
      descending: 0,
      volatile: 0,
      chaotic: 0,
    };
    
    for (let i = 0; i < this.l1Count; i++) {
      const offset = i * this.l1Stride;
      const stateNum = Math.floor(this.l1Buffer[offset]);
      const state = this.l1StateReverseMap[stateNum];
      if (state) {
        frequencies[state]++;
      }
    }
    
    // Normalize frequencies
    for (const key in frequencies) {
      frequencies[key as PatternState] /= this.l1Count;
    }
    
    // Compute Predictive Gradient Index (PGI)
    // Based on transition matrix and frequency trends
    const pgi = this.computePredictiveGradientIndex(frequencies);
    
    // Compute Stability Window
    const stabilityWindow = this.computeStabilityWindow();
    
    return {
      patternCount: this.l1Count,
      stateFrequencies: frequencies,
      predictiveGradientIndex: pgi,
      stabilityWindow,
    };
  }
  
  /**
   * Compute L2 (Context Memory) metrics
   */
  private computeL2Metrics() {
    const recentEvents: MemoryEventType[] = [];
    let eventCount = 0;
    
    for (let i = 0; i < this.config.l2Capacity; i++) {
      const event = this.l2Events[i];
      if (event && event.type) {
        recentEvents.push(event.type);
        eventCount++;
      }
    }
    
    return {
      eventCount,
      recentEvents,
    };
  }
  
  /**
   * Compute Memory Drift Index (MDI)
   * Measures longitudinal drift of emergent states
   */
  private computeMemoryDriftIndex(): number {
    if (this.l0Count < 2) return 0;
    
    let drift = 0;
    let prevStateNum = this.l0Buffer[0];
    
    for (let i = 1; i < this.l0Count; i++) {
      const offset = i * this.l0Stride;
      const stateNum = this.l0Buffer[offset];
      drift += Math.abs(stateNum - prevStateNum);
      prevStateNum = stateNum;
    }
    
    // Normalize by count
    return drift / (this.l0Count - 1);
  }
  
  /**
   * Compute Predictive Gradient Index (PGI)
   * Derived from L1 frequency matrix and variance trend
   */
  private computePredictiveGradientIndex(frequencies: Record<PatternState, number>): number {
    // PGI = (ascending - descending) * (1 - volatile) * (1 - chaotic)
    const directional = frequencies.ascending - frequencies.descending;
    const stability = (1 - frequencies.volatile) * (1 - frequencies.chaotic);
    
    return directional * stability;
  }
  
  /**
   * Compute Stability Window
   * Measures local stability vs long-term drift
   */
  private computeStabilityWindow(): number {
    if (this.l1Count < 10) return 0;
    
    // Compare recent 10 patterns vs older patterns
    const recentCount = Math.min(10, this.l1Count);
    const recentStartIdx = Math.max(0, this.l1Count - recentCount);
    
    // Count state changes in recent window
    let recentChanges = 0;
    for (let i = recentStartIdx + 1; i < this.l1Count; i++) {
      const prevOffset = ((i - 1) % this.config.l1Capacity) * this.l1Stride;
      const currOffset = (i % this.config.l1Capacity) * this.l1Stride;
      
      if (Math.floor(this.l1Buffer[prevOffset]) !== Math.floor(this.l1Buffer[currOffset])) {
        recentChanges++;
      }
    }
    
    // Stability = 1 - (changes / window)
    return 1 - (recentChanges / recentCount);
  }
  
  /**
   * Predict emergent state using Markov transitions, drift, variance, and φ-consistency
   */
  predictEmergentState(): EmergentState | null {
    if (this.l1Count < 5 || this.transitionTotal === 0) return null;
    
    // Get current pattern state
    const currentIdx = (this.l1Index - 1 + this.config.l1Capacity) % this.config.l1Capacity;
    const currentOffset = currentIdx * this.l1Stride;
    const currentStateNum = Math.floor(this.l1Buffer[currentOffset]);
    
    // Find most likely next pattern state from transition matrix
    let maxProb = 0;
    let nextStateNum = currentStateNum;
    
    for (let toState = 0; toState < 5; toState++) {
      const transitionIdx = currentStateNum * 5 + toState;
      const count = this.transitionMatrix[transitionIdx];
      const prob = count / this.transitionTotal;
      
      if (prob > maxProb) {
        maxProb = prob;
        nextStateNum = toState;
      }
    }
    
    // Map pattern state to emergent state heuristically
    const nextPatternState = this.l1StateReverseMap[nextStateNum];
    
    // Heuristic mapping: pattern -> emergent
    // This is simplified; real implementation would use more context
    switch (nextPatternState) {
      case 'stable':
        return 'coherent';
      case 'ascending':
      case 'descending':
        return 'drifting';
      case 'volatile':
        return 'turbulent';
      case 'chaotic':
        return 'threshold-shift';
      default:
        return null;
    }
  }
  
  /**
   * Get predicted emergent state
   */
  getPredictedEmergentState(): EmergentState | null {
    return this.predictEmergentState();
  }
  
  /**
   * Subscribe to memory updates
   */
  subscribe(listener: MemoryListener): void {
    this.listeners.push(listener);
  }
  
  /**
   * Unsubscribe from memory updates
   */
  unsubscribe(listener: MemoryListener): void {
    const idx = this.listeners.indexOf(listener);
    if (idx >= 0) {
      this.listeners.splice(idx, 1);
    }
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(state: MemoryState): void {
    for (const listener of this.listeners) {
      listener(state);
    }
  }
  
  /**
   * Update - called each frame to emit memory:update
   */
  update(): void {
    const state = this.getMemoryState();
    this.notifyListeners(state);
  }
  
  /**
   * Reset all memory layers
   */
  reset(): void {
    this.l0Index = 0;
    this.l0Count = 0;
    this.l0Buffer.fill(0);
    
    this.l1Index = 0;
    this.l1Count = 0;
    this.l1Buffer.fill(0);
    
    this.transitionMatrix.fill(0);
    this.transitionTotal = 0;
    
    this.l2Index = 0;
    this.l2Events.splice(0);
    for (let i = 0; i < this.config.l2Capacity; i++) {
      this.l2Events.push(undefined as any);
    }
    
    this.frameCounter = 0;
  }
}

/**
 * Create adaptive memory engine with default configuration
 */
export function createAdaptiveMemory(config?: Partial<AdaptiveMemoryConfig>): PhiAdaptiveMemory {
  return new PhiAdaptiveMemory(config);
}
