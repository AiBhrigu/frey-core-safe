/**
 * Q7.6-R — Φ-Resonance Engine (Core Resonance Layer)
 * 
 * Non-blocking φ-resonance computation layer that extracts harmonic, subharmonic,
 * and emergent resonance signatures from the complete Q7 stack.
 * 
 * @tag q7.6-resonance
 */

import type { WaveFrameData } from './types.js';
import type { WaveSignature } from './signature-engine.js';
import type { PatternClassification, PatternState } from './pattern-classifier.js';
import type { EmergentClassification, EmergentState } from './emergent-engine.js';
import type { MemoryState } from './adaptive-memory.js';
import { PHI } from './types.js';

/**
 * Resonance Engine version
 */
export const Q7_RESONANCE_VERSION = '7.6.0';

/**
 * Resonance state classification
 */
export type ResonanceState =
  | 'harmonic-stable'
  | 'harmonic-rising'
  | 'harmonic-falling'
  | 'resonance-burst'
  | 'resonance-collapse';

/**
 * Resonance spectrum vector
 */
export interface ResonanceSpectrum {
  /** Amplitude harmonics H1..H7 */
  amplitudeHarmonics: Float32Array;
  /** Gradient harmonics H1..H7 */
  gradientHarmonics: Float32Array;
  /** Lambda harmonic projections λH1..λH7 */
  lambdaHarmonics: Float32Array;
  /** Timestamp of computation */
  timestamp: number;
}

/**
 * Resonance classification result
 */
export interface ResonanceClassification {
  /** Current resonance state */
  state: ResonanceState;
  /** Resonance Stability Index [0..1] */
  rsi: number;
  /** Harmonic Drift Metric */
  hdm: number;
  /** Full resonance spectrum */
  spectrum: ResonanceSpectrum;
  /** Timestamp */
  timestamp: number;
  /** Frame index */
  frameIndex: number;
}

/**
 * Resonance listener callback
 */
export type ResonanceListener = (classification: ResonanceClassification) => void;

/**
 * Resonance computation constants
 */
const RESONANCE_CONSTANTS = {
  /** Number of amplitude harmonics to compute */
  AMPLITUDE_HARMONICS: 7,
  /** Number of gradient harmonics to compute */
  GRADIENT_HARMONICS: 7,
  /** Lambda scaling factor: φ² - 1 = φ (derived from golden ratio property φ² = φ + 1) */
  LAMBDA: PHI * PHI - 1,
  /** Spectral buffer size */
  SPECTRAL_BUFFER_SIZE: 64,
  /** RSI stability weight */
  RSI_STABILITY_WEIGHT: 0.4,
  /** RSI spectral coherence weight */
  RSI_SPECTRAL_WEIGHT: 0.35,
  /** RSI memory weight */
  RSI_MEMORY_WEIGHT: 0.25,
  /** HDM drift threshold for rising */
  HDM_RISING_THRESHOLD: 0.05,
  /** HDM drift threshold for falling */
  HDM_FALLING_THRESHOLD: -0.05,
  /** RSI threshold for burst detection */
  RSI_BURST_THRESHOLD: 0.85,
  /** RSI threshold for collapse detection */
  RSI_COLLAPSE_THRESHOLD: 0.15,
};

/**
 * PhiResonanceEngine class
 * 
 * Computes resonance spectrum and classification from the complete Q7 stack.
 */
export class PhiResonanceEngine {
  // Spectral buffers (zero-GC)
  private amplitudeHarmonics: Float32Array;
  private gradientHarmonics: Float32Array;
  private lambdaHarmonics: Float32Array;
  private spectralBuffer: Float32Array;
  
  // State tracking
  private currentClassification: ResonanceClassification | null = null;
  private frameIndex: number = 0;
  
  // Event listeners
  private listeners: ResonanceListener[] = [];
  
  // Previous values for drift computation
  private prevRSI: number = 0.5;
  private prevHDM: number = 0;
  
  constructor() {
    // Pre-allocate zero-GC buffers
    const harmonicCount = RESONANCE_CONSTANTS.AMPLITUDE_HARMONICS;
    this.amplitudeHarmonics = new Float32Array(harmonicCount);
    this.gradientHarmonics = new Float32Array(harmonicCount);
    this.lambdaHarmonics = new Float32Array(harmonicCount);
    this.spectralBuffer = new Float32Array(RESONANCE_CONSTANTS.SPECTRAL_BUFFER_SIZE);
  }
  
