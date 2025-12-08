/**
 * Frey Core Safe
 * 
 * Φ-Voice Engine (v0.3) + Φ-Harmonic Wavefield Engine (v5.0)
 * 
 * Features:
 * - Voice Engine: Transform plain text + phi-passport into TTS templates
 * - Lane Styles: Voice style presets (calm, urgent, poetic, analytical, warm, neutral)
 * - Golden Segments: φ-based text segmentation using the golden ratio
 * - Phi-Passport: Identity configuration for voice generation
 * - Wavefield Engine: Zero-GC φ-harmonic wave computation and rendering
 * 
 * @module frey-core-safe
 */

// ============================================
// Voice Engine Exports
// ============================================

// Types
export type {
  LaneStyleId,
  LaneStyle,
  PhiPassport,
  GoldenSegment,
  VoiceTemplate,
  VoiceEngineInput,
  VoiceEngineResult,
} from './types.js';

export { PHI } from './types.js';

// Lane Styles
export {
  getLaneStyle,
  getAllLaneStyles,
  blendLaneStyles,
  isValidLaneStyleId,
} from './lane-styles.js';

// Golden Segments
export {
  createGoldenSegments,
  estimateTotalDuration,
  calculateAvgWordsPerSegment,
} from './golden-segments.js';

// Voice Engine
export {
  generateVoiceTemplate,
  createPhiPassport,
  VOICE_ENGINE_VERSION,
} from './voice-engine.js';

// ============================================
// Φ-Harmonic Wavefield Engine Exports
// ============================================

export * from './phi-wave/index.js';
