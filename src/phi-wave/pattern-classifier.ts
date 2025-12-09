/**
 * Φ Pattern Classifier v1 (Q7.3-P)
 * 
 * Core interpretation layer that classifies wave signatures into system states.
 * Powers Q7.4-E (Emergent Behavior), Q7.5-A (Adaptive Memory), and Q7.6-R (Resonance Engine).
 * 
 * @tag q7.3-pattern-classifier
 */

import type { WaveSignature } from './signature-engine.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Pattern Classifier Version
 */
export const Q7_PATTERN_VERSION = '7.3.1';

/**
 * Pattern state classification
 */
export type PatternState = 'stable' | 'ascending' | 'descending' | 'volatile' | 'chaotic';

/**
 * Pattern classification result
 */
export interface PatternClassification {
  /** Current pattern state */
  state: PatternState;
  /** Confidence level (0-1) */
  confidence: number;
  /** Timestamp of classification */
  timestamp: number;
  /** Contributing metrics */
  metrics: {
    amplitudeDelta: number;
    gradientSign: number;
    lambdaStability: number;
    varianceBurst: number;
    trendReversals: number;
  };
}

/**
 * Pattern listener callback
 */
export type PatternListener = (pattern: PatternClassification) => void;

/**
 * Classification thresholds (tuned for φ-resonance)
 */
const THRESHOLDS = {
  // Gradient thresholds
  gradientUp: 0.03,
  gradientDown: -0.03,
  
  // Variance thresholds
  varianceStable: 0.01,
  varianceBurst: 5.0, // Ratio threshold
  
  // Drift threshold for stability
  driftMax: 0.02,
  
  // Chaos detection
  chaoticDecayFrames: 10, // Frames to decay from chaotic to volatile
  trendReversalThreshold: 3, // Reversals in window to consider chaotic
};

/**
 * PhiPatternClassifier class
 * 
 * Zero-GC implementation using ring buffers and pre-allocated structures.
 */
export class PhiPatternClassifier {
  // Ring buffer for pattern history (max 20)
  private readonly patternBuffer: PatternClassification[];
  private readonly bufferSize: number = 20;
  private bufferIndex: number = 0;
  private bufferFilled: boolean = false;
  
  // Ring buffer for signature history (for trend analysis)
  private readonly signatureBuffer: WaveSignature[];
  private readonly signatureBufferSize: number = 10;
  private signatureIndex: number = 0;
  private signatureFilled: boolean = false;
  
  // Current state
  private currentPattern: PatternClassification | null = null;
  
  // Chaotic decay tracking
  private chaoticFramesRemaining: number = 0;
  
  // Event listeners
  private readonly listeners: PatternListener[] = [];
  
  // Pre-allocated metric object (zero-GC)
  private readonly metricsCache = {
    amplitudeDelta: 0,
    gradientSign: 0,
    lambdaStability: 0,
    varianceBurst: 0,
    trendReversals: 0,
  };
  
  constructor() {
    // Pre-allocate ring buffers
    this.patternBuffer = new Array(this.bufferSize);
    this.signatureBuffer = new Array(this.signatureBufferSize);
  }
  
  /**
   * Classify a wave signature into a pattern state
   */
  classify(signature: WaveSignature): PatternClassification {
    // Store signature in history
    this.recordSignature(signature);
    
    // Compute metrics
    this.computeMetrics(signature);
    
    // Determine state
    const state = this.determineState();
    
    // Create classification (reuse metrics cache)
    const classification: PatternClassification = {
      state,
      confidence: this.computeConfidence(state),
      timestamp: signature.timestamp,
      metrics: {
        amplitudeDelta: this.metricsCache.amplitudeDelta,
        gradientSign: this.metricsCache.gradientSign,
        lambdaStability: this.metricsCache.lambdaStability,
        varianceBurst: this.metricsCache.varianceBurst,
        trendReversals: this.metricsCache.trendReversals,
      },
    };
    
    // Store current pattern
    this.currentPattern = classification;
    
    // Record in history
    this.recordPattern(classification);
    
    // Notify listeners
    this.notifyListeners(classification);
    
    return classification;
  }
  
