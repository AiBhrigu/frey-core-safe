/**
 * Golden Segments Module
 * 
 * Implements φ-based text segmentation using the golden ratio.
 * Text is divided into segments with timing weights derived from
 * the golden ratio (1.618...) for natural rhythm and flow.
 */

import type { GoldenSegment, LaneStyle } from './types.js';
import { PHI } from './types.js';

/**
 * Base pause duration in milliseconds
 */
const BASE_PAUSE_MS = 300;

/**
 * Average speaking rate: words per minute
 */
const WORDS_PER_MINUTE = 150;

/**
 * Segment a text into golden segments
 * @param text - Input text to segment
 * @param style - Lane style to apply
 * @param resonanceDepth - Depth of resonance layering (1-3)
 * @returns Array of golden segments
 */
export function createGoldenSegments(
  text: string,
  style: LaneStyle,
  resonanceDepth: 1 | 2 | 3 = 2
): GoldenSegment[] {
  const cleanedText = text.trim();
  if (!cleanedText) {
    return [];
  }

  // Split text into sentences/phrases
  const phrases = splitIntoPhrases(cleanedText);
  if (phrases.length === 0) {
    return [];
  }

  // Calculate segment types based on golden ratio distribution
  const segments: GoldenSegment[] = [];
  const totalPhrases = phrases.length;

  for (let i = 0; i < totalPhrases; i++) {
    const phrase = phrases[i];
    const segmentType = calculateSegmentType(i, totalPhrases, resonanceDepth);
    const durationWeight = calculateDurationWeight(segmentType);
    const emphasis = calculateEmphasis(segmentType, style.emphasisLevel);
    const pauseAfterMs = calculatePauseAfter(segmentType, style.pauseMultiplier);

    segments.push({
      index: i,
      text: phrase,
      durationWeight,
      pauseAfterMs,
      emphasis,
      type: segmentType,
    });
  }

  return segments;
}

/**
 * Split text into natural phrases for segmentation
 * @param text - Input text
 * @returns Array of phrase strings
 */
function splitIntoPhrases(text: string): string[] {
  // Split on sentence boundaries and major punctuation
  const sentencePattern = /(?<=[.!?])\s+|(?<=[:;])\s+(?=[A-Z])/;
  const sentences = text.split(sentencePattern).filter(s => s.trim().length > 0);

  const phrases: string[] = [];
  
  for (const sentence of sentences) {
    // Further split long sentences by commas if needed
    const trimmed = sentence.trim();
    const wordCount = countWords(trimmed);
    
    if (wordCount > 15) {
      // Split long sentences by commas
      const parts = trimmed.split(/,\s+/).filter(p => p.trim().length > 0);
      if (parts.length > 1) {
        for (let i = 0; i < parts.length; i++) {
          let part = parts[i].trim();
          // Add comma back except for last part (unless it already ends with punctuation)
          if (i < parts.length - 1 && !/[.!?;:]$/.test(part)) {
            part += ',';
          }
          if (part.length > 0) {
            phrases.push(part);
          }
        }
      } else {
        phrases.push(trimmed);
      }
    } else {
      phrases.push(trimmed);
    }
  }

  return phrases;
}

/**
 * Count words in a string
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate segment type based on position and golden ratio
 * @param index - Segment index
 * @param total - Total number of segments
 * @param depth - Resonance depth
 * @returns Segment type
 */
function calculateSegmentType(
  index: number,
  total: number,
  depth: 1 | 2 | 3
): 'primary' | 'secondary' | 'tertiary' {
  if (total === 1) return 'primary';

  // Calculate golden ratio points
  const position = index / (total - 1);
  const goldenPoint = 1 / PHI; // ~0.618
  const invGoldenPoint = 1 - goldenPoint; // ~0.382

  // Distance from golden points
  const distFromGolden = Math.abs(position - goldenPoint);
  const distFromInvGolden = Math.abs(position - invGoldenPoint);
  const minDist = Math.min(distFromGolden, distFromInvGolden);

  // Apply resonance depth thresholds
  const primaryThreshold = 0.1 * depth;
  const secondaryThreshold = 0.25 * depth;

  if (minDist <= primaryThreshold) {
    return 'primary';
  } else if (minDist <= secondaryThreshold) {
    return 'secondary';
  } else {
    return 'tertiary';
  }
}

/**
 * Calculate duration weight based on segment type
 * Uses golden ratio for weight distribution
 */
function calculateDurationWeight(type: 'primary' | 'secondary' | 'tertiary'): number {
  switch (type) {
    case 'primary':
      return PHI; // ~1.618
    case 'secondary':
      return 1.0;
    case 'tertiary':
      return 1 / PHI; // ~0.618
  }
}

/**
 * Calculate emphasis level for a segment
 */
function calculateEmphasis(
  type: 'primary' | 'secondary' | 'tertiary',
  baseEmphasis: number
): number {
  const multiplier = type === 'primary' ? PHI : type === 'secondary' ? 1.0 : 1 / PHI;
  return Math.min(1.0, baseEmphasis * multiplier);
}

/**
 * Calculate pause duration after a segment
 */
function calculatePauseAfter(
  type: 'primary' | 'secondary' | 'tertiary',
  pauseMultiplier: number
): number {
  const typeMultiplier = type === 'primary' ? PHI : type === 'secondary' ? 1.0 : 1 / PHI;
  return Math.round(BASE_PAUSE_MS * pauseMultiplier * typeMultiplier);
}

/**
 * Estimate total duration for segments
 * @param segments - Array of golden segments
 * @param style - Applied lane style
 * @returns Estimated duration in milliseconds
 */
export function estimateTotalDuration(segments: GoldenSegment[], style: LaneStyle): number {
  if (segments.length === 0) return 0;

  const totalWords = segments.reduce((sum, seg) => sum + countWords(seg.text), 0);
  const totalPauses = segments.reduce((sum, seg) => sum + seg.pauseAfterMs, 0);
  
  // Calculate speaking duration based on rate
  const adjustedWpm = WORDS_PER_MINUTE * style.rate;
  const speakingDurationMs = (totalWords / adjustedWpm) * 60 * 1000;

  return Math.round(speakingDurationMs + totalPauses);
}

/**
 * Calculate average words per segment
 */
export function calculateAvgWordsPerSegment(segments: GoldenSegment[]): number {
  if (segments.length === 0) return 0;
  const totalWords = segments.reduce((sum, seg) => sum + countWords(seg.text), 0);
  return Math.round((totalWords / segments.length) * 10) / 10;
}
