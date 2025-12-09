/**
 * Q8 Regression Shield - Validates Q8 state consistency without runtime hooks
 * 
 * This module provides testing infrastructure to validate that Q8 meta-control
 * layers maintain consistent behavior across various scenarios. It does NOT
 * integrate into the runtime system.
 */

export type ModulationState = 'calm' | 'balanced' | 'sensitive' | 'overloaded';
export type PhaseStability = 'stable' | 'semi-stable' | 'unstable' | 'critical';
export type EntropyState = 'low' | 'moderate' | 'high' | 'critical';
export type GlobalStabilityState =
  | 'hyper-stable'
  | 'stable'
  | 'tense'
  | 'unstable'
  | 'critical';

export interface Q8StateSnapshot {
  modulationState: ModulationState;
  modulationIndex: number;
  phaseStability: PhaseStability;
  phasePSI: number;
  entropyState: EntropyState;
  entropy: number;
  sss: number;
  globalState: GlobalStabilityState;
  gsi: number;
  timestamp: number;
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Q8RegressionShield - Validates Q8 layer consistency
 * 
 * This is a TESTING TOOL ONLY. It does not integrate into SurfaceRoot
 * or modify any runtime behavior.
 */
export class Q8RegressionShield {
  private snapshots: Q8StateSnapshot[] = [];

  /**
   * Record a Q8 state snapshot for validation
   */
  recordSnapshot(snapshot: Q8StateSnapshot): void {
    this.snapshots.push(snapshot);
  }

  /**
   * Validate state consistency
   */
  validateConsistency(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check modulation index range
    for (const snap of this.snapshots) {
      if (snap.modulationIndex < 0 || snap.modulationIndex > 1) {
        errors.push(
          `Modulation index out of range: ${snap.modulationIndex} at ${snap.timestamp}`
        );
      }
    }

    // Check PSI range
    for (const snap of this.snapshots) {
      if (snap.phasePSI < 0 || snap.phasePSI > 1) {
        errors.push(`PSI out of range: ${snap.phasePSI} at ${snap.timestamp}`);
      }
    }

    // Check entropy range
    for (const snap of this.snapshots) {
      if (snap.entropy < 0 || snap.entropy > 1) {
        errors.push(`Entropy out of range: ${snap.entropy} at ${snap.timestamp}`);
      }
    }

    // Check GSI range
    for (const snap of this.snapshots) {
      if (snap.gsi < 0 || snap.gsi > 1) {
        errors.push(`GSI out of range: ${snap.gsi} at ${snap.timestamp}`);
      }
    }

    // Check SSS range
    for (const snap of this.snapshots) {
      if (snap.sss < 0 || snap.sss > 1) {
        errors.push(`SSS out of range: ${snap.sss} at ${snap.timestamp}`);
      }
    }

    // Check state consistency
    for (const snap of this.snapshots) {
      if (snap.globalState === 'critical' && snap.gsi > 0.5) {
        warnings.push(
          `Critical state with high GSI (${snap.gsi}) at ${snap.timestamp}`
        );
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clear all recorded snapshots
   */
  clear(): void {
    this.snapshots = [];
  }

  /**
   * Get snapshot count
   */
  getSnapshotCount(): number {
    return this.snapshots.length;
  }
}

export function createRegressionShield(): Q8RegressionShield {
  return new Q8RegressionShield();
}
