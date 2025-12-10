/**
 * Φ-Phase Modulator (Q8.2)
 * 
 * Phase-shift governor that stabilizes and regulates phase relationships
 * across the Q7 interpretation stack. Prevents runaway oscillations and
 * harsh transitions during modulation-induced turbulence.
 * 
 * @tag q8.2-phase-modulator
 */

import type { WaveSignature } from '../signature-engine.js';
import type { ResonanceSpectrum } from '../resonance-engine.js';
import type { PhaseCoherenceMetric } from '../coherence-stabilizer.js';
import { PHI, PHI_INV } from '../types.js';

/**
 * Q8 Phase Modulator Version
 */
export const Q8_PHASE_VERSION = '8.2.0';

/**
 * Phase stability classification
 */
export type PhaseStability = 'stable' | 'semi-stable' | 'unstable' | 'critical';

/**
 * Phase modulator state data
 */
export interface PhaseModulatorState {
  /** Phase drift in radians (0..π) */
  drift: number;
  /** Phase Stability Index (0-1) */
  psi: number;
  /** Stability classification */
  stability: PhaseStability;
  /** Correction factor applied */
  correctionFactor: number;
  /** Timestamp of measurement */
  timestamp: number;
}

/**
 * Phase listener callback
 */
export type PhaseListener = (state: PhaseModulatorState) => void;

/**
 * Φ-Phase Modulator
 * 
 * Governs phase relationships between signature, resonance, and coherence layers.
 * Applies gentle φ-based corrections to prevent phase turbulence.
 */
export class PhiPhaseModulator {
  private currentState: PhaseModulatorState;
  private listeners: PhaseListener[] = [];
  private frameIndex = 0;

  constructor() {
    this.currentState = {
      drift: 0,
      psi: 1.0,
      stability: 'stable',
      correctionFactor: 1.0,
      timestamp: Date.now(),
    };
  }

  /**
   * Update phase state based on current system metrics
   */
  update(
    signature: WaveSignature | null,
    resonanceSpectrum: ResonanceSpectrum,
    coherencePCM: number,
    modulationIndex: number
  ): void {
    this.frameIndex++;

    // Compute phase drift
    const drift = this.computePhaseDrift(signature, resonanceSpectrum, coherencePCM);

    // Apply φ-phase correction
    const correctionFactor = this.computeCorrectionFactor(drift);

    // Compute Phase Stability Index
    const psi = this.computePSI(drift, modulationIndex, coherencePCM);

    // Classify stability
    const stability = this.classifyStability(psi);

    // Update state
    this.currentState = {
      drift,
      psi,
      stability,
      correctionFactor,
      timestamp: Date.now(),
    };

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Compute phase drift between signature, resonance harmonics, and coherence PCM
   * 
   * @returns Drift in radians (0..π)
   */
  private computePhaseDrift(
    signature: WaveSignature | null,
    resonanceSpectrum: ResonanceSpectrum,
    coherencePCM: number
  ): number {
    if (!signature) {
      return 0;
    }

    // Extract phase-like metrics from signature
    const signaturePhase = Math.atan2(signature.gradient, signature.amplitude);

    // Extract dominant harmonic phase from resonance spectrum
    // Use first amplitude harmonic as reference
    const resonancePhase = Math.atan2(
      resonanceSpectrum.amplitudeHarmonics[1] || 0,
      resonanceSpectrum.amplitudeHarmonics[0] || 1
    );

    // Coherence PCM acts as phase anchor (map 0-1 to 0-π)
    const coherencePhaseAnchor = coherencePCM * Math.PI;

    // Compute phase differences
    const signatureResonanceDiff = Math.abs(signaturePhase - resonancePhase);
    const coherenceDiff = Math.abs(signaturePhase - coherencePhaseAnchor);

    // Combine drifts (weighted average)
    const combinedDrift = (signatureResonanceDiff * 0.6 + coherenceDiff * 0.4);

    // Normalize to [0, π]
    return Math.min(combinedDrift, Math.PI);
  }

  /**
   * Compute φ-based correction factor based on drift magnitude
   * 
   * Applies gentle correction:
   * - small drift (<0.2π) → φ⁻¹ soft correction (0.618)
   * - mid drift (<0.5π) → φ-balanced correction (1.0)
   * - high drift (≥0.5π) → φ² stabilization clamp (2.618)
   */
  private computeCorrectionFactor(drift: number): number {
    const normalizedDrift = drift / Math.PI;

    if (normalizedDrift < 0.2) {
      // Small drift: soft correction
      return PHI_INV; // 0.618
    } else if (normalizedDrift < 0.5) {
      // Mid drift: balanced correction (interpolate between PHI_INV and PHI)
      const t = (normalizedDrift - 0.2) / 0.3;
      return PHI_INV + t * (PHI - PHI_INV);
    } else {
      // High drift: stabilization clamp
      return PHI * PHI; // 2.618
    }
  }

  /**
   * Compute Phase Stability Index (PSI)
   * 
   * Scalar value 0..1 computed from:
   * - drift (higher drift → lower PSI)
   * - modulation index (higher modulation → lower PSI)
   * - coherence state (higher coherence → higher PSI)
   */
  private computePSI(drift: number, modulationIndex: number, coherencePCM: number): number {
    const normalizedDrift = drift / Math.PI;

    // Drift contribution (inverted: high drift = low stability)
    const driftFactor = 1.0 - normalizedDrift;

    // Modulation contribution (inverted: high modulation = potential instability)
    const modulationFactor = 1.0 - modulationIndex * 0.5; // Scale down impact

    // Coherence contribution (direct: high coherence = high stability)
    const coherenceFactor = coherencePCM;

    // Weighted combination
    const psi = driftFactor * 0.4 + modulationFactor * 0.3 + coherenceFactor * 0.3;

    return Math.max(0, Math.min(1, psi));
  }

  /**
   * Classify stability based on PSI
   */
  private classifyStability(psi: number): PhaseStability {
    if (psi >= 0.8) return 'stable';
    if (psi >= 0.6) return 'semi-stable';
    if (psi >= 0.4) return 'unstable';
    return 'critical';
  }

  /**
   * Get current phase state
   */
  getPhaseState(): PhaseModulatorState {
    return { ...this.currentState };
  }

  /**
   * Get Phase Stability Index
   */
  getPSI(): number {
    return this.currentState.psi;
  }

  /**
   * Get phase drift
   */
  getDrift(): number {
    return this.currentState.drift;
  }

  /**
   * Get correction factor for modifying layer weights
   */
  getCorrectionFactor(): number {
    return this.currentState.correctionFactor;
  }

  /**
   * Subscribe to phase updates
   */
  subscribe(listener: PhaseListener): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from phase updates
   */
  unsubscribe(listener: PhaseListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }

  /**
   * Reset phase modulator state
   */
  reset(): void {
    this.currentState = {
      drift: 0,
      psi: 1.0,
      stability: 'stable',
      correctionFactor: 1.0,
      timestamp: Date.now(),
    };
    this.frameIndex = 0;
  }
}

/**
 * Factory function to create phase modulator
 */
export function createPhaseModulator(): PhiPhaseModulator {
  return new PhiPhaseModulator();
}
