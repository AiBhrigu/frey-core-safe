/**
 * Q8.3 — Φ-Entropy Regulator (Core Stabilization Layer)
 * 
 * Manages system entropy across all Q7 layers and Q8 meta-control outputs.
 * Prevents runaway behavior and chaotization under high load.
 * 
 * Entropy channels:
 * - Pattern entropy (pattern state variance)
 * - Emergent entropy (state oscillation)
 * - Memory entropy (drift variance × Markov spread)
 * - Resonance entropy (harmonic scatter)
 * - Coherence entropy (PCM turbulence)
 * 
 * φ-attenuation damping:
 * - entropy > 0.6 → φ^-1 damping (0.618)
 * - entropy > 0.8 → φ^-2 hard clamp (0.382)
 * 
 * System Stability Score (SSS):
 * sss = (1 - entropy) × coherence × (1 - modulationIndex)
 */

import { PHI_INV } from '../wave-kernel';
import type { PatternState } from '../pattern-classifier';
import type { EmergentState } from '../emergent-engine';
import type { CoherenceState } from '../coherence-stabilizer';

export const Q8_ENTROPY_VERSION = '8.3.0';

// φ-based damping factors
const PHI_DAMPING = PHI_INV; // 0.618...
const PHI_HARD_CLAMP = PHI_INV * PHI_INV; // 0.382...

export type EntropyState = 'low' | 'moderate' | 'high' | 'critical';

export interface EntropyData {
  entropy: number; // 0..1
  sss: number; // System Stability Score 0..1
  state: EntropyState;
  patternEntropy: number;
  emergentEntropy: number;
  memoryEntropy: number;
  resonanceEntropy: number;
  coherenceEntropy: number;
  dampingFactor: number; // Applied attenuation
  timestamp: number;
}

export type EntropyListener = (data: EntropyData) => void;

interface Q8InputState {
  patternState: PatternState;
  emergentState: EmergentState;
  memoryDrift: number;
  resonanceHDM: number;
  coherencePCM: number;
  modulationIndex: number;
  coherenceState: CoherenceState;
}

/**
 * PhiEntropyRegulator
 * 
 * Computes system-wide entropy and applies φ-based damping to prevent
 * runaway behavior. Works as the final stabilization layer in Q8 meta-control.
 */
export class PhiEntropyRegulator {
  private listeners: EntropyListener[] = [];
  private lastData: EntropyData | null = null;
  
  // History buffers for entropy variance computation (10 frames)
  private patternHistory: number[] = new Array(10).fill(0);
  private emergentHistory: number[] = new Array(10).fill(0);
  private historyIndex = 0;
  private historyFilled = false;

  constructor() {}

  /**
   * Compute entropy across all Q7 + Q8 layers
   */
  update(input: Q8InputState): EntropyData {
    const timestamp = Date.now();

    // 1. Pattern Entropy: variance of pattern states
    const patternEntropy = this.computePatternEntropy(input.patternState);

    // 2. Emergent Entropy: oscillation frequency
    const emergentEntropy = this.computeEmergentEntropy(input.emergentState);

    // 3. Memory Entropy: drift variance × Markov spread
    const memoryEntropy = this.computeMemoryEntropy(input.memoryDrift);

    // 4. Resonance Entropy: harmonic drift scatter
    const resonanceEntropy = this.computeResonanceEntropy(input.resonanceHDM);

    // 5. Coherence Entropy: PCM turbulence
    const coherenceEntropy = this.computeCoherenceEntropy(
      input.coherencePCM,
      input.coherenceState
    );

    // Overall entropy (weighted average)
    const entropy = (
      patternEntropy * 0.25 +
      emergentEntropy * 0.20 +
      memoryEntropy * 0.20 +
      resonanceEntropy * 0.20 +
      coherenceEntropy * 0.15
    );

    // System Stability Score
    const sss = this.computeSSS(entropy, input.coherencePCM, input.modulationIndex);

    // Damping factor based on entropy
    const dampingFactor = this.computeDampingFactor(entropy);

    // Classify entropy state
    const state = this.classifyEntropy(entropy);

    const data: EntropyData = {
      entropy,
      sss,
      state,
      patternEntropy,
      emergentEntropy,
      memoryEntropy,
      resonanceEntropy,
      coherenceEntropy,
      dampingFactor,
      timestamp,
    };

    this.lastData = data;
    this.emitUpdate(data);

    return data;
  }

  /**
   * Pattern Entropy: variance in pattern state history
   */
  private computePatternEntropy(patternState: PatternState): number {
    // Map pattern states to numeric values for variance computation
    const stateValue = this.patternStateToValue(patternState);
    
    // Store in history
    this.patternHistory[this.historyIndex] = stateValue;
    
    // Compute variance if history is filled
    if (!this.historyFilled && this.historyIndex === this.patternHistory.length - 1) {
      this.historyFilled = true;
    }
    
    if (this.historyFilled) {
      const variance = this.computeVariance(this.patternHistory);
      return Math.min(variance, 1.0); // Normalize to [0..1]
    }
    
    return 0;
  }

