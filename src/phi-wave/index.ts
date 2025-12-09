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
 * - PhiAdaptiveMemory (Q7.5-A): Adaptive memory engine
 * - PhiResonanceEngine (Q7.6-R): Resonance spectrum extraction
 * - PhiCoherenceStabilizer (Q7.7): Coherence stabilization layer
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
 * ## Q7.5 Adaptive Memory Layer
 * 
 * The Adaptive Memory Engine introduces a temporal memory layer with three levels:
 * 
 * - **L0 (Frame Memory)**: Short-term ring buffer of last 60 emergent states
 * - **L1 (Pattern Memory)**: Mid-term storage of last 200 pattern classifications
 * - **L2 (Context Memory)**: Event memory tracking last 20 systemic events
 * 
 * ### Memory Architecture
 * 
 * The three-layer stack provides:
 * 
 * 1. **Temporal continuity** - L0 tracks recent emergent state evolution
 * 2. **Predictive capability** - L1 builds Markov transition matrix for next-state prediction
 * 3. **Contextual awareness** - L2 correlates patterns with system events (preset switches, spikes, etc.)
 * 
 * ### Key Metrics
 * 
 * - **Memory Drift Index (MDI)**: Longitudinal drift of emergent states
 * - **Predictive Gradient Index (PGI)**: Derived from frequency matrix and variance trend
 * - **Stability Window**: Local stability vs long-term drift comparison
 * - **Predicted Emergent State**: Markov-based next-state prediction
 * 
 * This memory layer powers future modules: predictive behavior, coherent state evolution,
 * resonance modeling (Q7.6), and conversational memory for the Frey voice/semantic layer.
 * 
 * ## Q7.6 Resonance Engine Layer
 * 
 * The Resonance Engine extracts harmonic, subharmonic, and emergent resonance signatures
 * from the complete Q7 stack (signature → pattern → emergent → memory).
 * 
 * ### Resonance Spectrum Extraction
 * 
 * Computes three types of harmonic projections:
 * 
 * - **Amplitude Harmonics** (H1..H7): φ-weighted amplitude sampling at harmonic intervals
 * - **Gradient Harmonics** (H1..H7): φ^n scaling of gradient signatures
 * - **Lambda Harmonics** (λH1..λH7): λ^n projections where λ = φ² - 1 ≈ 1.618
 * 
 * ### Key Metrics
 * 
 * - **Resonance Stability Index (RSI)**: Composite measure of φ-consistency, spectral stability, and memory weight
 * - **Harmonic Drift Metric (HDM)**: Long-term drift of resonance peaks weighted by Markov transitions
 * - **Resonance State**: 5-state classification (harmonic-stable/rising/falling, resonance-burst/collapse)
 * 
 * ### Integration Philosophy
 * 
 * While patterns (Q7.3-P) detect micro-states and emergence (Q7.4-E) detects macro-behaviors,
 * resonance (Q7.6-R) captures the spectral signature of the wavefield's φ-harmonic structure.
 * This enables detection of resonance phenomena that emerge from the interaction of all
 * system layers, forming the foundation for coherent state evolution and adaptive tuning.
 * 
 * ## Q7.7 Coherence Stabilizer Layer
 * 
 * The Coherence Stabilizer is the final Q7 module that introduces a stabilizing coherence
 * layer between Pattern → Emergent → Memory → Resonance to reduce phase-shifts and
 * unstable harmonic jumps.
 * 
 * ### Purpose
 * 
 * Reduces instability when:
 * - Preset switches occur
 * - Resonance bursts appear
 * - Memory drift spikes
 * - Emergent states oscillate too fast
 * 
 * ### Key Features
 * 
 * 1. **Stability Envelope**: Smooths amplitude and gradient over last 5 signatures with
 *    φ-attenuation for extreme variance
 * 2. **Phase Coherence Metric (PCM)**: Computes alignment between pattern/emergent/resonance
 *    layers (range: 0..1)
 * 3. **Drift Dampening**: Detects when memory drift exceeds threshold and applies φ^-1
 *    dampening for 3 frames
 * 4. **Burst Softening**: Reduces resonance-burst impact on emergent state by φ^-1 factor
 * 
 * ### Coherence States
 * 
 * - **high**: PCM ≥ 0.8 (excellent layer alignment)
 * - **medium**: PCM ≥ 0.6 (good alignment)
 * - **low**: PCM ≥ 0.4 (marginal alignment)
 * - **unstable**: PCM < 0.4 (poor alignment, instability present)
 * 
 * The stabilizer completes the Q7 stack by ensuring smooth interaction between all
 * interpretation layers, preventing cascade failures and maintaining system coherence
 * during rapid state transitions.
 * 
 * ## Q8 Modulation Layer
 * 
 * The Q8 layer introduces dynamic weight modulation for the Q7 interpretation stack,
 * adapting system behavior based on stability metrics and φ-attenuation curves.
 * 
 * ### Q8.1 Modulation Core
 * 
 * The Modulation Core provides dynamic weight adjustment for Q7 layers:
 * 
 * #### Key Features
 * 
 * 1. **Dynamic Weight Modulation**: Adjusts pattern/emergent/memory/resonance/coherence
 *    layer weights based on system state
 * 2. **φ-Attenuation Curve**: Uses golden ratio scaling (0.618 soften, 1.618 boost)
 * 3. **Stability-Driven**: Reacts to coherence levels, memory drift, and resonance bursts
 * 4. **Modulation Index**: Provides 0-1 metric indicating system load/stress
 * 5. **4-State Classification**: calm, balanced, sensitive, overloaded
 * 
 * #### Modulation Philosophy
 * 
 * The modulation layer acts as a meta-controller, adjusting how much influence each
 * Q7 layer has on the overall system behavior. When coherence is high and resonance
 * is stable, layers receive φ-boost (1.618). When instability is detected, layers
 * receive φ-soften (0.618) to prevent cascade failures.
 * 
 * This enables the system to automatically adapt its interpretation strategy based
 * on current conditions, maintaining stability while maximizing expressiveness.
 * 
 * ### Q8.2 Phase Modulator
 * 
 * The Phase Modulator acts as a phase-shift governor that stabilizes and regulates
 * phase relationships across the Q7 stack, preventing runaway oscillations and harsh
 * transitions during modulation-induced turbulence.
 * 
 * #### Key Features
 * 
 * 1. **Phase Drift Detection**: Computes φ-phase offset between signature phase,
 *    resonance harmonic phase, and coherence PCM phase anchor (output: drift ∈ [0..π])
 * 2. **φ-Phase Correction Curve**: Applies gentle corrections based on drift magnitude:
 *    - Small drift (<0.2π) → φ⁻¹ soft correction (0.618)
 *    - Mid drift (<0.5π) → φ-balanced correction (interpolated)
 *    - High drift (≥0.5π) → φ² stabilization clamp (2.618)
 * 3. **Phase Stability Index (PSI)**: Scalar 0-1 value computed from drift, modulation
 *    index, and coherence state
 * 4. **Phase Governor**: Modifies resonance + coherence inputs by phase weights to
 *    prevent runaway oscillations when modulation is "sensitive" or "overloaded"
 * 
 * #### Phase Stability States
 * 
 * - **stable**: PSI ≥ 0.8 (excellent phase alignment)
 * - **semi-stable**: PSI ≥ 0.6 (good alignment, minor corrections)
 * - **unstable**: PSI ≥ 0.4 (significant drift, active correction)
 * - **critical**: PSI < 0.4 (severe misalignment, maximum stabilization)
 * 
 * The Phase Modulator protects emergent and pattern layers from harsh transitions,
 * ensuring smooth phase evolution even during turbulent modulation states.
 * 
 * ### Q8.3 Entropy Regulator
 * 
 * The Entropy Regulator acts as the final stabilization layer in the Q8 meta-control
 * system, managing system-wide entropy to prevent runaway behavior and chaotization
 * under high load.
 * 
 * #### Key Features
 * 
 * 1. **Entropy Field Calculator**: Computes entropy across 5 channels:
 *    - Pattern entropy (pattern state variance)
 *    - Emergent entropy (state oscillation frequency)
 *    - Memory entropy (drift variance × Markov spread)
 *    - Resonance entropy (harmonic scatter)
 *    - Coherence entropy (PCM turbulence)
 * 2. **φ-Attenuation Damping**: Applies φ-based damping to control energy dissipation:
 *    - entropy > 0.6 → φ⁻¹ damping (0.618)
 *    - entropy > 0.8 → φ⁻² hard clamp (0.382)
 * 3. **System Stability Score (SSS)**: Composite metric computed as:
 *    sss = (1 - entropy) × coherence × (1 - modulationIndex)
 * 4. **4-State Classification**: low (≤0.30), moderate (≤0.55), high (≤0.75), critical (>0.75)
 * 
 * #### Entropy Regulation Philosophy
 * 
 * The Entropy Regulator works over all Q7 layers and Q8.1/Q8.2 outputs to form a global
 * stability coefficient. It prevents cascade failures by detecting early signs of system
 * chaotization and applying φ-based damping before instability propagates.
 * 
 * ### Q8.4 — Φ-Global Stabilizer (Φ-GS)
 * 
 * **Purpose**: Final Q8 meta-control layer unifying all Q7 and Q8 outputs into a global
 * stability framework.
 * 
 * #### Key Features
 * 
 * 1. **Global Stability Index (GSI)**: Combines coherence, entropy SSS, modulation index,
 *    and phase PSI into a comprehensive stability metric (0-1 range)
 * 2. **Global Drift Vector (GDV)**: Synthesizes drift from memory, resonance, and phase
 *    into a directional instability vector with magnitude and angle
 * 3. **Global Harmonic Pressure (GHP)**: Measures stress from resonance burst activity
 *    and harmonic instability (0-1 range)
 * 4. **5-State Classification**: hyper-stable, stable, tense, unstable, critical
 * 5. **φ-Stabilization**: Applies φ-based corrections to modulation and phase:
 *    - tense: φ⁻¹ stabilization (0.618)
 *    - unstable: φ⁻² stabilization (0.382)
 *    - critical: φ⁻³ stabilization (0.236)
 * 
 * #### Global Stabilizer Philosophy
 * 
 * The Global Stabilizer acts as the final unification layer, collecting all Q7
 * interpretation outputs (signature → pattern → emergent → memory → resonance → coherence)
 * and all Q8 meta-control outputs (modulation → phase → entropy) to compute system-wide
 * stability metrics. It applies φ-based corrections to the modulation and phase controllers
 * to maintain coherent operation under all load conditions, preventing runaway oscillations
 * and cascade failures while maintaining system expressiveness.
 * 
 * This completes the Q8 Meta-Control Layer quartet (Modulation → Phase → Entropy → Global),
 * providing comprehensive adaptive control and unification over the φ-wave interpretation stack.
 * 
 * @module phi-wave
 * @tag q7-integrated
 * @tag q7.1-preset-hotswitch
 * @tag q7.3-signature-engine
 * @tag q7.3-pattern-classifier
 * @tag q7.4-emergent
 * @tag q7.5-adaptive-memory
 * @tag q7.6-resonance
 * @tag q7.7-coherence-stabilizer
 * @tag q8.1-mod-core
 * @tag q8.2-phase-modulator
 * @tag q8.3-entropy-regulator
 * @tag q8.4-global-stabilizer
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