  /**
   * Compute resonance classification from Q7 stack
   */
  compute(
    frameData: WaveFrameData,
    signature: WaveSignature | null,
    pattern: PatternClassification | null,
    emergent: EmergentClassification | null,
    memory: MemoryState | null
  ): ResonanceClassification {
    const timestamp = performance.now();
    
    // Extract resonance spectrum
    const spectrum = this.extractSpectrum(frameData, signature, timestamp);
    
    // Compute RSI (Resonance Stability Index)
    const rsi = this.computeRSI(spectrum, pattern, emergent, memory);
    
    // Compute HDM (Harmonic Drift Metric)
    const hdm = this.computeHDM(spectrum, memory);
    
    // Classify resonance state
    const state = this.classifyResonanceState(rsi, hdm, emergent);
    
    // Create classification
    this.currentClassification = {
      state,
      rsi,
      hdm,
      spectrum,
      timestamp,
      frameIndex: this.frameIndex++,
    };
    
    // Update previous values for drift
    this.prevRSI = rsi;
    this.prevHDM = hdm;
    
    // Notify listeners
    this.notifyListeners(this.currentClassification);
    
    return this.currentClassification;
  }
  
  /**
   * Extract resonance spectrum from frame data and signature
   */
  private extractSpectrum(
    frameData: WaveFrameData,
    signature: WaveSignature | null,
    timestamp: number
  ): ResonanceSpectrum {
    const { amplitudes } = frameData;
    const lambda = RESONANCE_CONSTANTS.LAMBDA;
    
    // Compute amplitude harmonics (H1..H7)
    for (let n = 0; n < RESONANCE_CONSTANTS.AMPLITUDE_HARMONICS; n++) {
      const harmonicIndex = n + 1;
      let sum = 0;
      let count = 0;
      
      // Sample amplitudes at φ-weighted intervals
      // Cosine transform computes real part of DFT for φ-weighted harmonic extraction
      const step = Math.floor(amplitudes.length / (harmonicIndex * PHI));
      if (step > 0) {
        for (let i = 0; i < amplitudes.length; i += step) {
          sum += amplitudes[i] * Math.cos((2 * Math.PI * i) / amplitudes.length);
          count++;
        }
      }
      
      this.amplitudeHarmonics[n] = count > 0 ? sum / count : 0;
    }
    
    // Compute gradient harmonics (H1..H7) from signature
    // Inverse φ scaling (φ^-n) creates progressively damped harmonics,
    // reflecting the natural decay of gradient influence at higher frequencies
    if (signature) {
      const baseGradient = signature.gradient;
      for (let n = 0; n < RESONANCE_CONSTANTS.GRADIENT_HARMONICS; n++) {
        const harmonicIndex = n + 1;
        this.gradientHarmonics[n] = baseGradient * Math.pow(PHI, -harmonicIndex);
      }
    } else {
      this.gradientHarmonics.fill(0);
    }
    
    // Compute lambda harmonic projections (λH1..λH7)
    // Iteratively compute λ^n to avoid repeated exponentiation in render loop
    let lambdaPower = lambda;
    for (let n = 0; n < RESONANCE_CONSTANTS.AMPLITUDE_HARMONICS; n++) {
      // λ projection: λ^n × amplitude harmonic
      this.lambdaHarmonics[n] = this.amplitudeHarmonics[n] * lambdaPower;
      lambdaPower *= lambda;
    }
    
    return {
      amplitudeHarmonics: this.amplitudeHarmonics,
      gradientHarmonics: this.gradientHarmonics,
      lambdaHarmonics: this.lambdaHarmonics,
      timestamp,
    };
  }
  
  /**
   * Compute Resonance Stability Index (RSI)
   * 
   * RSI = φ-consistency × spectral-stability × memory-weight
   */
  private computeRSI(
    spectrum: ResonanceSpectrum,
    pattern: PatternClassification | null,
    emergent: EmergentClassification | null,
    memory: MemoryState | null
  ): number {
    // φ-consistency from emergent engine
    let phiConsistency = 0.5; // neutral default
    if (emergent && emergent.metrics) {
      phiConsistency = Math.max(0, Math.min(1, emergent.metrics.phiConsistency));
    }
    
    // Spectral stability from amplitude harmonics variance
    let spectralStability = 0.5;
    if (spectrum.amplitudeHarmonics.length > 1) {
      let sum = 0;
      let sumSq = 0;
      const count = spectrum.amplitudeHarmonics.length;
      
      for (let i = 0; i < count; i++) {
        const val = spectrum.amplitudeHarmonics[i];
        sum += val;
        sumSq += val * val;
      }
      
      const mean = sum / count;
      const variance = (sumSq / count) - (mean * mean);
      // Lower variance = higher stability
      spectralStability = 1 / (1 + variance);
    }
    
    // Memory weight from stability window
    let memoryWeight = 0.5;
    if (memory && memory.l1 && memory.l1.stabilityWindow !== undefined) {
      memoryWeight = Math.max(0, Math.min(1, memory.l1.stabilityWindow));
    }
    
    // Combine with weights
    const rsi =
      phiConsistency * RESONANCE_CONSTANTS.RSI_STABILITY_WEIGHT +
      spectralStability * RESONANCE_CONSTANTS.RSI_SPECTRAL_WEIGHT +
      memoryWeight * RESONANCE_CONSTANTS.RSI_MEMORY_WEIGHT;
    
    return Math.max(0, Math.min(1, rsi));
  }
  
