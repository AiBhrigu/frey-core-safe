/**
 * Frame Simulator - Simulates Q7/Q8 frames for testing
 * 
 * This module simulates wavefield frames to test Q8 behavior without
 * requiring a full SurfaceRoot instance. Testing infrastructure only.
 */

import type { Q8StateSnapshot } from './regression-shield.js';

export interface SimulatedFrame {
  coherencePCM: number;
  memoryDrift: number;
  resonanceBurst: boolean;
  patternChaotic: boolean;
  emergentTurbulent: boolean;
}

/**
 * FrameSimulator - Generates synthetic Q7/Q8 frames for testing
 * 
 * This is a TESTING TOOL ONLY.
 */
export class FrameSimulator {
  /**
   * Generate a stable frame
   */
  generateStableFrame(): SimulatedFrame {
    return {
      coherencePCM: 0.9,
      memoryDrift: 0.05,
      resonanceBurst: false,
      patternChaotic: false,
      emergentTurbulent: false,
    };
  }

  /**
   * Generate a turbulent frame
   */
  generateTurbulentFrame(): SimulatedFrame {
    return {
      coherencePCM: 0.3,
      memoryDrift: 0.4,
      resonanceBurst: true,
      patternChaotic: true,
      emergentTurbulent: true,
    };
  }

  /**
   * Generate a random frame
   */
  generateRandomFrame(): SimulatedFrame {
    return {
      coherencePCM: Math.random(),
      memoryDrift: Math.random() * 0.5,
      resonanceBurst: Math.random() > 0.7,
      patternChaotic: Math.random() > 0.8,
      emergentTurbulent: Math.random() > 0.75,
    };
  }

  /**
   * Convert simulated frame to Q8 snapshot approximation
   */
  frameToSnapshot(frame: SimulatedFrame, timestamp: number): Q8StateSnapshot {
    // Approximate Q8 metrics from frame data
    const modulationIndex = frame.patternChaotic
      ? 0.8
      : frame.emergentTurbulent
        ? 0.6
        : 0.3;

    const phasePSI = frame.coherencePCM * (1 - modulationIndex * 0.5);
    const entropy = frame.memoryDrift * 1.5 + (frame.resonanceBurst ? 0.3 : 0);
    const sss = (1 - entropy) * frame.coherencePCM * (1 - modulationIndex);
    const gsi = frame.coherencePCM * 0.5 + sss * 0.3 + phasePSI * 0.2;

    // Determine states
    const modulationState =
      modulationIndex > 0.85
        ? 'overloaded'
        : modulationIndex > 0.6
          ? 'sensitive'
          : modulationIndex > 0.3
            ? 'balanced'
            : 'calm';

    const phaseStability =
      phasePSI > 0.8
        ? 'stable'
        : phasePSI > 0.6
          ? 'semi-stable'
          : phasePSI > 0.4
            ? 'unstable'
            : 'critical';

    const entropyState =
      entropy <= 0.3
        ? 'low'
        : entropy <= 0.55
          ? 'moderate'
          : entropy <= 0.75
            ? 'high'
            : 'critical';

    const globalState =
      gsi > 0.85
        ? 'hyper-stable'
        : gsi > 0.7
          ? 'stable'
          : gsi > 0.5
            ? 'tense'
            : gsi > 0.3
              ? 'unstable'
              : 'critical';

    return {
      modulationState,
      modulationIndex,
      phaseStability,
      phasePSI,
      entropyState,
      entropy: Math.min(1, entropy),
      sss: Math.max(0, Math.min(1, sss)),
      globalState,
      gsi: Math.max(0, Math.min(1, gsi)),
      timestamp,
    };
  }
}

export function createFrameSimulator(): FrameSimulator {
  return new FrameSimulator();
}
