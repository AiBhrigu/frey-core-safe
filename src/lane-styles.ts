/**
 * Lane Styles Module
 * 
 * Predefined voice style configurations for the Φ-Voice Engine.
 * Each style represents a distinct voice persona with specific
 * speech characteristics.
 */

import type { LaneStyle, LaneStyleId } from './types.js';

/**
 * Lane style definitions
 */
const LANE_STYLES: Record<LaneStyleId, LaneStyle> = {
  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Peaceful and measured delivery with gentle pacing',
    rate: 0.9,
    pitch: 0.95,
    volume: 0.8,
    pauseMultiplier: 1.3,
    emphasisLevel: 0.4,
  },
  urgent: {
    id: 'urgent',
    name: 'Urgent',
    description: 'Quick and impactful delivery with heightened energy',
    rate: 1.2,
    pitch: 1.1,
    volume: 0.95,
    pauseMultiplier: 0.7,
    emphasisLevel: 0.85,
  },
  poetic: {
    id: 'poetic',
    name: 'Poetic',
    description: 'Expressive and flowing delivery with artistic rhythm',
    rate: 0.85,
    pitch: 1.05,
    volume: 0.85,
    pauseMultiplier: 1.5,
    emphasisLevel: 0.7,
  },
  analytical: {
    id: 'analytical',
    name: 'Analytical',
    description: 'Clear and precise delivery focused on comprehension',
    rate: 0.95,
    pitch: 1.0,
    volume: 0.9,
    pauseMultiplier: 1.1,
    emphasisLevel: 0.5,
  },
  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Friendly and inviting delivery with emotional resonance',
    rate: 0.92,
    pitch: 0.98,
    volume: 0.88,
    pauseMultiplier: 1.2,
    emphasisLevel: 0.6,
  },
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    description: 'Balanced and professional delivery without emotional bias',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.9,
    pauseMultiplier: 1.0,
    emphasisLevel: 0.5,
  },
};

/**
 * Get a lane style by its identifier
 * @param id - Lane style identifier
 * @returns The lane style configuration
 */
export function getLaneStyle(id: LaneStyleId): LaneStyle {
  return { ...LANE_STYLES[id] };
}

/**
 * Get all available lane styles
 * @returns Array of all lane style configurations
 */
export function getAllLaneStyles(): LaneStyle[] {
  return Object.values(LANE_STYLES).map(style => ({ ...style }));
}

/**
 * Blend two lane styles together
 * @param primary - Primary style identifier
 * @param secondary - Secondary style identifier
 * @param ratio - Blend ratio (0.0 = all primary, 1.0 = all secondary)
 * @returns Blended lane style
 */
export function blendLaneStyles(
  primary: LaneStyleId,
  secondary: LaneStyleId,
  ratio: number
): LaneStyle {
  const p = LANE_STYLES[primary];
  const s = LANE_STYLES[secondary];
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const invRatio = 1 - clampedRatio;

  return {
    id: primary,
    name: `${p.name}+${s.name}`,
    description: `Blended style: ${p.description} with ${s.description}`,
    rate: p.rate * invRatio + s.rate * clampedRatio,
    pitch: p.pitch * invRatio + s.pitch * clampedRatio,
    volume: p.volume * invRatio + s.volume * clampedRatio,
    pauseMultiplier: p.pauseMultiplier * invRatio + s.pauseMultiplier * clampedRatio,
    emphasisLevel: p.emphasisLevel * invRatio + s.emphasisLevel * clampedRatio,
  };
}

/**
 * Validate if a string is a valid lane style ID
 * @param id - String to validate
 * @returns True if valid lane style ID
 */
export function isValidLaneStyleId(id: string): id is LaneStyleId {
  return id in LANE_STYLES;
}
