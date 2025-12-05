/**
 * Φ-Voice Engine
 * 
 * Core engine that transforms plain text and phi-passport
 * into structured voice response templates suitable for TTS.
 * 
 * @module voice-engine
 */

import type {
  PhiPassport,
  VoiceEngineInput,
  VoiceEngineResult,
  VoiceTemplate,
  LaneStyle,
} from './types.js';
import { getLaneStyle, blendLaneStyles } from './lane-styles.js';
import {
  createGoldenSegments,
  estimateTotalDuration,
  calculateAvgWordsPerSegment,
} from './golden-segments.js';

/**
 * Voice Engine version
 */
export const VOICE_ENGINE_VERSION = '0.3.0';

/**
 * Generate a voice template from text and phi-passport
 * 
 * @param input - Voice engine input containing text and passport
 * @returns Voice engine result with generated template
 * 
 * @example
 * ```typescript
 * const result = generateVoiceTemplate({
 *   text: "Welcome to the Frey Voice Engine. Experience natural speech synthesis.",
 *   passport: {
 *     id: "user-001",
 *     name: "Demo User",
 *     primaryStyle: "warm",
 *   }
 * });
 * 
 * if (result.success) {
 *   console.log(result.template);
 * }
 * ```
 */
export function generateVoiceTemplate(input: VoiceEngineInput): VoiceEngineResult {
  try {
    // Validate input
    const validationError = validateInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const { text, passport } = input;

    // Resolve lane style (with optional blending)
    const appliedStyle = resolveStyle(passport);

    // Apply any passport overrides
    const finalStyle = applyStyleOverrides(appliedStyle, passport);

    // Determine resonance depth
    const resonanceDepth = passport.resonanceDepth ?? 2;

    // Generate golden segments
    const segments = createGoldenSegments(text, finalStyle, resonanceDepth);

    // Calculate estimated duration
    const estimatedDurationMs = estimateTotalDuration(segments, finalStyle);

    // Build voice template
    const template: VoiceTemplate = {
      version: VOICE_ENGINE_VERSION,
      passportId: passport.id,
      appliedStyle: finalStyle,
      segments,
      estimatedDurationMs,
      metadata: {
        segmentCount: segments.length,
        avgWordsPerSegment: calculateAvgWordsPerSegment(segments),
        resonanceDepth,
        generatedAt: new Date().toISOString(),
      },
    };

    return { success: true, template };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during template generation';
    return { success: false, error: message };
  }
}

/**
 * Validate voice engine input
 */
function validateInput(input: VoiceEngineInput): string | null {
  if (!input) {
    return 'Input is required';
  }

  if (!input.text || typeof input.text !== 'string') {
    return 'Text input is required and must be a string';
  }

  if (input.text.trim().length === 0) {
    return 'Text input cannot be empty';
  }

  if (!input.passport) {
    return 'Phi-passport is required';
  }

  if (!input.passport.id || typeof input.passport.id !== 'string') {
    return 'Passport ID is required and must be a string';
  }

  if (!input.passport.name || typeof input.passport.name !== 'string') {
    return 'Passport name is required and must be a string';
  }

  if (!input.passport.primaryStyle) {
    return 'Primary style is required';
  }

  return null;
}

/**
 * Resolve the lane style from passport configuration
 */
function resolveStyle(passport: PhiPassport): LaneStyle {
  if (passport.secondaryStyle && passport.blendRatio !== undefined) {
    return blendLaneStyles(
      passport.primaryStyle,
      passport.secondaryStyle,
      passport.blendRatio
    );
  }
  return getLaneStyle(passport.primaryStyle);
}

/**
 * Apply passport overrides to the style
 */
function applyStyleOverrides(style: LaneStyle, passport: PhiPassport): LaneStyle {
  const result = { ...style };

  if (passport.rateOverride !== undefined) {
    result.rate = passport.rateOverride;
  }

  if (passport.pitchOverride !== undefined) {
    result.pitch = passport.pitchOverride;
  }

  return result;
}

/**
 * Create a phi-passport with default values
 * 
 * @param id - Unique identifier
 * @param name - Display name
 * @param primaryStyle - Primary lane style
 * @returns A new phi-passport
 */
export function createPhiPassport(
  id: string,
  name: string,
  primaryStyle: PhiPassport['primaryStyle']
): PhiPassport {
  return {
    id,
    name,
    primaryStyle,
  };
}
