import { describe, it, expect } from 'vitest';
import {
  createRegressionShield,
  type Q8StateSnapshot,
} from './regression-shield';
import { createFrameSimulator } from './frame-simulator';
import { createStabilityCertifier } from './stability-certifier';

describe('Q8-RegShield', () => {
  describe('RegressionShield', () => {
    it('should record snapshots', () => {
      const shield = createRegressionShield();
      const snapshot: Q8StateSnapshot = {
        modulationState: 'balanced',
        modulationIndex: 0.5,
        phaseStability: 'stable',
        phasePSI: 0.8,
        entropyState: 'low',
        entropy: 0.2,
        sss: 0.7,
        globalState: 'stable',
        gsi: 0.75,
        timestamp: Date.now(),
      };

      shield.recordSnapshot(snapshot);
      expect(shield.getSnapshotCount()).toBe(1);
    });

    it('should validate consistent states', () => {
      const shield = createRegressionShield();
      const snapshot: Q8StateSnapshot = {
        modulationState: 'balanced',
        modulationIndex: 0.5,
        phaseStability: 'stable',
        phasePSI: 0.8,
        entropyState: 'low',
        entropy: 0.2,
        sss: 0.7,
        globalState: 'stable',
        gsi: 0.75,
        timestamp: Date.now(),
      };

      shield.recordSnapshot(snapshot);
      const result = shield.validateConsistency();
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid modulation index', () => {
      const shield = createRegressionShield();
      const snapshot: Q8StateSnapshot = {
        modulationState: 'balanced',
        modulationIndex: 1.5,
        phaseStability: 'stable',
        phasePSI: 0.8,
        entropyState: 'low',
        entropy: 0.2,
        sss: 0.7,
        globalState: 'stable',
        gsi: 0.75,
        timestamp: Date.now(),
      };

      shield.recordSnapshot(snapshot);
      const result = shield.validateConsistency();
      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should clear snapshots', () => {
      const shield = createRegressionShield();
      const snapshot: Q8StateSnapshot = {
        modulationState: 'balanced',
        modulationIndex: 0.5,
        phaseStability: 'stable',
        phasePSI: 0.8,
        entropyState: 'low',
        entropy: 0.2,
        sss: 0.7,
        globalState: 'stable',
        gsi: 0.75,
        timestamp: Date.now(),
      };

      shield.recordSnapshot(snapshot);
      shield.clear();
      expect(shield.getSnapshotCount()).toBe(0);
    });
  });

  describe('FrameSimulator', () => {
    it('should generate stable frames', () => {
      const simulator = createFrameSimulator();
      const frame = simulator.generateStableFrame();
      expect(frame.coherencePCM).toBeGreaterThan(0.8);
      expect(frame.resonanceBurst).toBe(false);
    });

    it('should generate turbulent frames', () => {
      const simulator = createFrameSimulator();
      const frame = simulator.generateTurbulentFrame();
      expect(frame.coherencePCM).toBeLessThan(0.5);
      expect(frame.resonanceBurst).toBe(true);
    });

    it('should convert frame to snapshot', () => {
      const simulator = createFrameSimulator();
      const frame = simulator.generateStableFrame();
      const snapshot = simulator.frameToSnapshot(frame, Date.now());

      expect(snapshot.gsi).toBeGreaterThanOrEqual(0);
      expect(snapshot.gsi).toBeLessThanOrEqual(1);
    });
  });

  describe('StabilityCertifier', () => {
    it('should certify stable snapshots', () => {
      const certifier = createStabilityCertifier();
      const snapshots: Q8StateSnapshot[] = Array(10)
        .fill(null)
        .map(() => ({
          modulationState: 'balanced',
          modulationIndex: 0.5,
          phaseStability: 'stable',
          phasePSI: 0.8,
          entropyState: 'low',
          entropy: 0.2,
          sss: 0.7,
          globalState: 'stable',
          gsi: 0.75,
          timestamp: Date.now(),
        }));

      const cert = certifier.certify(snapshots);
      expect(cert.passed).toBe(true);
      expect(cert.score).toBeGreaterThan(0.6);
    });

    it('should fail certification for critical snapshots', () => {
      const certifier = createStabilityCertifier();
      const snapshots: Q8StateSnapshot[] = Array(10)
        .fill(null)
        .map(() => ({
          modulationState: 'overloaded',
          modulationIndex: 0.9,
          phaseStability: 'critical',
          phasePSI: 0.2,
          entropyState: 'critical',
          entropy: 0.85,
          sss: 0.1,
          globalState: 'critical',
          gsi: 0.2,
          timestamp: Date.now(),
        }));

      const cert = certifier.certify(snapshots);
      expect(cert.passed).toBe(false);
    });

    it('should handle empty snapshots', () => {
      const certifier = createStabilityCertifier();
      const cert = certifier.certify([]);
      expect(cert.passed).toBe(false);
      expect(cert.score).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should validate simulated frames', () => {
      const simulator = createFrameSimulator();
      const shield = createRegressionShield();

      for (let i = 0; i < 20; i++) {
        const frame = simulator.generateStableFrame();
        const snapshot = simulator.frameToSnapshot(frame, Date.now() + i);
        shield.recordSnapshot(snapshot);
      }

      const result = shield.validateConsistency();
      expect(result.passed).toBe(true);
    });

    it('should certify simulated stability', () => {
      const simulator = createFrameSimulator();
      const certifier = createStabilityCertifier();

      const snapshots = Array(50)
        .fill(null)
        .map((_, i) => {
          const frame = simulator.generateStableFrame();
          return simulator.frameToSnapshot(frame, Date.now() + i);
        });

      const cert = certifier.certify(snapshots);
      expect(cert.passed).toBe(true);
      expect(cert.details.stableFrames).toBeGreaterThan(0);
    });

    it('should handle mixed stability scenarios', () => {
      const simulator = createFrameSimulator();
      const certifier = createStabilityCertifier();

      const snapshots = [];
      for (let i = 0; i < 30; i++) {
        const frame =
          i < 20
            ? simulator.generateStableFrame()
            : simulator.generateTurbulentFrame();
        snapshots.push(simulator.frameToSnapshot(frame, Date.now() + i));
      }

      const cert = certifier.certify(snapshots);
      expect(cert.details.stableFrames).toBeGreaterThan(0);
      expect(cert.details.criticalFrames).toBeGreaterThan(0);
    });
  });
});
