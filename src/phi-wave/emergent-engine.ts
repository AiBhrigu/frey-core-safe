/**
 * Φ Emergent Behavior Engine (Q7.4-E)
 * 
 * First emergence layer built on top of Q7.0-Q7.3.
 * Detects macro-level wavefield behaviors from pattern evolution over time.
 * 
 * Philosophy:
 * Emergent states arise from the interaction of patterns across multiple frames,
 * not from a single frame. While patterns (Q7.3-P) classify micro-states,
 * emergent states capture the macro-behavior of the system as a whole.
 * 
 * @tag q7.4-emergent
 */

import type { PatternClassification, PatternState } from './pattern-classifier.js';
import type { WaveSignature } from './signature-engine.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Emergent Engine Version
 */
export const Q7_EMERGENT_VERSION = '7.4.0';

/**
 * Emergent state classification
 */
export type EmergentState = 
  | 'coherent'        // Patterns reinforcing (consistent directional flow)
  | 'drifting'        // Slow directional shift (long-term trend)
  | 'cycling'         // Periodic alternation (ascending ↔ descending)
  | 'turbulent'       // Volatile dominance with chaotic spikes
  | 'threshold-shift'; // Long-term trend flip detected

/**
 * Emergent behavior classification result
 */
export interface EmergentClassification {
  /** Current emergent state */
  state: EmergentState;
  /** Confidence level (0-1) */
  confidence: number;
  /** Timestamp of classification */
  timestamp: number;
  /** Contributing metrics */
  metrics: {
    /** φ-consistency index */
    phiConsistency: number;
    /** Pattern frequency map */
    patternFrequencies: Record<PatternState, number>;
    /** Reversal cycle count in window */
    reversalCycles: number;
    /** Amplitude drift (cumulative) */
    amplitudeDrift: number;
    /** Average variance regime */
    varianceRegime: number;
  };
}

/**
 * Emergent listener callback
 */
export type EmergentListener = (emergent: EmergentClassification) => void;

/**
 * Thresholds for emergent state detection (φ-tuned)
 */
const EMERGENT_THRESHOLDS = {
  // Coherence thresholds
  coherenceHigh: 0.618,      // φ-based coherence threshold
  coherenceLow: 0.382,       // 1 - φ_inv
  
  // Drift thresholds
  driftSlow: 0.05,
  driftFast: 0.15,
  
  // Cycling detection
  cycleMinReversals: 4,      // At least 2 full cycles
  cycleMaxVariance: 0.1,
  
  // Turbulence thresholds
  turbulenceVolatileRatio: 0.5,  // >50% volatile states
  turbulenceChaoticRatio: 0.2,   // >20% chaotic states
  
  // Threshold shift detection
  trendFlipMinFrames: 20,    // Minimum frames to detect trend flip
  trendDeltaThreshold: 0.3,
};

/**
 * PhiEmergentEngine class
 * 
 * Zero-GC implementation using ring buffers and pre-allocated structures.
 */
export class PhiEmergentEngine {
  // Ring buffer for pattern history (40 frames)
  private readonly patternBuffer: PatternClassification[];
  private readonly bufferSize: number = 40;
  private bufferIndex: number = 0;
  private bufferFilled: boolean = false;
  
  // Current state
  private currentEmergent: EmergentClassification | null = null;
  
  // Event listeners
  private readonly listeners: EmergentListener[] = [];
  
  // Pre-allocated metrics cache (zero-GC)
  private readonly metricsCache = {
    phiConsistency: 0,
    patternFrequencies: {
      stable: 0,
      ascending: 0,
      descending: 0,
      volatile: 0,
      chaotic: 0,
    } as Record<PatternState, number>,
    reversalCycles: 0,
    amplitudeDrift: 0,
    varianceRegime: 0,
  };
  
  // Trend tracking for threshold-shift detection (circular buffer)
  private readonly trendHistory: Float32Array;
  private readonly trendHistorySize: number = 40;
  private trendIndex: number = 0;
  private trendFilled: boolean = false;
  
  constructor() {
    // Pre-allocate ring buffers
    this.patternBuffer = new Array(this.bufferSize);
    this.trendHistory = new Float32Array(this.trendHistorySize);
  }
  
