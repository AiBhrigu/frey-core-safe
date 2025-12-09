/**
 * Φ-Coherence Stabilizer Layer (Q7.7)
 * 
 * Final Q7 module that introduces a stabilizing coherence layer between
 * Pattern → Emergent → Memory → Resonance to reduce phase-shifts and
 * unstable harmonic jumps.
 * 
 * @tag q7.7-coherence-stabilizer
 */

import type { WaveSignature } from './signature-engine.js';
import type { PatternClassification } from './pattern-classifier.js';
import type { EmergentClassification } from './emergent-engine.js';
import type { ResonanceClassification } from './resonance-engine.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Coherence Stabilizer Version
 */
export const Q7_COHERENCE_VERSION = '7.7.0';

/**
 * Phase Coherence Metric (PCM) data
 */
export interface PhaseCoherenceMetric {
  /** PCM value (0-1, where 1 = perfect alignment) */
  value: number;
  /** Pattern-emergent alignment */
  patternEmergentAlign: number;
  /** Emergent-resonance alignment */
  emergentResonanceAlign: number;
  /** Overall system coherence */
  systemCoherence: number;
  /** Timestamp of measurement */
  timestamp: number;
}

/**
 * Coherence state classification
 */
export interface CoherenceState {
  /** Overall coherence level */
  coherence: 'high' | 'medium' | 'low' | 'unstable';
  /** Is drift dampening active */
  driftDampeningActive: boolean;
  /** Is burst softening active */
  burstSofteningActive: boolean;
  /** Stability envelope value (0-1) */
  stabilityEnvelope: number;
  /** Current dampening factor */
  dampeningFactor: number;
  /** PCM */
  pcm: PhaseCoherenceMetric;
  /** Timestamp */
  timestamp: number;
}

/**
 * Coherence listener callback
 */
export type CoherenceListener = (state: CoherenceState) => void;

/**
 * Coherence configuration
 */
interface CoherenceConfig {
  /** Stability window size (number of signatures to smooth) */
  stabilityWindow: number;
  /** Drift threshold for dampening activation */
  driftThreshold: number;
  /** Dampening duration (frames) */
  dampeningFrames: number;
  /** Burst softening factor (0-1) */
  burstSofteningFactor: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CoherenceConfig = {
  stabilityWindow: 5,
  driftThreshold: 0.15,
  dampeningFrames: 3,
  burstSofteningFactor: 0.618, // φ^-1
};

/**
 * Φ-Coherence Stabilizer class
 * 
 * Reduces phase-shifts and unstable harmonic jumps by:
 * - Smoothing amplitude/gradient over last 5 signatures
 * - Computing Phase Coherence Metric (PCM) for alignment
 * - Dampening drift when memory drift exceeds threshold
 * - Softening resonance-burst impacts on emergent states
 */
export class PhiCoherenceStabilizer {
  private readonly config: CoherenceConfig;
  
  // Stability envelope buffer (last N signatures)
  private readonly signatureBuffer: WaveSignature[] = [];
  
  // Smoothed values
  private smoothedAmplitude: number = 0;
  private smoothedGradient: number = 0;
  private smoothedVariance: number = 0;
  
  // Drift dampening state
  private dampeningCounter: number = 0;
  private currentDampeningFactor: number = 1.0;
  
  // PCM history
  private lastPCM: PhaseCoherenceMetric | null = null;
  
  // Event listeners
  private listeners: CoherenceListener[] = [];
  
  // Frame counter
  private frameCount: number = 0;
  
