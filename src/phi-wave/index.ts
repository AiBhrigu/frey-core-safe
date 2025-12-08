/**
 * Φ-Harmonic Wavefield Engine (v5.0)
 * 
 * A zero-GC render system using golden ratio (φ) based harmonics
 * for natural wave pattern generation and visualization.
 * 
 * Components:
 * - WaveKernel: Core wave computation engine
 * - PhiHarmonicMap: Harmonic frequency mapping based on φ
 * - WaveFieldRenderer: Zero-GC canvas renderer
 * - WaveLayer: Layer composition system
 * - PhiSyncBus: Event synchronization bus
 * - AmplitudeController: Amplitude control with envelope
 * - PhaseController: Phase control with φ-sync
 * - SurfaceRoot: Main orchestrator
 * 
 * @module phi-wave
 */

// Types
export type {
  Vec2,
  WavePoint,
  WaveLayerConfig,
  WaveKernelConfig,
  PhiHarmonic,
  WaveFrameData,
  SyncEvent,
  SyncListener,
  ControllerRange,
  AmplitudeState,
  PhaseState,
  SurfaceRootConfig,
  RendererOptions,
  PhiWaveDemoConfig,
} from './types.js';

export { PHI, PHI_INV, PHI_ANGLE } from './types.js';

// PhiHarmonicMap
export { PhiHarmonicMap, createPhiHarmonicMap } from './phi-harmonic-map.js';

// WaveKernel
export { WaveKernel, createWaveKernel } from './wave-kernel.js';

// WaveLayer
export { WaveLayer, createWaveLayer, createPhiLayerStack } from './wave-layer.js';

// PhiSyncBus
export { PhiSyncBus, createPhiSyncBus } from './phi-sync-bus.js';

// AmplitudeController
export { AmplitudeController, createAmplitudeController } from './amplitude-controller.js';

// PhaseController
export { PhaseController, createPhaseController } from './phase-controller.js';

// WaveFieldRenderer
export { WaveFieldRenderer, createWaveFieldRenderer } from './wave-field-renderer.js';

// SurfaceRoot
export { SurfaceRoot, createSurfaceRoot } from './surface-root.js';

// Demo
export { generateDemoHTML, getDemoConfig } from './phi-wave-demo.js';
