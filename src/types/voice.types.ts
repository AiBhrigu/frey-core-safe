/**
 * Φ-Voice Types - Core type definitions for Frey Voice Engine
 * 
 * These types define the interface between the Voice Engine and TTS Connector.
 * Implements φ-logic principles with golden ratio timing.
 */

/**
 * The golden ratio constant (φ ≈ 1.618033988749895)
 */
export const PHI = 1.618033988749895;

/**
 * Lane style presets for voice characteristics.
 * Each lane represents a different emotional/tonal quality.
 */
export type LaneStyle = 
  | 'calm'      // Serene, peaceful delivery
  | 'warm'      // Friendly, approachable tone
  | 'focused'   // Clear, precise articulation
  | 'resonant'  // Deep, impactful presence
  | 'radiant';  // Bright, energetic delivery

/**
 * A segment of text with φ-based timing properties.
 * Segments are structured according to golden ratio proportions.
 */
export interface VoiceSegment {
  /** The text content of this segment */
  text: string;
  /** Position in the overall sequence (0-indexed) */
  index: number;
  /** Relative weight based on φ-proportions (0.0 to 1.0) */
  phiWeight: number;
  /** Suggested pause duration after segment (in seconds) */
  pauseAfter: number;
  /** Emphasis level (0.0 = normal, 1.0 = maximum emphasis) */
  emphasis: number;
}

/**
 * Phi-Passport: Identity and style configuration for voice synthesis.
 * Contains all metadata needed to personalize the TTS output.
 */
export interface PhiPassport {
  /** Unique identifier for this voice configuration */
  id: string;
  /** Display name for the voice persona */
  name: string;
  /** Primary lane style for this persona */
  style: LaneStyle;
  /** Speech rate modifier (0.5 = half speed, 2.0 = double speed) */
  speed: number;
  /** Voice pitch modifier (optional, implementation-dependent) */
  pitch?: number;
  /** Additional custom properties */
  metadata?: Record<string, unknown>;
}

/**
 * Voice Template: The structured output from Voice Engine.
 * This is the input format expected by the TTS Connector.
 */
export interface VoiceTemplate {
  /** The phi-passport defining voice characteristics */
  passport: PhiPassport;
  /** Array of voice segments with φ-proportioned timing */
  segments: VoiceSegment[];
  /** Total estimated duration in seconds (calculated using φ-timing) */
  estimatedDuration: number;
  /** Timestamp when template was created */
  createdAt: string;
  /** Version of the voice template format */
  version: string;
}

/**
 * Calculate the φ-weight for a segment based on its position.
 * Uses the golden ratio to determine relative importance.
 * 
 * @param index - The segment index (0-indexed)
 * @param total - Total number of segments
 * @returns The φ-weight value between 0 and 1
 */
export function calculatePhiWeight(index: number, total: number): number {
  if (total <= 0) return 0;
  if (total === 1) return 1;
  
  // Use golden ratio to create a natural distribution
  // The golden angle provides aesthetically pleasing distribution
  const goldenAngle = 2 * Math.PI / (PHI + 1);
  const normalizedPosition = (index * goldenAngle) % (2 * Math.PI);
  
  // Map to 0-1 range with sine for smooth distribution
  return 0.5 + 0.5 * Math.sin(normalizedPosition);
}

/**
 * Calculate pause duration based on φ-proportions.
 * Pauses follow golden ratio relationships.
 * 
 * @param segmentWeight - The φ-weight of the segment
 * @param basePause - Base pause duration in seconds (default: 0.3)
 * @returns Pause duration in seconds
 */
export function calculatePauseDuration(segmentWeight: number, basePause: number = 0.3): number {
  // Use φ to scale pause: important segments get longer pauses
  return basePause * (1 + (segmentWeight * (PHI - 1)));
}
