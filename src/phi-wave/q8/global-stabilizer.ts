/**
 * Q8.4 — Φ-Global Stabilizer (Φ-GS)
 * 
 * Final Q8 meta-control layer unifying all Q7 and Q8 outputs into a global
 * stability framework. Computes system-wide stability metrics and applies
 * φ-based corrections to maintain coherent operation under all load conditions.
 * 
 * Version: 8.4.0
 */

import { PHI, PHI_INV } from '../types.js';
import type { PatternState, PatternClassification } from '../pattern-classifier.js';
import type { EmergentState, EmergentData } from '../emergent-engine.js';
import type { MemoryState } from '../adaptive-memory.js';
import type { ResonanceState, ResonanceSpectrum } from '../resonance-engine.js';
import type { CoherenceState } from '../coherence-stabilizer.js';
import type { ModulationState } from './modulation-core.js';
import type { PhaseModulatorState } from './phase-modulator.js';
import type { EntropyState } from './entropy-regulator.js';

/** Q8.4 Global Stabilizer version */
export const Q8_GLOBAL_VERSION = '8.4.0';

/**
 * Global stability classification
 */
export type GlobalStabilityState =
  | 'hyper-stable'
  | 'stable'
  | 'tense'
  | 'unstable'
  | 'critical';

/**
 * Global Drift Vector representing system-wide directional instability
 */
export interface GlobalDriftVector {
  /** X component (horizontal drift) */
  x: number;
  /** Y component (vertical drift) */
  y: number;
  /** Magnitude (0-1) */
  magnitude: number;
  /** Angle (radians) */
  angle: number;
}

/**
 * Complete Q7 state snapshot
 */
export interface Q7State {
  pattern: PatternClassification | null;
  emergent: EmergentData | null;
  memory: MemoryState | null;
  resonance: ResonanceSpectrum | null;
  coherence: { state: CoherenceState; pcm: number; smoothedAmplitude: number } | null;
}

/**
 * Complete Q8 state snapshot
 */
export interface Q8State {
  modulation: { state: ModulationState; index: number } | null;
  phase: { state: PhaseModulatorState; psi: number; drift: number } | null;
  entropy: { state: EntropyState; entropy: number; sss: number } | null;
}

/**
 * Global stabilizer data snapshot
 */
export interface GlobalStabilizerData {
  /** Global Stability Index (0-1) */
  gsi: number;
  /** Global Drift Vector */
  gdv: GlobalDriftVector;
  /** Global Harmonic Pressure (0-1) */
  ghp: number;
  /** Current global state */
  state: GlobalStabilityState;
  /** Timestamp */
  timestamp: number;
  /** φ-stabilization factor applied to modulation */
  modulationStabilization: number;
  /** φ-stabilization factor applied to phase */
  phaseStabilization: number;
}

/**
 * Global stabilizer listener
 */
export type GlobalStabilizerListener = (data: GlobalStabilizerData) => void;

/**
 * Φ-Global Stabilizer
 * 
 * Unifies all Q7 and Q8 layer outputs into comprehensive global stability metrics.
 * Applies φ-based stabilization to modulation and phase controllers when needed.
 */
export class PhiGlobalStabilizer {
  private q7State: Q7State = {
    pattern: null,
    emergent: null,
    memory: null,
    resonance: null,
    coherence: null,
  };

  private q8State: Q8State = {
    modulation: null,
    phase: null,
    entropy: null,
  };

  private gsi: number = 1.0; // Global Stability Index
  private gdv: GlobalDriftVector = { x: 0, y: 0, magnitude: 0, angle: 0 };
  private ghp: number = 0.0; // Global Harmonic Pressure
  private currentState: GlobalStabilityState = 'hyper-stable';
  private modulationStabilization: number = 1.0;
  private phaseStabilization: number = 1.0;

  private listeners: GlobalStabilizerListener[] = [];

  /**
   * Update with Q7 state snapshot
   */
  updateQ7State(state: Q7State): void {
    this.q7State = state;
  }

  /**
   * Update with Q8 state snapshot
   */
  updateQ8State(state: Q8State): void {
    this.q8State = state;
  }

  /**
   * Compute global stability metrics
   */
  compute(): void {
    // Compute Global Stability Index (GSI)
    this.gsi = this.computeGSI();

    // Compute Global Drift Vector (GDV)
    this.gdv = this.computeGDV();

    // Compute Global Harmonic Pressure (GHP)
    this.ghp = this.computeGHP();

    // Classify global state
    this.currentState = this.classifyGlobalState();

    // Apply φ-stabilization
    this.applyStabilization();

    // Emit update event
    this.emitUpdate();
  }

  /**
   * Compute Global Stability Index
   * 
   * Combines coherence, entropy SSS, modulation index, and phase PSI
   */
  private computeGSI(): number {
    const coherenceFactor = this.q7State.coherence?.pcm ?? 0.5;
    const sssFactor = this.q8State.entropy?.sss ?? 0.5;
    const modulationStress = 1 - (this.q8State.modulation?.index ?? 0.5);
    const phaseFactor = this.q8State.phase?.psi ?? 0.5;

    // Weight factors using φ-ratios
    const weights = {
      coherence: PHI_INV, // 0.618
      sss: 1.0,
      modulation: PHI_INV,
      phase: PHI_INV,
    };

    const totalWeight = weights.coherence + weights.sss + weights.modulation + weights.phase;

    const gsi =
      (coherenceFactor * weights.coherence +
        sssFactor * weights.sss +
        modulationStress * weights.modulation +
        phaseFactor * weights.phase) /
      totalWeight;

    return Math.max(0, Math.min(1, gsi));
  }

