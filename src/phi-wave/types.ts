/**
 * Φ-Harmonic Wavefield Engine Types (v5.0)
 * 
 * Core type definitions for deterministic φ-based wave computation
 * and zero-GC render loops.
 */

import { PHI } from '../types.js';

/** Re-export PHI for wave calculations */
export { PHI };

/** Inverse golden ratio (1/φ) */
export const PHI_INV = 1 / PHI;

/** Golden angle in radians (2π/φ²) */
export const PHI_ANGLE = (2 * Math.PI) / (PHI * PHI);

/**
 * 2D Vector for wave calculations (pre-allocated for zero-GC)
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Wave point with position and amplitude
 */
export interface WavePoint {
  /** Position */
  pos: Vec2;
  /** Current amplitude (-1 to 1) */
  amplitude: number;
  /** Current phase (0 to 2π) */
  phase: number;
  /** Harmonic index */
  harmonicIndex: number;
}

/**
 * Wave layer configuration
 */
export interface WaveLayerConfig {
  /** Layer identifier */
  id: string;
  /** Harmonic multiplier (φ-based) */
  harmonicMultiplier: number;
  /** Base frequency (Hz) */
  baseFrequency: number;
  /** Amplitude scale (0-1) */
  amplitudeScale: number;
  /** Phase offset (radians) */
  phaseOffset: number;
  /** Blend mode */
  blendMode: 'add' | 'multiply' | 'screen' | 'overlay';
  /** Layer opacity (0-1) */
  opacity: number;
  /** Enable state */
  enabled: boolean;
}

/**
 * Wave kernel configuration
 */
export interface WaveKernelConfig {
  /** Grid resolution (points per axis) */
  resolution: number;
  /** Field dimensions */
  width: number;
  height: number;
  /** Time scale multiplier */
  timeScale: number;
  /** Damping factor (0-1) */
  damping: number;
}

/**
 * Phi harmonic map entry
 */
export interface PhiHarmonic {
  /** Harmonic index (0 = fundamental) */
  index: number;
  /** Frequency ratio based on φ */
  frequencyRatio: number;
  /** Amplitude ratio based on φ */
  amplitudeRatio: number;
  /** Phase shift based on golden angle */
  phaseShift: number;
}

/**
 * Render frame data (pre-allocated buffer)
 */
export interface WaveFrameData {
  /** Frame timestamp (ms) */
  timestamp: number;
  /** Delta time since last frame (ms) */
  deltaTime: number;
  /** Current time in seconds */
  timeSeconds: number;
  /** Frame index */
  frameIndex: number;
  /** Points buffer (pre-allocated) */
  points: Float32Array;
  /** Amplitudes buffer (pre-allocated) */
  amplitudes: Float32Array;
  /** Phases buffer (pre-allocated) */
  phases: Float32Array;
}

/**
 * Sync event for PhiSyncBus
 */
export interface SyncEvent {
  /** Event type */
  type: 'tick' | 'phase-reset' | 'frequency-change' | 'layer-update' | 'q7-wave' | 'pattern:update' | 'emergent:update';
  /** Event timestamp */
  timestamp: number;
  /** Event data */
  data?: Record<string, number> | any;
}

/**
 * Sync bus listener
 */
export type SyncListener = (event: SyncEvent) => void;

/**
 * Controller range limits
 */
export interface ControllerRange {
  min: number;
  max: number;
  default: number;
  step: number;
}

/**
 * Amplitude controller state
 */
export interface AmplitudeState {
  /** Global amplitude (0-1) */
  global: number;
  /** Per-layer amplitudes */
  layers: Map<string, number>;
  /** Attack time (ms) */
  attackMs: number;
  /** Release time (ms) */
  releaseMs: number;
  /** Current envelope position */
  envelope: number;
}

/**
 * Phase controller state
 */
export interface PhaseState {
  /** Global phase offset (radians) */
  globalOffset: number;
  /** Per-layer phase offsets */
  layers: Map<string, number>;
  /** Phase lock enabled */
  locked: boolean;
  /** Sync to φ-grid */
  phiSync: boolean;
}

/**
 * Surface root configuration
 */
export interface SurfaceRootConfig {
  /** Canvas element ID or element */
  canvas: string | HTMLCanvasElement;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Auto-start rendering */
  autoStart: boolean;
  /** Target FPS (0 = unlimited) */
  targetFps: number;
}

/**
 * Wave field renderer options
 */
export interface RendererOptions {
  /** Render mode */
  mode: 'points' | 'lines' | 'mesh' | 'gradient';
  /** Color scheme */
  colorScheme: 'phi-spectrum' | 'monochrome' | 'heat' | 'custom';
  /** Custom color function */
  colorFn?: (amplitude: number, phase: number) => string;
  /** Anti-aliasing */
  antiAlias: boolean;
  /** Show debug info */
  debug: boolean;
}

/**
 * Demo configuration
 */
export interface PhiWaveDemoConfig {
  /** Preset name */
  preset: 'default' | 'calm' | 'energetic' | 'harmonic' | 'chaos';
  /** Number of wave layers */
  layerCount: number;
  /** Base frequency */
  baseFrequency: number;
  /** Show controls */
  showControls: boolean;
  /** Show stats */
  showStats: boolean;
}
