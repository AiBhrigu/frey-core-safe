/**
 * Stability Certifier - Certifies system stability across scenarios
 * 
 * This module certifies that the Q8 meta-control system maintains stability
 * across various load conditions. Testing infrastructure only.
 */

import type { Q8StateSnapshot } from './regression-shield.js';

export interface StabilityCertification {
  passed: boolean;
  score: number;
  details: {
    stableFrames: number;
    unstableFrames: number;
    criticalFrames: number;
    averageGSI: number;
    averageSSS: number;
  };
}

/**
 * StabilityCertifier - Certifies Q8 stability
 * 
 * This is a TESTING TOOL ONLY.
 */
export class StabilityCertifier {
  /**
   * Certify stability across snapshots
   */
  certify(snapshots: Q8StateSnapshot[]): StabilityCertification {
    if (snapshots.length === 0) {
      return {
        passed: false,
        score: 0,
        details: {
          stableFrames: 0,
          unstableFrames: 0,
          criticalFrames: 0,
          averageGSI: 0,
          averageSSS: 0,
        },
      };
    }

    let stableFrames = 0;
    let unstableFrames = 0;
    let criticalFrames = 0;
    let totalGSI = 0;
    let totalSSS = 0;

    for (const snap of snapshots) {
      if (
        snap.globalState === 'hyper-stable' ||
        snap.globalState === 'stable'
      ) {
        stableFrames++;
      } else if (snap.globalState === 'critical') {
        criticalFrames++;
      } else {
        unstableFrames++;
      }

      totalGSI += snap.gsi;
      totalSSS += snap.sss;
    }

    const averageGSI = totalGSI / snapshots.length;
    const averageSSS = totalSSS / snapshots.length;

    // Calculate stability score
    const stableRatio = stableFrames / snapshots.length;
    const criticalRatio = criticalFrames / snapshots.length;
    const score =
      stableRatio * 0.4 +
      averageGSI * 0.3 +
      averageSSS * 0.2 +
      (1 - criticalRatio) * 0.1;

    // Pass if score > 0.6 and critical frames < 20%
    const passed = score > 0.6 && criticalRatio < 0.2;

    return {
      passed,
      score,
      details: {
        stableFrames,
        unstableFrames,
        criticalFrames,
        averageGSI,
        averageSSS,
      },
    };
  }
}

export function createStabilityCertifier(): StabilityCertifier {
  return new StabilityCertifier();
}