  /**
   * Compute Global Drift Vector
   * 
   * Synthesizes drift from memory, resonance, and phase components
   */
  private computeGDV(): GlobalDriftVector {
    const memoryDrift = this.q7State.memory?.metrics.mdi ?? 0;
    const resonanceDrift = this.q7State.resonance?.hdm ?? 0;
    const phaseDrift = this.q8State.phase?.drift ?? 0;

    // Map drifts to x/y components (memory→x, resonance→y, phase affects both)
    const x = memoryDrift * 0.7 + (phaseDrift / Math.PI) * 0.3;
    const y = resonanceDrift * 0.7 + (phaseDrift / Math.PI) * 0.3;

    const magnitude = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    return { x, y, magnitude, angle };
  }

  /**
   * Compute Global Harmonic Pressure
   * 
   * Measures stress from resonance burst activity and harmonic instability
   */
  private computeGHP(): number {
    const resonanceState = this.q7State.resonance;
    if (!resonanceState) return 0;

    // Resonance burst adds significant pressure
    const burstFactor = resonanceState.state === 'resonance-burst' ? 0.8 : 0;

    // Collapsing harmonics add critical pressure
    const collapseFactor = resonanceState.state === 'resonance-collapse' ? 1.0 : 0;

    // Rising harmonics add moderate pressure
    const risingFactor = resonanceState.state === 'harmonic-rising' ? 0.4 : 0;

    // HDM contributes to background pressure
    const hdmFactor = Math.min(1, resonanceState.hdm * 0.5);

    // Combine factors
    const ghp = Math.max(burstFactor, collapseFactor, risingFactor, hdmFactor);

    return Math.max(0, Math.min(1, ghp));
  }

  /**
   * Classify global stability state
   */
  private classifyGlobalState(): GlobalStabilityState {
    if (this.gsi >= 0.85 && this.ghp < 0.2 && this.gdv.magnitude < 0.15) {
      return 'hyper-stable';
    }
    if (this.gsi >= 0.7 && this.ghp < 0.4 && this.gdv.magnitude < 0.3) {
      return 'stable';
    }
    if (this.gsi >= 0.5 && this.ghp < 0.6 && this.gdv.magnitude < 0.5) {
      return 'tense';
    }
    if (this.gsi >= 0.3) {
      return 'unstable';
    }
    return 'critical';
  }

  /**
   * Apply φ-stabilization to modulation and phase
   */
  private applyStabilization(): void {
    // φ-stabilization based on global state
    switch (this.currentState) {
      case 'hyper-stable':
        this.modulationStabilization = 1.0;
        this.phaseStabilization = 1.0;
        break;
      case 'stable':
        this.modulationStabilization = 1.0;
        this.phaseStabilization = 1.0;
        break;
      case 'tense':
        // Apply gentle φ⁻¹ stabilization
        this.modulationStabilization = PHI_INV; // 0.618
        this.phaseStabilization = PHI_INV;
        break;
      case 'unstable':
        // Apply stronger φ⁻² stabilization
        this.modulationStabilization = PHI_INV * PHI_INV; // 0.382
        this.phaseStabilization = PHI_INV;
        break;
      case 'critical':
        // Apply maximum φ⁻³ stabilization
        this.modulationStabilization = PHI_INV * PHI_INV * PHI_INV; // 0.236
        this.phaseStabilization = PHI_INV * PHI_INV;
        break;
    }

    // Additional smoothing for high harmonic pressure
    if (this.ghp > 0.6) {
      this.modulationStabilization *= PHI_INV;
    }

    // Additional correction for high drift
    if (this.gdv.magnitude > 0.4) {
      this.phaseStabilization *= PHI_INV;
    }
  }

  /**
   * Emit update event to listeners
   */
  private emitUpdate(): void {
    const data: GlobalStabilizerData = {
      gsi: this.gsi,
      gdv: this.gdv,
      ghp: this.ghp,
      state: this.currentState,
      timestamp: Date.now(),
      modulationStabilization: this.modulationStabilization,
      phaseStabilization: this.phaseStabilization,
    };

    for (const listener of this.listeners) {
      listener(data);
    }
  }

  /**
   * Subscribe to global stabilizer updates
   */
  subscribe(listener: GlobalStabilizerListener): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from global stabilizer updates
   */
  unsubscribe(listener: GlobalStabilizerListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get current global state
   */
  getGlobalState(): GlobalStabilizerData {
    return {
      gsi: this.gsi,
      gdv: this.gdv,
      ghp: this.ghp,
      state: this.currentState,
      timestamp: Date.now(),
      modulationStabilization: this.modulationStabilization,
      phaseStabilization: this.phaseStabilization,
    };
  }

  /**
   * Get Global Stability Index
   */
  getGSI(): number {
    return this.gsi;
  }

  /**
   * Get Global Drift Vector
   */
  getGDV(): GlobalDriftVector {
    return { ...this.gdv };
  }

  /**
   * Get Global Harmonic Pressure
   */
  getGHP(): number {
    return this.ghp;
  }

  /**
   * Get modulation stabilization factor
   */
  getModulationStabilization(): number {
    return this.modulationStabilization;
  }

  /**
   * Get phase stabilization factor
   */
  getPhaseStabilization(): number {
    return this.phaseStabilization;
  }
}

/**
 * Create a new global stabilizer instance
 */
export function createGlobalStabilizer(): PhiGlobalStabilizer {
  return new PhiGlobalStabilizer();
}