  /**
   * Compute classification metrics
   */
  private computeMetrics(signature: WaveSignature): void {
    // Amplitude delta (change from previous)
    const prevSignature = this.getPreviousSignature();
    if (prevSignature) {
      this.metricsCache.amplitudeDelta = signature.amplitude - prevSignature.amplitude;
    } else {
      this.metricsCache.amplitudeDelta = 0;
    }
    
    // Gradient sign (-1, 0, 1)
    this.metricsCache.gradientSign = Math.sign(signature.gradient);
    
    // Lambda stability (inverse of change rate)
    if (prevSignature && prevSignature.lambda > 0) {
      const lambdaChange = Math.abs(signature.lambda - prevSignature.lambda) / prevSignature.lambda;
      this.metricsCache.lambdaStability = 1 - Math.min(lambdaChange, 1);
    } else {
      this.metricsCache.lambdaStability = 1;
    }
    
    // Variance burst (spike detection)
    const avgVariance = this.getAverageVariance();
    if (avgVariance > 0) {
      this.metricsCache.varianceBurst = signature.variance / avgVariance;
    } else {
      this.metricsCache.varianceBurst = 1;
    }
    
    // Trend reversals (count direction changes)
    this.metricsCache.trendReversals = this.countTrendReversals();
  }
  
  /**
   * Determine pattern state from metrics
   */
  private determineState(): PatternState {
    const m = this.metricsCache;
    
    // Chaotic decay: if we were chaotic, decay to volatile
    if (this.chaoticFramesRemaining > 0) {
      this.chaoticFramesRemaining--;
      if (this.chaoticFramesRemaining === 0) {
        return 'volatile';
      }
      // Check if still chaotic
      if (this.isChaoticCondition()) {
        this.chaoticFramesRemaining = THRESHOLDS.chaoticDecayFrames; // Reset decay
        return 'chaotic';
      }
      return 'chaotic';
    }
    
    // Check for chaotic first (highest priority)
    if (this.isChaoticCondition()) {
      this.chaoticFramesRemaining = THRESHOLDS.chaoticDecayFrames;
      return 'chaotic';
    }
    
    // Ascending: positive gradient, stable variance (check before volatile)
    const gradient = this.getAverageGradient();
    if (gradient > THRESHOLDS.gradientUp && m.varianceBurst < THRESHOLDS.varianceBurst) {
      return 'ascending';
    }
    
    // Descending: negative gradient, stable variance (check before volatile)
    if (gradient < THRESHOLDS.gradientDown && m.varianceBurst < THRESHOLDS.varianceBurst) {
      return 'descending';
    }
    
    // Stable: low variance, near-zero gradient, minimal drift (check before volatile)
    const drift = Math.abs(m.amplitudeDelta);
    if (m.varianceBurst < 2.0 &&
        Math.abs(gradient) < THRESHOLDS.driftMax &&
        drift < THRESHOLDS.driftMax) {
      return 'stable';
    }
    
    // Volatile: high variance, no consistent trend
    if (m.varianceBurst > THRESHOLDS.varianceBurst) {
      return 'volatile';
    }
    
    // Default to stable if variance is reasonable but no clear trend
    return 'stable';
  }
  
  /**
   * Check if conditions indicate chaotic state
   */
  private isChaoticCondition(): boolean {
    const m = this.metricsCache;
    
    // Chaotic: variance spike + rapid trend reversals + unstable amplitude
    const hasVarianceSpike = m.varianceBurst > THRESHOLDS.varianceBurst;
    const hasReversals = m.trendReversals >= THRESHOLDS.trendReversalThreshold;
    const hasUnstableAmplitude = Math.abs(m.amplitudeDelta) > THRESHOLDS.driftMax * PHI;
    
    return hasVarianceSpike && hasReversals && hasUnstableAmplitude;
  }
  
  /**
   * Compute confidence level for classification
   */
  private computeConfidence(state: PatternState): number {
    const m = this.metricsCache;
    
    switch (state) {
      case 'stable':
        // High confidence if all metrics support stability
        const stabilityScore = 1 - Math.min((m.varianceBurst / 2) + Math.abs(m.amplitudeDelta * 10), 1);
        return Math.max(stabilityScore, 0.1); // Minimum 0.1 confidence
      
      case 'ascending':
      case 'descending':
        // Confidence based on gradient strength and variance stability
        const gradient = this.getAverageGradient();
        const gradientStrength = Math.min(Math.abs(gradient) / THRESHOLDS.gradientUp, 1);
        const varianceStability = 1 - Math.min(m.varianceBurst / THRESHOLDS.varianceBurst, 1);
        return Math.max((gradientStrength + varianceStability) / 2, 0.1);
      
      case 'volatile':
        // Confidence based on variance level
        return Math.max(Math.min(m.varianceBurst / THRESHOLDS.varianceBurst, 1), 0.1);
      
      case 'chaotic':
        // High confidence if multiple chaotic indicators
        const indicators = [
          m.varianceBurst > THRESHOLDS.varianceBurst,
          m.trendReversals >= THRESHOLDS.trendReversalThreshold,
          Math.abs(m.amplitudeDelta) > THRESHOLDS.driftMax * PHI,
        ].filter(Boolean).length;
        return Math.max(indicators / 3, 0.1);
      
      default:
        return 0.5;
    }
  }
  
