/**
 * Φ-Voice Engine Types
 * 
 * Core type definitions for the Frey Voice Engine implementing
 * phi-structure principles: clarity, modularity, resonance layers.
 */

/**
 * The golden ratio (φ) - fundamental constant for segment calculations
 */
export const PHI = 1.618033988749895;

/**
 * Lane style identifiers representing different voice personas
 */
export type LaneStyleId = 
  | 'calm'
  | 'urgent'
  | 'poetic'
  | 'analytical'
  | 'warm'
  | 'neutral';

/**
 * Configuration for a specific lane style
 */
export interface LaneStyle {
  id: LaneStyleId;
  name: string;
  description: string;
  /** Speech rate modifier (1.0 = normal) */
  rate: number;
  /** Pitch modifier (1.0 = normal) */
  pitch: number;
  /** Volume level (0.0 - 1.0) */
  volume: number;
  /** Pause duration multiplier between segments */
  pauseMultiplier: number;
  /** Emphasis level for key phrases (0.0 - 1.0) */
  emphasisLevel: number;
}

/**
 * Phi-passport: identity configuration for voice generation
 */
export interface PhiPassport {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Primary lane style */
  primaryStyle: LaneStyleId;
  /** Optional secondary style for blending */
  secondaryStyle?: LaneStyleId;
  /** Blend ratio between primary and secondary (0.0 - 1.0) */
  blendRatio?: number;
  /** Custom rate override */
  rateOverride?: number;
  /** Custom pitch override */
  pitchOverride?: number;
  /** Resonance depth (1-3, affects segment layering) */
  resonanceDepth?: 1 | 2 | 3;
}

/**
 * A golden segment represents a text fragment with timing metadata
 */
export interface GoldenSegment {
  /** Segment index */
  index: number;
  /** Text content */
  text: string;
  /** Duration weight based on phi ratio */
  durationWeight: number;
  /** Suggested pause after segment (ms) */
  pauseAfterMs: number;
  /** Emphasis level for this segment */
  emphasis: number;
  /** Segment type classification */
  type: 'primary' | 'secondary' | 'tertiary';
}

/**
 * Voice template: structured output for TTS rendering
 */
export interface VoiceTemplate {
  /** Template version */
  version: string;
  /** Source phi-passport ID */
  passportId: string;
  /** Applied lane style */
  appliedStyle: LaneStyle;
  /** Segmented text with golden ratio timing */
  segments: GoldenSegment[];
  /** Total estimated duration (ms) */
  estimatedDurationMs: number;
  /** Metadata for TTS engine */
  metadata: {
    /** Total segment count */
    segmentCount: number;
    /** Average words per segment */
    avgWordsPerSegment: number;
    /** Resonance depth applied */
    resonanceDepth: number;
    /** Generation timestamp */
    generatedAt: string;
  };
}

/**
 * Input for voice template generation
 */
export interface VoiceEngineInput {
  /** Plain text to transform */
  text: string;
  /** Phi-passport configuration */
  passport: PhiPassport;
}

/**
 * Result from voice template generation
 */
export interface VoiceEngineResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Generated voice template (if successful) */
  template?: VoiceTemplate;
  /** Error message (if unsuccessful) */
  error?: string;
}