  /**
   * Emergent Entropy: oscillation in emergent state history
   */
  private computeEmergentEntropy(emergentState: EmergentState): number {
    const stateValue = this.emergentStateToValue(emergentState);
    
    this.emergentHistory[this.historyIndex] = stateValue;
    
    if (this.historyFilled) {
      // Count state transitions (oscillations)
      let transitions = 0;
      for (let i = 1; i < this.emergentHistory.length; i++) {
        if (this.emergentHistory[i] !== this.emergentHistory[i - 1]) {
          transitions++;
        }
      }
      return transitions / (this.emergentHistory.length - 1);
    }
    
    return 0;
  }

  /**
   * Memory Entropy: drift magnitude as entropy indicator
   */
  private computeMemoryEntropy(memoryDrift: number): number {
    // High drift = high entropy
    return Math.min(memoryDrift * 2.0, 1.0);
  }

  /**
   * Resonance Entropy: harmonic drift metric as entropy
   */
  private computeResonanceEntropy(resonanceHDM: number): number {
    // HDM directly represents harmonic scatter
    return Math.min(resonanceHDM * 1.5, 1.0);
  }

  /**
   * Coherence Entropy: PCM turbulence (inverse of coherence)
   */
  private computeCoherenceEntropy(pcm: number, coherenceState: CoherenceState): number {
    // Low PCM = high entropy
    let entropy = 1.0 - pcm;
    
    // Boost entropy for unstable coherence
    if (coherenceState === 'unstable') {
      entropy = Math.min(entropy * 1.5, 1.0);
    }
    
    return entropy;
  }

  /**
   * System Stability Score (SSS)
   * sss = (1 - entropy) × coherence × (1 - modulationIndex)
   */
  private computeSSS(entropy: number, coherencePCM: number, modulationIndex: number): number {
    return (1.0 - entropy) * coherencePCM * (1.0 - modulationIndex);
  }

  /**
   * Compute φ-based damping factor
   */
  private computeDampingFactor(entropy: number): number {
    if (entropy > 0.8) {
      return PHI_HARD_CLAMP; // φ^-2 = 0.382
    } else if (entropy > 0.6) {
      return PHI_DAMPING; // φ^-1 = 0.618
    }
    return 1.0; // No damping
  }

  /**
   * Classify entropy state
   */
  private classifyEntropy(entropy: number): EntropyState {
    if (entropy <= 0.30) return 'low';
    if (entropy <= 0.55) return 'moderate';
    if (entropy <= 0.75) return 'high';
    return 'critical';
  }

  /**
   * Map pattern state to numeric value for variance computation
   */
  private patternStateToValue(state: PatternState): number {
    switch (state) {
      case 'stable': return 0;
      case 'ascending': return 1;
      case 'descending': return 2;
      case 'volatile': return 3;
      case 'chaotic': return 4;
    }
  }

  /**
   * Map emergent state to numeric value
   */
  private emergentStateToValue(state: EmergentState): number {
    switch (state) {
      case 'coherent': return 0;
      case 'drifting': return 1;
      case 'cycling': return 2;
      case 'turbulent': return 3;
      case 'threshold-shift': return 4;
    }
  }

  /**
   * Compute variance of a numeric array
   */
  private computeVariance(arr: number[]): number {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
    return variance / 4.0; // Normalize by max variance (states 0-4, var max ~4)
  }

  /**
   * Advance history index (circular buffer)
   */
  advanceHistory(): void {
    this.historyIndex = (this.historyIndex + 1) % this.patternHistory.length;
  }

  /**
   * Subscribe to entropy updates
   */
  subscribe(listener: EntropyListener): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from entropy updates
   */
  unsubscribe(listener: EntropyListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Emit entropy update to all listeners
   */
  private emitUpdate(data: EntropyData): void {
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  /**
   * Get last computed entropy data
   */
  getLastData(): EntropyData | null {
    return this.lastData;
  }

  /**
   * Get current entropy value
   */
  getEntropy(): number {
    return this.lastData?.entropy ?? 0;
  }

  /**
   * Get current System Stability Score
   */
  getSSS(): number {
    return this.lastData?.sss ?? 1.0;
  }

  /**
   * Get current entropy state
   */
  getEntropyState(): EntropyState {
    return this.lastData?.state ?? 'low';
  }

  /**
   * Get current damping factor
   */
  getDampingFactor(): number {
    return this.lastData?.dampingFactor ?? 1.0;
  }
}

/**
 * Factory function to create entropy regulator
 */
export function createEntropyRegulator(): PhiEntropyRegulator {
  return new PhiEntropyRegulator();
}
