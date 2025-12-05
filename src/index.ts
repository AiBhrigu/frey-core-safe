/**
 * Frey Voice Engine (v0.3)
 * 
 * Φ-Voice Engine for transforming plain text + phi-passport
 * into structured voice response templates suitable for TTS.
 * 
 * Features:
 * - Lane Styles: Voice style presets (calm, urgent, poetic, analytical, warm, neutral)
 * - Golden Segments: φ-based text segmentation using the golden ratio
 * - Phi-Passport: Identity configuration for voice generation
 * 
 * @module frey-core-safe
 */

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