  /**
   * Process a pattern classification into emergent state
   */
  process(pattern: PatternClassification): EmergentClassification {
    // Store pattern in history
    this.recordPattern(pattern);
    
    // Compute emergent metrics
    this.computeMetrics();
    
    // Determine emergent state
    const state = this.determineEmergentState();
    
    // Create classification
    const classification: EmergentClassification = {
      state,
      confidence: this.computeConfidence(state),
      timestamp: pattern.timestamp,
      metrics: {
        phiConsistency: this.metricsCache.phiConsistency,
        patternFrequencies: { ...this.metricsCache.patternFrequencies },
        reversalCycles: this.metricsCache.reversalCycles,
        amplitudeDrift: this.metricsCache.amplitudeDrift,
        varianceRegime: this.metricsCache.varianceRegime,
      },
    };
    
    // Store current emergent state
    this.currentEmergent = classification;
    
    // Notify listeners
    this.notifyListeners(classification);
    
    return classification;
  }
  
  /**
   * Record pattern in ring buffer
   */
  private recordPattern(pattern: PatternClassification): void {
    this.patternBuffer[this.bufferIndex] = pattern;
    this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
    
    if (this.bufferIndex === 0) {
      this.bufferFilled = true;
    }
  }
  
  /**
   * Compute emergent metrics from pattern history
   */
  private computeMetrics(): void {
    const count = this.getPatternCount();
    if (count === 0) {
      return;
    }
    
    // Reset frequency map
    this.metricsCache.patternFrequencies.stable = 0;
    this.metricsCache.patternFrequencies.ascending = 0;
    this.metricsCache.patternFrequencies.descending = 0;
    this.metricsCache.patternFrequencies.volatile = 0;
    this.metricsCache.patternFrequencies.chaotic = 0;
    
    // Compute pattern frequencies and metrics
    let totalAmplitudeDelta = 0;
    let totalVariance = 0;
    let reversalCount = 0;
    let lastDirection: number | null = null;
    
    for (let i = 0; i < count; i++) {
      const idx = this.bufferFilled 
        ? (this.bufferIndex + i) % this.bufferSize
        : i;
      const pattern = this.patternBuffer[idx];
      
      if (!pattern) continue;
      
      // Count pattern frequency
      this.metricsCache.patternFrequencies[pattern.state]++;
      
      // Accumulate amplitude delta
      totalAmplitudeDelta += pattern.metrics.amplitudeDelta;
      
      // Accumulate variance
      totalVariance += pattern.metrics.varianceBurst;
      
      // Track direction changes for reversal detection
      const currentDirection = Math.sign(pattern.metrics.gradientSign);
      if (lastDirection !== null && currentDirection !== 0 && lastDirection !== currentDirection) {
        reversalCount++;
      }
      if (currentDirection !== 0) {
        lastDirection = currentDirection;
      }
    }
    
    // Normalize frequencies (manually for zero-GC)
    this.metricsCache.patternFrequencies.stable /= count;
    this.metricsCache.patternFrequencies.ascending /= count;
    this.metricsCache.patternFrequencies.descending /= count;
    this.metricsCache.patternFrequencies.volatile /= count;
    this.metricsCache.patternFrequencies.chaotic /= count;
    
    // φ-consistency index:
    // coherence = (ascending + descending) - volatile
    // Measures directional flow vs. chaotic behavior
    const { ascending, descending, volatile: volatileFreq } = this.metricsCache.patternFrequencies;
    this.metricsCache.phiConsistency = (ascending + descending) - volatileFreq;
    
    // Reversal cycles (half of reversals = full cycles)
    this.metricsCache.reversalCycles = reversalCount / 2;
    
    // Amplitude drift (average)
    this.metricsCache.amplitudeDrift = totalAmplitudeDelta / count;
    
    // Variance regime (average)
    this.metricsCache.varianceRegime = totalVariance / count;
    
    // Update trend history for threshold-shift detection
    this.updateTrendHistory(this.metricsCache.amplitudeDrift);
  }
  
  /**
   * Update trend history for long-term pattern analysis (zero-GC circular buffer)
   */
  private updateTrendHistory(drift: number): void {
    this.trendHistory[this.trendIndex] = drift;
    this.trendIndex = (this.trendIndex + 1) % this.trendHistorySize;
    
    if (this.trendIndex === 0) {
      this.trendFilled = true;
    }
  }
  
