/**
 * Wave Signature Engine v1 (Q7.3-S)
 * 
 * Computes wave signatures including amplitude, gradient, lambda, and variance
 * for wave field analysis and pattern recognition.
 * 
 * @tag q7.3-signature-engine
 */

import type { WaveFrameData } from './types.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Signature Engine Version
 */
export const Q7_SIGNATURE_VERSION = '7.3.0';

/**
 * Wave signature data
 */
export interface WaveSignature {
  /** Average amplitude across field */
  amplitude: number;
  /** Spatial gradient magnitude */
  gradient: number;
  /** Dominant wavelength (λ) */
  lambda: number;
  /** Amplitude variance */
  variance: number;
  /** Computation timestamp */
  timestamp: number;
  /** Frame index */
  frameIndex: number;
}

/**
 * Signature computation options
 */
export interface SignatureOptions {
  /** Enable gradient computation */
  computeGradient: boolean;
  /** Enable lambda computation */
  computeLambda: boolean;
  /** Enable variance computation */
  computeVariance: boolean;
  /** Sample rate for performance (1 = full, 2 = half, etc.) */
  sampleRate: number;
}

/**
 * Default signature options
 */
const DEFAULT_OPTIONS: SignatureOptions = {
  computeGradient: true,
  computeLambda: true,
  computeVariance: true,
  sampleRate: 1,
};

/**
 * WaveSignatureEngine class for signature computation
 */
export class WaveSignatureEngine {
  private readonly options: SignatureOptions;
  private lastSignature: WaveSignature | null = null;
  private signatureHistory: WaveSignature[] = [];
  private readonly maxHistorySize: number = 100;
  
  // Pre-allocated buffers for zero-GC computation
  private gradientBuffer: Float32Array | null = null;
  private resolution: number = 0;
  
  constructor(options: Partial<SignatureOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Compute wave signature from frame data
   */
  computeSignature(frameData: WaveFrameData, resolution: number): WaveSignature {
    // Initialize buffers if needed
    if (this.resolution !== resolution) {
      this.resolution = resolution;
      if (this.options.computeGradient) {
        this.gradientBuffer = new Float32Array(resolution * resolution);
      }
    }
    
    const amplitudes = frameData.amplitudes;
    const sampleRate = this.options.sampleRate;
    
    // Compute amplitude (mean)
    const amplitude = this.computeAmplitude(amplitudes, sampleRate);
    
    // Compute gradient
    const gradient = this.options.computeGradient
      ? this.computeGradient(amplitudes, resolution, sampleRate)
      : 0;
    
    // Compute dominant wavelength
    const lambda = this.options.computeLambda
      ? this.computeLambda(amplitudes, resolution, sampleRate)
      : 0;
    
    // Compute variance
    const variance = this.options.computeVariance
      ? this.computeVariance(amplitudes, amplitude, sampleRate)
      : 0;
    
    const signature: WaveSignature = {
      amplitude,
      gradient,
      lambda,
      variance,
      timestamp: frameData.timestamp,
      frameIndex: frameData.frameIndex,
    };
    
    this.lastSignature = signature;
    this.recordSignature(signature);
    
    return signature;
  }
  
  /**
   * Compute average amplitude
   */
  private computeAmplitude(amplitudes: Float32Array, sampleRate: number): number {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < amplitudes.length; i += sampleRate) {
      sum += Math.abs(amplitudes[i]);
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  }
  
  /**
   * Compute spatial gradient magnitude
   */
  private computeGradient(
    amplitudes: Float32Array,
    resolution: number,
    sampleRate: number
  ): number {
    if (!this.gradientBuffer) return 0;
    
    let gradientSum = 0;
    let count = 0;
    
    for (let y = 0; y < resolution - 1; y += sampleRate) {
      for (let x = 0; x < resolution - 1; x += sampleRate) {
        const idx = y * resolution + x;
        const idxRight = idx + 1;
        const idxDown = idx + resolution;
        
        // Compute gradient using finite differences
        const dx = amplitudes[idxRight] - amplitudes[idx];
        const dy = amplitudes[idxDown] - amplitudes[idx];
        const gradMag = Math.sqrt(dx * dx + dy * dy);
        
        gradientSum += gradMag;
        count++;
      }
    }
    
    return count > 0 ? gradientSum / count : 0;
  }
  
  /**
   * Compute dominant wavelength using φ-based spatial analysis
   */
  private computeLambda(
    amplitudes: Float32Array,
    resolution: number,
    sampleRate: number
  ): number {
    // Simple autocorrelation-based wavelength estimation
    // Sample along a diagonal for φ-harmonic analysis
    
    let maxCorrelation = 0;
    let bestLag = 1;
    const maxLag = Math.min(resolution / 4, 16);
    
    for (let lag = 1; lag < maxLag; lag += sampleRate) {
      let correlation = 0;
      let count = 0;
      
      // Ensure we don't exceed bounds: (i + lag) must be < resolution
      const maxI = resolution - lag;
      for (let i = 0; i < maxI; i += sampleRate) {
        const idx1 = i * resolution + i;
        const idx2 = (i + lag) * resolution + (i + lag);
        
        // Double-check bounds for safety
        if (idx1 >= 0 && idx1 < amplitudes.length && idx2 >= 0 && idx2 < amplitudes.length) {
          correlation += amplitudes[idx1] * amplitudes[idx2];
          count++;
        }
      }
      
      if (count > 0) {
        correlation /= count;
        
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation;
          bestLag = lag;
        }
      }
    }
    
    // Convert lag to wavelength estimate (normalized by φ)
    return bestLag * PHI;
  }
  
  /**
   * Compute amplitude variance
   */
  private computeVariance(
    amplitudes: Float32Array,
    mean: number,
    sampleRate: number
  ): number {
    let sumSquaredDiff = 0;
    let count = 0;
    
    for (let i = 0; i < amplitudes.length; i += sampleRate) {
      const diff = Math.abs(amplitudes[i]) - mean;
      sumSquaredDiff += diff * diff;
      count++;
    }
    
    return count > 0 ? sumSquaredDiff / count : 0;
  }
  
  /**
   * Record signature in history
   */
  private recordSignature(signature: WaveSignature): void {
    this.signatureHistory.push(signature);
    
    if (this.signatureHistory.length > this.maxHistorySize) {
      this.signatureHistory.shift();
    }
  }
  
  /**
   * Get last computed signature
   */
  getLastSignature(): WaveSignature | null {
    return this.lastSignature ? { ...this.lastSignature } : null;
  }
  
  /**
   * Get signature history
   */
  getSignatureHistory(): readonly WaveSignature[] {
    return [...this.signatureHistory];
  }
  
  /**
   * Clear signature history
   */
  clearHistory(): void {
    this.signatureHistory = [];
  }
  
  /**
   * Get version
   */
  getVersion(): string {
    return Q7_SIGNATURE_VERSION;
  }
  
  /**
   * Get options
   */
  getOptions(): Readonly<SignatureOptions> {
    return { ...this.options };
  }
}

/**
 * Create a WaveSignatureEngine instance
 */
export function createSignatureEngine(options?: Partial<SignatureOptions>): WaveSignatureEngine {
  return new WaveSignatureEngine(options);
}