  constructor(config: Partial<CoherenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Process complete Q7 stack and compute coherence
   */
  process(
    signature: WaveSignature | null,
    pattern: PatternClassification | null,
    emergent: EmergentClassification | null,
    resonance: ResonanceClassification | null,
    memoryDrift: number
  ): CoherenceState {
    this.frameCount++;
    const timestamp = performance.now();
    
    // 1. Update stability envelope
    if (signature) {
      this.updateStabilityEnvelope(signature);
    }
    
    // 2. Check for drift dampening
    const driftDampeningActive = this.updateDriftDampening(memoryDrift);
    
    // 3. Check for burst softening
    const burstSofteningActive = resonance?.state === 'resonance-burst';
    
    // 4. Compute PCM
    const pcm = this.computePCM(pattern, emergent, resonance, timestamp);
    this.lastPCM = pcm;
    
    // 5. Classify coherence level
    const coherence = this.classifyCoherence(pcm.value);
    
    // 6. Build state
    const state: CoherenceState = {
      coherence,
      driftDampeningActive,
      burstSofteningActive,
      stabilityEnvelope: this.getStabilityEnvelope(),
      dampeningFactor: this.currentDampeningFactor,
      pcm,
      timestamp,
    };
    
    // 7. Emit to listeners
    this.emitCoherence(state);
    
    return state;
  }
  
  /**
   * Update stability envelope with new signature
   */
  private updateStabilityEnvelope(signature: WaveSignature): void {
    // Add to buffer
    this.signatureBuffer.push(signature);
    
    // Trim to window size
    while (this.signatureBuffer.length > this.config.stabilityWindow) {
      this.signatureBuffer.shift();
    }
    
    // Compute smoothed values (simple moving average)
    if (this.signatureBuffer.length > 0) {
      let sumAmp = 0;
      let sumGrad = 0;
      let sumVar = 0;
      
      for (const sig of this.signatureBuffer) {
        sumAmp += sig.amplitude;
        sumGrad += sig.gradient;
        sumVar += sig.variance;
      }
      
      const count = this.signatureBuffer.length;
      this.smoothedAmplitude = sumAmp / count;
      this.smoothedGradient = sumGrad / count;
      this.smoothedVariance = sumVar / count;
      
      // Clamp extreme variance by φ-attenuation
      const varianceRatio = this.smoothedVariance / (this.smoothedAmplitude + 0.001);
      if (varianceRatio > 5.0) {
        // Apply φ^-1 dampening
        this.smoothedVariance *= PHI_INV;
      }
    }
  }
  
  /**
   * Update drift dampening state
   */
  private updateDriftDampening(memoryDrift: number): boolean {
    const driftMagnitude = Math.abs(memoryDrift);
    
    // Check if drift exceeds threshold
    if (driftMagnitude > this.config.driftThreshold) {
      // Activate dampening
      this.dampeningCounter = this.config.dampeningFrames;
      this.currentDampeningFactor = PHI_INV; // φ^-1 dampening
      return true;
    }
    
    // Decay dampening counter
    if (this.dampeningCounter > 0) {
      this.dampeningCounter--;
      
      if (this.dampeningCounter === 0) {
        // Reset dampening
        this.currentDampeningFactor = 1.0;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Compute Phase Coherence Metric (PCM)
   * 
   * Measures alignment between pattern/emergent/resonance layers.
   * Range: 0 (no alignment) to 1 (perfect alignment)
   */
  private computePCM(
    pattern: PatternClassification | null,
    emergent: EmergentClassification | null,
    resonance: ResonanceClassification | null,
    timestamp: number
  ): PhaseCoherenceMetric {
    let patternEmergentAlign = 0.5; // Default neutral
    let emergentResonanceAlign = 0.5;
    
    // Pattern-Emergent alignment
    if (pattern && emergent) {
      // Check state compatibility
      const patternState = pattern.state;
      const emergentState = emergent.state;
      
      // High alignment: ascending pattern + coherent emergent
      if (patternState === 'ascending' && emergentState === 'coherent') {
        patternEmergentAlign = 0.9;
      }
      // High alignment: descending pattern + coherent emergent
      else if (patternState === 'descending' && emergentState === 'coherent') {
        patternEmergentAlign = 0.9;
      }
      // Medium alignment: stable pattern + drifting emergent
      else if (patternState === 'stable' && emergentState === 'drifting') {
        patternEmergentAlign = 0.7;
      }
      // Low alignment: volatile/chaotic with turbulent
      else if ((patternState === 'volatile' || patternState === 'chaotic') && emergentState === 'turbulent') {
        patternEmergentAlign = 0.3;
      }
      // Medium alignment: cycling detection
      else if (emergentState === 'cycling') {
        patternEmergentAlign = 0.6;
      }
      else {
        patternEmergentAlign = 0.5;
      }
    }
    
    // Emergent-Resonance alignment
    if (emergent && resonance) {
      const emergentState = emergent.state;
      const resonanceState = resonance.state;
      
      // High alignment: coherent + harmonic-stable
      if (emergentState === 'coherent' && resonanceState === 'harmonic-stable') {
        emergentResonanceAlign = 0.95;
      }
      // High alignment: drifting + harmonic-rising/falling
      else if (emergentState === 'drifting' && (resonanceState === 'harmonic-rising' || resonanceState === 'harmonic-falling')) {
        emergentResonanceAlign = 0.85;
      }
      // Low alignment: turbulent + resonance-burst
      else if (emergentState === 'turbulent' && resonanceState === 'resonance-burst') {
        emergentResonanceAlign = 0.2;
      }
      // Very low alignment: threshold-shift + resonance-collapse
      else if (emergentState === 'threshold-shift' && resonanceState === 'resonance-collapse') {
        emergentResonanceAlign = 0.1;
      }
      else {
        emergentResonanceAlign = 0.5;
      }
    }
    
    // System coherence (weighted average with φ weighting)
    const systemCoherence = (patternEmergentAlign * PHI + emergentResonanceAlign) / (PHI + 1);
    
    return {
      value: systemCoherence,
      patternEmergentAlign,
      emergentResonanceAlign,
      systemCoherence,
      timestamp,
    };
  }
  
  /**
   * Classify coherence level based on PCM value
   */
  private classifyCoherence(pcmValue: number): 'high' | 'medium' | 'low' | 'unstable' {
    if (pcmValue >= 0.8) return 'high';
    if (pcmValue >= 0.6) return 'medium';
    if (pcmValue >= 0.4) return 'low';
    return 'unstable';
  }
  
  /**
   * Get current stability envelope value
   */
  getStabilityEnvelope(): number {
    if (this.signatureBuffer.length === 0) return 0;
    
    // Envelope is based on smoothed amplitude
    return Math.min(1.0, this.smoothedAmplitude);
  }
  
  /**
   * Get smoothed amplitude
   */
  getSmoothedAmplitude(): number {
    return this.smoothedAmplitude;
  }
  
  /**
   * Get smoothed gradient
   */
  getSmoothedGradient(): number {
    return this.smoothedGradient;
  }
  
  /**
   * Get smoothed variance
   */
  getSmoothedVariance(): number {
    return this.smoothedVariance;
  }
  
  /**
   * Get Phase Coherence Metric
   */
  getPCM(): PhaseCoherenceMetric | null {
    return this.lastPCM;
  }
  
  /**
   * Get current dampening factor
   */
  getDampeningFactor(): number {
    return this.currentDampeningFactor;
  }
  
  /**
   * Apply burst softening to resonance impact
   * 
   * Reduces the impact of resonance-burst on emergent state by
   * the configured burst softening factor (φ^-1 by default).
   */
  applyBurstSoftening(resonanceImpact: number): number {
    return resonanceImpact * this.config.burstSofteningFactor;
  }
  
  /**
   * Subscribe to coherence updates
   */
  subscribe(listener: CoherenceListener): void {
    this.listeners.push(listener);
  }
  
  /**
   * Unsubscribe from coherence updates
   */
  unsubscribe(listener: CoherenceListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Emit coherence update to listeners
   */
  private emitCoherence(state: CoherenceState): void {
    for (const listener of this.listeners) {
      listener(state);
    }
  }
  
  /**
   * Reset stabilizer state
   */
  reset(): void {
    this.signatureBuffer.length = 0;
    this.smoothedAmplitude = 0;
    this.smoothedGradient = 0;
    this.smoothedVariance = 0;
    this.dampeningCounter = 0;
    this.currentDampeningFactor = 1.0;
    this.lastPCM = null;
    this.frameCount = 0;
  }
}

/**
 * Factory function to create coherence stabilizer
 */
export function createCoherenceStabilizer(config?: Partial<CoherenceConfig>): PhiCoherenceStabilizer {
  return new PhiCoherenceStabilizer(config);
}