  /**
   * Determine emergent state based on metrics
   */
  private determineEmergentState(): EmergentState {
    const count = this.getPatternCount();
    
    // Need sufficient data for emergent behavior
    if (count < 10) {
      return 'drifting'; // Default state with insufficient data
    }
    
    const {
      phiConsistency,
      patternFrequencies,
      reversalCycles,
      amplitudeDrift,
      varianceRegime,
    } = this.metricsCache;
    
    // 1. Check for turbulent state (volatile/chaotic dominance)
    if (patternFrequencies.volatile > EMERGENT_THRESHOLDS.turbulenceVolatileRatio ||
        patternFrequencies.chaotic > EMERGENT_THRESHOLDS.turbulenceChaoticRatio) {
      return 'turbulent';
    }
    
    // 2. Check for cycling behavior (periodic alternation)
    if (reversalCycles >= EMERGENT_THRESHOLDS.cycleMinReversals &&
        Math.abs(amplitudeDrift) < EMERGENT_THRESHOLDS.cycleMaxVariance) {
      return 'cycling';
    }
    
    // 3. Check for coherent state (patterns reinforcing)
    if (phiConsistency > EMERGENT_THRESHOLDS.coherenceHigh) {
      return 'coherent';
    }
    
    // 4. Check for threshold-shift (long-term trend flip)
    if (this.detectThresholdShift()) {
      return 'threshold-shift';
    }
    
    // 5. Default to drifting (slow directional shift)
    return 'drifting';
  }
  
  /**
   * Detect threshold shift (long-term trend flip) - zero-GC implementation
   */
  private detectThresholdShift(): boolean {
    // Need sufficient trend history
    const count = this.trendFilled ? this.trendHistorySize : this.trendIndex;
    if (count < EMERGENT_THRESHOLDS.trendFlipMinFrames) {
      return false;
    }
    
    // Calculate average trend in two halves (zero-GC, no array allocations)
    const mid = Math.floor(count / 2);
    let firstSum = 0;
    let secondSum = 0;
    
    for (let i = 0; i < mid; i++) {
      const idx = this.trendFilled 
        ? (this.trendIndex + i) % this.trendHistorySize
        : i;
      firstSum += this.trendHistory[idx];
    }
    
    for (let i = mid; i < count; i++) {
      const idx = this.trendFilled 
        ? (this.trendIndex + i) % this.trendHistorySize
        : i;
      secondSum += this.trendHistory[idx];
    }
    
    const firstAvg = firstSum / mid;
    const secondAvg = secondSum / (count - mid);
    
    // Check for significant trend flip
    const trendDelta = Math.abs(secondAvg - firstAvg);
    const signFlip = Math.sign(firstAvg) !== Math.sign(secondAvg);
    
    return signFlip && trendDelta > EMERGENT_THRESHOLDS.trendDeltaThreshold;
  }
  
  /**
   * Compute confidence for emergent state
   */
  private computeConfidence(state: EmergentState): number {
    const {
      phiConsistency,
      patternFrequencies,
      reversalCycles,
    } = this.metricsCache;
    
    switch (state) {
      case 'coherent':
        // Higher consistency = higher confidence
        return Math.min(1.0, phiConsistency / EMERGENT_THRESHOLDS.coherenceHigh);
      
      case 'cycling':
        // More reversals = higher confidence
        return Math.min(1.0, reversalCycles / (EMERGENT_THRESHOLDS.cycleMinReversals * 2));
      
      case 'turbulent':
        // Higher volatile/chaotic ratio = higher confidence
        return Math.min(1.0, 
          (patternFrequencies.volatile + patternFrequencies.chaotic * 2) / 
          EMERGENT_THRESHOLDS.turbulenceVolatileRatio
        );
      
      case 'threshold-shift':
        // Binary confidence for trend flips
        return 0.8;
      
      case 'drifting':
      default:
        // Moderate confidence for default state
        return 0.5;
    }
  }
  
  /**
   * Get number of patterns in buffer
   */
  private getPatternCount(): number {
    return this.bufferFilled ? this.bufferSize : this.bufferIndex;
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(emergent: EmergentClassification): void {
    for (const listener of this.listeners) {
      listener(emergent);
    }
  }
  
  /**
   * Subscribe to emergent state updates
   */
  subscribe(listener: EmergentListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Get current emergent state
   */
  getCurrentEmergent(): EmergentClassification | null {
    return this.currentEmergent;
  }
  
  /**
   * Get pattern history
   */
  getPatternHistory(): PatternClassification[] {
    const count = this.getPatternCount();
    const history: PatternClassification[] = [];
    
    for (let i = 0; i < count; i++) {
      const idx = this.bufferFilled 
        ? (this.bufferIndex + i) % this.bufferSize
        : i;
      const pattern = this.patternBuffer[idx];
      if (pattern) {
        history.push(pattern);
      }
    }
    
    return history;
  }
  
  /**
   * Reset the engine state
   */
  reset(): void {
    this.bufferIndex = 0;
    this.bufferFilled = false;
    this.currentEmergent = null;
    this.trendHistory.fill(0);
    this.trendIndex = 0;
    this.trendFilled = false;
  }
}

/**
 * Factory function to create an emergent engine
 */
export function createEmergentEngine(): PhiEmergentEngine {
  return new PhiEmergentEngine();
}
