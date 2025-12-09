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
 * - PhiPresetHotSwitch (Q7.1): Runtime preset switching
 * - WaveSignatureEngine (Q7.3): Wave signature computation
 * - PhiPatternClassifier (Q7.3-P): Core interpretation layer
 * - PhiEmergentEngine (Q7.4-E): Emergent behavior detection
 * 
 * ## Q7.4 Emergent Behavior Layer
 * 
 * The Emergent Engine represents the first emergence layer of the φ-wave system.
 * It detects macro-level wavefield behaviors that arise from pattern evolution
 * over time, rather than from single-frame analysis.
 * 
 * ### Emergent State Philosophy
 * 
 * While patterns (Q7.3-P) classify micro-states within individual frames,
 * emergent states capture the macro-behavior of the system as a whole:
 * 
 * - **Micro-patterns** (Q7.3-P): stable, ascending, descending, volatile, chaotic
 * - **Macro-patterns** (Q7.4-E): coherent, drifting, cycling, turbulent, threshold-shift
 * 
 * ### How Macro-Patterns Differ from Micro-Patterns
 * 
 * - **Micro-patterns** are instantaneous classifications based on current signature metrics
 * - **Macro-patterns** emerge from the interaction of micro-patterns across 40+ frames
 * - **Micro-patterns** detect local behavior (gradient, variance, trend)
 * - **Macro-patterns** detect global behavior (coherence, periodicity, regime shifts)
 * - **Micro-patterns** inform immediate control decisions
 * - **Macro-patterns** inform long-term adaptation and memory formation
 * 
 * This layered approach enables the system to exhibit both reactive (micro) and
 * adaptive (macro) behaviors, forming the foundation for Q7.5-A (Adaptive Memory)
 * and Q7.6-R (Resonance Engine).
 * 
 * @module phi-wave
 * @tag q7-integrated
 * @tag q7.1-preset-hotswitch
 * @tag q7.3-signature-engine
 * @tag q7.3-pattern-classifier
 * @tag q7.4-emergent
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
export { SurfaceRoot, createSurfaceRoot, Q7_VERSION } from './surface-root.js';

// Q7.1 - Preset HotSwitch
export type { PresetId, PresetConfig, PresetHotSwitchEvent, PresetSwitchListener } from './preset-hotswitch.js';
export { PhiPresetHotSwitch, createPresetHotSwitch, Q7_HOTSWITCH_VERSION } from './preset-hotswitch.js';

// Q7.3 - Signature Engine
export type { WaveSignature, SignatureOptions } from './signature-engine.js';
export { WaveSignatureEngine, createSignatureEngine, Q7_SIGNATURE_VERSION } from './signature-engine.js';

// Q7.3-P - Pattern Classifier
export type { PatternState, PatternClassification, PatternListener } from './pattern-classifier.js';
export { PhiPatternClassifier, createPatternClassifier, Q7_PATTERN_VERSION } from './pattern-classifier.js';

// Q7.4-E - Emergent Engine
export type { EmergentState, EmergentClassification, EmergentListener } from './emergent-engine.js';
export { PhiEmergentEngine, createEmergentEngine, Q7_EMERGENT_VERSION } from './emergent-engine.js';

// Demo
export { generateDemoHTML, getDemoConfig } from './phi-wave-demo.js';
