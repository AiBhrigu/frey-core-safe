/**
 * Φ-Modulation Core (Q8.1)
 * 
 * Dynamic weight modulation system for the Q7 interpretation layers.
 * Adjusts layer weights based on system stability and φ-attenuation curves.
 * 
 * @tag q8.1-mod-core
 */

import type { PatternClassification } from '../pattern-classifier.js';
import type { EmergentClassification } from '../emergent-engine.js';
import type { MemoryState } from '../adaptive-memory.js';
import type { ResonanceClassification } from '../resonance-engine.js';
import type { CoherenceState } from '../coherence-stabilizer.js';
import { PHI, PHI_INV } from '../types.js';

/**
 * Q8 Modulation Core Version
 */
export const Q8_MOD_CORE_VERSION = '8.1.0';

/**
 * Layer weights for Q7 stack
 */
export interface LayerWeights {
  /** Pattern classifier weight (0-1) */
  pattern: number;
  /** Emergent engine weight (0-1) */
  emergent: number;
  /** Adaptive memory weight (0-1) */
  memory: number;
  /** Resonance engine weight (0-1) */
  resonance: number;
  /** Coherence stabilizer weight (0-1) */
  coherence: number;
}

/**
 * Modulation state classification
 */
export type ModulationState = 'calm' | 'balanced' | 'sensitive' | 'overloaded';

/**
 * Modulation data
 */
export interface ModulationData {
  /** Current layer weights */
  weights: LayerWeights;
  /** Modulation index (0-1) */
  modulationIndex: number;
  /** Current modulation state */
  state: ModulationState;
  /** φ-attenuation factor applied */
  phiAttenuation: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Modulation listener callback
 */
export type ModulationListener = (data: ModulationData) => void;

/**
 * Modulation configuration
 */
interface ModulationConfig {
  /** Base weight for all layers (default: 1.0) */
  baseWeight: number;
  /** φ-soften factor (0.618) */
  phiSoften: number;
  /** φ-boost factor (1.618) */
  phiBoost: number;
  /** Sensitivity threshold for modulation */
  sensitivityThreshold: number;
  /** Overload threshold */
  overloadThreshold: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ModulationConfig = {
  baseWeight: 1.0,
  phiSoften: PHI_INV,     // 0.618...
  phiBoost: PHI,          // 1.618...
  sensitivityThreshold: 0.6,
  overloadThreshold: 0.85,
};

/**
 * Q7 combined state for modulation
 */
export interface Q7CombinedState {
  pattern: PatternClassification | null;
  emergent: EmergentClassification | null;
  memory: MemoryState | null;
  resonance: ResonanceClassification | null;
  coherence: CoherenceState | null;
}

/**
 * Φ-Modulation Core class
 * 
 * Dynamically adjusts Q7 layer weights based on system stability:
 * - Uses φ-attenuation curve (0.618 soften, 1.618 boost)
 * - Reacts to coherence, memory drift, and resonance bursts
 * - Provides modulation index (0-1) indicating system load
 * - Classifies state: calm, balanced, sensitive, overloaded
 */
export class PhiModulationCore {
  private readonly config: ModulationConfig;
  
  // Current weights (initialized to base)
  private currentWeights: LayerWeights = {
    pattern: 1.0,
    emergent: 1.0,
    memory: 1.0,
    resonance: 1.0,
    coherence: 1.0,
  };
  
  // Modulation index tracking
  private modulationIndex: number = 0.5;
  
  // Current state
  private currentState: ModulationState = 'balanced';
  
  // φ-attenuation factor
  private phiAttenuation: number = 1.0;
  
  // Event listeners
  private listeners: ModulationListener[] = [];
  
  // Frame counter
  private frameCount: number = 0;
  