// Q7.5-A - Adaptive Memory
export type { MemoryState, MemoryListener, MemoryEventType } from './adaptive-memory.js';
export { PhiAdaptiveMemory, createAdaptiveMemory, Q7_MEMORY_VERSION } from './adaptive-memory.js';

// Q7.6-R - Resonance Engine
export type { ResonanceState, ResonanceSpectrum, ResonanceClassification, ResonanceListener } from './resonance-engine.js';
export { PhiResonanceEngine, createResonanceEngine, Q7_RESONANCE_VERSION } from './resonance-engine.js';

// Q7.7 - Coherence Stabilizer
export type { CoherenceState, PhaseCoherenceMetric, CoherenceListener } from './coherence-stabilizer.js';
export { PhiCoherenceStabilizer, createCoherenceStabilizer, Q7_COHERENCE_VERSION } from './coherence-stabilizer.js';

// Q8.1 - Modulation Core
export type { LayerWeights, ModulationState, ModulationData, ModulationListener, Q7CombinedState } from './q8/modulation-core.js';
export { PhiModulationCore, createModulationCore, Q8_MOD_CORE_VERSION } from './q8/modulation-core.js';

// Q8.2 - Phase Modulator
export type { PhaseStability, PhaseModulatorState, PhaseListener } from './q8/phase-modulator.js';
export { PhiPhaseModulator, createPhaseModulator, Q8_PHASE_VERSION } from './q8/phase-modulator.js';

// Q8.3 - Entropy Regulator
export type { EntropyState, EntropyData, EntropyListener } from './q8/entropy-regulator.js';
export { PhiEntropyRegulator, createEntropyRegulator, Q8_ENTROPY_VERSION } from './q8/entropy-regulator.js';

// Q8.4 - Global Stabilizer
export type { GlobalStabilityState, GlobalDriftVector, GlobalStabilizerData, GlobalStabilizerListener, Q7State, Q8State } from './q8/global-stabilizer.js';
export { PhiGlobalStabilizer, createGlobalStabilizer, Q8_GLOBAL_VERSION } from './q8/global-stabilizer.js';

// Demo
export { generateDemoHTML, getDemoConfig } from './phi-wave-demo.js';