  /**
   * Get average gradient from recent signatures
   */
  private getAverageGradient(): number {
    if (!this.signatureFilled && this.signatureIndex === 0) {
      return 0;
    }
    
    const count = this.signatureFilled ? this.signatureBufferSize : this.signatureIndex;
    let sum = 0;
    
    // Use proper ring buffer indexing to get most recent entries
    for (let i = 0; i < count; i++) {
      const idx = (this.signatureIndex - count + i + this.signatureBufferSize) % this.signatureBufferSize;
      const sig = this.signatureBuffer[idx];
      if (sig) {
        sum += sig.gradient;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }
  
  /**
   * Get average variance from recent signatures
   */
  private getAverageVariance(): number {
    if (!this.signatureFilled && this.signatureIndex === 0) {
      return 0;
    }
    
    const count = this.signatureFilled ? this.signatureBufferSize : this.signatureIndex;
    let sum = 0;
    
    // Use proper ring buffer indexing to get most recent entries
    for (let i = 0; i < count; i++) {
      const idx = (this.signatureIndex - count + i + this.signatureBufferSize) % this.signatureBufferSize;
      const sig = this.signatureBuffer[idx];
      if (sig) {
        sum += sig.variance;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }
  
  /**
   * Count trend reversals in recent signatures
   */
  private countTrendReversals(): number {
    if (!this.signatureFilled && this.signatureIndex < 2) {
      return 0;
    }
    
    const count = this.signatureFilled ? this.signatureBufferSize : this.signatureIndex;
    let reversals = 0;
    let prevDirection = 0;
    
    for (let i = 1; i < count; i++) {
      const idx = (this.signatureIndex - i + this.signatureBufferSize) % this.signatureBufferSize;
      const prevIdx = (this.signatureIndex - i - 1 + this.signatureBufferSize) % this.signatureBufferSize;
      
      const sig = this.signatureBuffer[idx];
      const prevSig = this.signatureBuffer[prevIdx];
      
      if (sig && prevSig) {
        const direction = Math.sign(sig.amplitude - prevSig.amplitude);
        if (direction !== 0 && prevDirection !== 0 && direction !== prevDirection) {
          reversals++;
        }
        if (direction !== 0) {
          prevDirection = direction;
        }
      }
    }
    
    return reversals;
  }
  
  /**
   * Get previous signature from buffer
   */
  private getPreviousSignature(): WaveSignature | null {
    if (!this.signatureFilled && this.signatureIndex === 0) {
      return null;
    }
    
    const prevIndex = (this.signatureIndex - 1 + this.signatureBufferSize) % this.signatureBufferSize;
    return this.signatureBuffer[prevIndex] || null;
  }
  
  /**
   * Record signature in ring buffer
   */
  private recordSignature(signature: WaveSignature): void {
    this.signatureBuffer[this.signatureIndex] = signature;
    this.signatureIndex = (this.signatureIndex + 1) % this.signatureBufferSize;
    
    if (this.signatureIndex === 0) {
      this.signatureFilled = true;
    }
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
   * Get current pattern classification
   */
  getCurrentPattern(): PatternClassification | null {
    return this.currentPattern ? { ...this.currentPattern } : null;
  }
  
  /**
   * Get pattern history
   */
  getPatternHistory(): readonly PatternClassification[] {
    const count = this.bufferFilled ? this.bufferSize : this.bufferIndex;
    const history: PatternClassification[] = [];
    
    for (let i = 0; i < count; i++) {
      const idx = (this.bufferIndex - count + i + this.bufferSize) % this.bufferSize;
      const pattern = this.patternBuffer[idx];
      if (pattern) {
        history.push({ ...pattern });
      }
    }
    
    return history;
  }
  
  /**
   * Subscribe to pattern updates
   */
  subscribe(listener: PatternListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(pattern: PatternClassification): void {
    for (const listener of this.listeners) {
      try {
        listener(pattern);
      } catch (error) {
        console.error('PhiPatternClassifier: Error in listener:', error);
      }
    }
  }
  
  /**
   * Get version
   */
  getVersion(): string {
    return Q7_PATTERN_VERSION;
  }
  
  /**
   * Clear all history (for testing/reset)
   */
  clearHistory(): void {
    this.bufferIndex = 0;
    this.bufferFilled = false;
    this.signatureIndex = 0;
    this.signatureFilled = false;
    this.currentPattern = null;
    this.chaoticFramesRemaining = 0;
  }
}

/**
 * Create a PhiPatternClassifier instance
 */
export function createPatternClassifier(): PhiPatternClassifier {
  return new PhiPatternClassifier();
}