  constructor(config: Partial<ModulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Process Q7 combined state and compute modulation
   */
  process(state: Q7CombinedState): ModulationData {
    this.frameCount++;
    const timestamp = performance.now();
    
    // 1. Compute modulation index from system state
    this.modulationIndex = this.computeModulationIndex(state);
    
    // 2. Determine modulation state
    this.currentState = this.classifyModulationState(this.modulationIndex);
    
    // 3. Compute φ-attenuation factor
    this.phiAttenuation = this.computePhiAttenuation(state);
    
    // 4. Update layer weights based on stability
    this.updateWeights(state);
    
    // 5. Build modulation data
    const data: ModulationData = {
      weights: { ...this.currentWeights },
      modulationIndex: this.modulationIndex,
      state: this.currentState,
      phiAttenuation: this.phiAttenuation,
      timestamp,
    };
    
    // 6. Emit event
    this.emitModulation(data);
    
    return data;
  }
  
  /**
   * Compute modulation index (0-1) from system state
   * Higher index = more system stress/instability
   */
  private computeModulationIndex(state: Q7CombinedState): number {
    let index = 0.0;
    let factors = 0;
    
    // Coherence contribution (inverted - low coherence = high index)
    if (state.coherence) {
      const coherenceScore = state.coherence.pcm.value;
      index += 1.0 - coherenceScore; // Invert: low coherence → high stress
      factors++;
    }
    
    // Memory drift contribution
    if (state.memory) {
      const drift = state.memory.metrics.memoryDriftIndex;
      index += Math.min(drift * 2, 1.0); // Scale drift to 0-1
      factors++;
    }
    
    // Resonance burst contribution
    if (state.resonance && state.resonance.state === 'resonance-burst') {
      index += 0.8; // Burst adds significant stress
      factors++;
    }
    
    // Pattern volatility contribution
    if (state.pattern) {
      const volatile = state.pattern.state === 'volatile' || state.pattern.state === 'chaotic';
      if (volatile) {
        index += 0.6;
        factors++;
      }
    }
    
    // Emergent turbulence contribution
    if (state.emergent && state.emergent.state === 'turbulent') {
      index += 0.7;
      factors++;
    }
    
    // Average the contributions
    return factors > 0 ? Math.min(index / factors, 1.0) : 0.5;
  }
  
  /**
   * Classify modulation state based on index
   */
  private classifyModulationState(index: number): ModulationState {
    if (index < 0.3) {
      return 'calm';
    } else if (index < this.config.sensitivityThreshold) {
      return 'balanced';
    } else if (index < this.config.overloadThreshold) {
      return 'sensitive';
    } else {
      return 'overloaded';
    }
  }
  
  /**
   * Compute φ-attenuation factor based on system stability
   */
  private computePhiAttenuation(state: Q7CombinedState): number {
    // Start with neutral
    let attenuation = 1.0;
    
    // Check coherence - low coherence → soften
    if (state.coherence && state.coherence.pcm.value < 0.5) {
      attenuation *= this.config.phiSoften; // 0.618
    }
    
    // Check for resonance collapse → soften significantly
    if (state.resonance && state.resonance.state === 'resonance-collapse') {
      attenuation *= this.config.phiSoften;
    }
    
    // Check for stable harmonic → boost slightly
    if (state.resonance && state.resonance.state === 'harmonic-stable') {
      attenuation *= this.config.phiBoost; // 1.618
    }
    
    // Clamp to reasonable range
    return Math.max(0.3, Math.min(attenuation, 2.0));
  }
  
  /**
   * Update layer weights based on system state
   */
  private updateWeights(state: Q7CombinedState): void {
    const base = this.config.baseWeight;
    
    // Apply φ-attenuation as base multiplier
    const attenuatedBase = base * this.phiAttenuation;
    
    // Pattern weight - boost if stable, reduce if chaotic
    if (state.pattern) {
      if (state.pattern.state === 'stable') {
        this.currentWeights.pattern = attenuatedBase * this.config.phiBoost;
      } else if (state.pattern.state === 'chaotic') {
        this.currentWeights.pattern = attenuatedBase * this.config.phiSoften;
      } else {
        this.currentWeights.pattern = attenuatedBase;
      }
    }
    
    // Emergent weight - boost if coherent, reduce if turbulent
    if (state.emergent) {
      if (state.emergent.state === 'coherent') {
        this.currentWeights.emergent = attenuatedBase * this.config.phiBoost;
      } else if (state.emergent.state === 'turbulent') {
        this.currentWeights.emergent = attenuatedBase * this.config.phiSoften;
      } else {
        this.currentWeights.emergent = attenuatedBase;
      }
    }
    
    // Memory weight - reduce if high drift
    if (state.memory) {
      if (state.memory.metrics.memoryDriftIndex > 0.2) {
        this.currentWeights.memory = attenuatedBase * this.config.phiSoften;
      } else {
        this.currentWeights.memory = attenuatedBase;
      }
    }
    
    // Resonance weight - modulate based on state
    if (state.resonance) {
      if (state.resonance.state === 'harmonic-stable') {
        this.currentWeights.resonance = attenuatedBase * this.config.phiBoost;
      } else if (state.resonance.state === 'resonance-burst' || 
                 state.resonance.state === 'resonance-collapse') {
        this.currentWeights.resonance = attenuatedBase * this.config.phiSoften;
      } else {
        this.currentWeights.resonance = attenuatedBase;
      }
    }
    
    // Coherence weight - boost when coherence is high
    if (state.coherence) {
      if (state.coherence.coherence === 'high') {
        this.currentWeights.coherence = attenuatedBase * this.config.phiBoost;
      } else if (state.coherence.coherence === 'unstable') {
        this.currentWeights.coherence = attenuatedBase * this.config.phiSoften;
      } else {
        this.currentWeights.coherence = attenuatedBase;
      }
    }
    
    // Normalize weights to prevent drift
    this.normalizeWeights();
  }
  
  /**
   * Normalize weights to maintain system energy
   */
  private normalizeWeights(): void {
    const sum = this.currentWeights.pattern +
                this.currentWeights.emergent +
                this.currentWeights.memory +
                this.currentWeights.resonance +
                this.currentWeights.coherence;
    
    if (sum > 0) {
      const scale = 5.0 / sum; // 5 layers with average weight 1.0
      this.currentWeights.pattern *= scale;
      this.currentWeights.emergent *= scale;
      this.currentWeights.memory *= scale;
      this.currentWeights.resonance *= scale;
      this.currentWeights.coherence *= scale;
    }
  }
  
  /**
   * Get current layer weights
   */
  getWeights(): LayerWeights {
    return { ...this.currentWeights };
  }
  
  /**
   * Get modulation index
   */
  getModulationIndex(): number {
    return this.modulationIndex;
  }
  
  /**
   * Get current modulation state
   */
  getState(): ModulationState {
    return this.currentState;
  }
  
  /**
   * Get φ-attenuation factor
   */
  getPhiAttenuation(): number {
    return this.phiAttenuation;
  }
  
  /**
   * Subscribe to modulation updates
   */
  subscribe(listener: ModulationListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Emit modulation event
   */
  private emitModulation(data: ModulationData): void {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}

/**
 * Create a new modulation core instance
 */
export function createModulationCore(config?: Partial<ModulationConfig>): PhiModulationCore {
  return new PhiModulationCore(config);
}