  /**
   * Compute Harmonic Drift Metric (HDM)
   * 
   * Measures long-term drift of resonance peaks in memory
   */
  private computeHDM(
    spectrum: ResonanceSpectrum,
    memory: MemoryState | null
  ): number {
    if (!memory || !memory.metrics || memory.metrics.memoryDriftIndex === undefined) {
      return 0;
    }
    
    // Base drift from Memory Drift Index
    const baseDrift = memory.metrics.memoryDriftIndex;
    
    // Weight by lambda harmonic peak positions
    let lambdaDrift = 0;
    let maxLambda = 0;
    let maxLambdaIndex = 0;
    
    for (let i = 0; i < spectrum.lambdaHarmonics.length; i++) {
      const val = Math.abs(spectrum.lambdaHarmonics[i]);
      if (val > maxLambda) {
        maxLambda = val;
        maxLambdaIndex = i;
      }
    }
    
    // Drift correlates with peak position shift
    if (maxLambda > 0.01) {
      const centerIndex = spectrum.lambdaHarmonics.length / 2;
      lambdaDrift = (maxLambdaIndex - centerIndex) / spectrum.lambdaHarmonics.length;
    }
    
    // Combine base drift with lambda drift
    const hdm = baseDrift * 0.7 + lambdaDrift * 0.3;
    
    return hdm;
  }
  
  /**
   * Classify resonance state from RSI, HDM, and emergent state
   */
  private classifyResonanceState(
    rsi: number,
    hdm: number,
    emergent: EmergentClassification | null
  ): ResonanceState {
    // Check for burst (high RSI spike)
    if (rsi > RESONANCE_CONSTANTS.RSI_BURST_THRESHOLD) {
      return 'resonance-burst';
    }
    
    // Check for collapse (low RSI)
    if (rsi < RESONANCE_CONSTANTS.RSI_COLLAPSE_THRESHOLD) {
      return 'resonance-collapse';
    }
    
    // Check harmonic drift direction
    if (hdm > RESONANCE_CONSTANTS.HDM_RISING_THRESHOLD) {
      return 'harmonic-rising';
    }
    
    if (hdm < RESONANCE_CONSTANTS.HDM_FALLING_THRESHOLD) {
      return 'harmonic-falling';
    }
    
    // Use emergent state as tie-breaker for stable classification
    if (emergent) {
      // Turbulent or threshold-shift emergent → likely not stable
      if (emergent.state === 'turbulent' || emergent.state === 'threshold-shift') {
        // Favor rising/falling based on subtle HDM
        return hdm >= 0 ? 'harmonic-rising' : 'harmonic-falling';
      }
      
      // Coherent emergent → stable resonance
      if (emergent.state === 'coherent') {
        return 'harmonic-stable';
      }
    }
    
    // Default to stable
    return 'harmonic-stable';
  }
  
  /**
   * Subscribe to resonance updates
   */
  subscribe(listener: ResonanceListener): void {
    this.listeners.push(listener);
  }
  
  /**
   * Unsubscribe from resonance updates
   */
  unsubscribe(listener: ResonanceListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(classification: ResonanceClassification): void {
    for (const listener of this.listeners) {
      listener(classification);
    }
  }
  
  /**
   * Get current resonance classification
   */
  getCurrentResonance(): ResonanceClassification | null {
    return this.currentClassification;
  }
  
  /**
   * Get current resonance state
   */
  getResonanceState(): ResonanceState | null {
    return this.currentClassification?.state ?? null;
  }
  
  /**
   * Get current RSI
   */
  getRSI(): number | null {
    return this.currentClassification?.rsi ?? null;
  }
  
  /**
   * Get current HDM
   */
  getHDM(): number | null {
    return this.currentClassification?.hdm ?? null;
  }
  
  /**
   * Reset the engine
   */
  reset(): void {
    this.amplitudeHarmonics.fill(0);
    this.gradientHarmonics.fill(0);
    this.lambdaHarmonics.fill(0);
    this.spectralBuffer.fill(0);
    this.currentClassification = null;
    this.frameIndex = 0;
    this.prevRSI = 0.5;
    this.prevHDM = 0;
  }
}

/**
 * Factory function to create a resonance engine
 */
export function createResonanceEngine(): PhiResonanceEngine {
  return new PhiResonanceEngine();
}
