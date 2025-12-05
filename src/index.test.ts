/**
 * Tests for the Φ-Voice Engine
 */

import { describe, it, expect } from 'vitest';
import {
  generateVoiceTemplate,
  createPhiPassport,
  getLaneStyle,
  getAllLaneStyles,
  blendLaneStyles,
  isValidLaneStyleId,
  createGoldenSegments,
  estimateTotalDuration,
  calculateAvgWordsPerSegment,
  PHI,
  VOICE_ENGINE_VERSION,
} from './index.js';
import type { PhiPassport, LaneStyleId } from './index.js';

describe('PHI constant', () => {
  it('should be the golden ratio', () => {
    expect(PHI).toBeCloseTo(1.618033988749895, 10);
  });
});

describe('Lane Styles', () => {
  describe('getLaneStyle', () => {
    it('should return a valid style for each lane style ID', () => {
      const styleIds: LaneStyleId[] = ['calm', 'urgent', 'poetic', 'analytical', 'warm', 'neutral'];
      
      for (const id of styleIds) {
        const style = getLaneStyle(id);
        expect(style.id).toBe(id);
        expect(style.rate).toBeGreaterThan(0);
        expect(style.pitch).toBeGreaterThan(0);
        expect(style.volume).toBeGreaterThan(0);
        expect(style.volume).toBeLessThanOrEqual(1);
        expect(style.pauseMultiplier).toBeGreaterThan(0);
        expect(style.emphasisLevel).toBeGreaterThanOrEqual(0);
        expect(style.emphasisLevel).toBeLessThanOrEqual(1);
      }
    });

    it('should return a copy of the style', () => {
      const style1 = getLaneStyle('calm');
      const style2 = getLaneStyle('calm');
      expect(style1).not.toBe(style2);
      expect(style1).toEqual(style2);
    });
  });

  describe('getAllLaneStyles', () => {
    it('should return all six lane styles', () => {
      const styles = getAllLaneStyles();
      expect(styles).toHaveLength(6);
      
      const ids = styles.map(s => s.id);
      expect(ids).toContain('calm');
      expect(ids).toContain('urgent');
      expect(ids).toContain('poetic');
      expect(ids).toContain('analytical');
      expect(ids).toContain('warm');
      expect(ids).toContain('neutral');
    });
  });

  describe('blendLaneStyles', () => {
    it('should blend two styles with ratio 0.5', () => {
      const blended = blendLaneStyles('calm', 'urgent', 0.5);
      
      const calm = getLaneStyle('calm');
      const urgent = getLaneStyle('urgent');
      
      expect(blended.rate).toBeCloseTo((calm.rate + urgent.rate) / 2, 5);
      expect(blended.pitch).toBeCloseTo((calm.pitch + urgent.pitch) / 2, 5);
    });

    it('should return primary style with ratio 0', () => {
      const blended = blendLaneStyles('calm', 'urgent', 0);
      const calm = getLaneStyle('calm');
      
      expect(blended.rate).toBe(calm.rate);
      expect(blended.pitch).toBe(calm.pitch);
    });

    it('should return secondary style with ratio 1', () => {
      const blended = blendLaneStyles('calm', 'urgent', 1);
      const urgent = getLaneStyle('urgent');
      
      expect(blended.rate).toBe(urgent.rate);
      expect(blended.pitch).toBe(urgent.pitch);
    });

    it('should clamp ratio to 0-1 range', () => {
      const blendedNeg = blendLaneStyles('calm', 'urgent', -0.5);
      const blendedOver = blendLaneStyles('calm', 'urgent', 1.5);
      const calm = getLaneStyle('calm');
      const urgent = getLaneStyle('urgent');
      
      expect(blendedNeg.rate).toBe(calm.rate);
      expect(blendedOver.rate).toBe(urgent.rate);
    });
  });

  describe('isValidLaneStyleId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidLaneStyleId('calm')).toBe(true);
      expect(isValidLaneStyleId('urgent')).toBe(true);
    });

    it('should return false for invalid IDs', () => {
      expect(isValidLaneStyleId('invalid')).toBe(false);
      expect(isValidLaneStyleId('')).toBe(false);
    });
  });
});

describe('Golden Segments', () => {
  describe('createGoldenSegments', () => {
    it('should create segments from text', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments(
        'Hello world. This is a test.',
        style,
        2
      );
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0].index).toBe(0);
      expect(segments[0].text).toBeTruthy();
    });

    it('should return empty array for empty text', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments('', style, 2);
      expect(segments).toHaveLength(0);
    });

    it('should return empty array for whitespace-only text', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments('   ', style, 2);
      expect(segments).toHaveLength(0);
    });

    it('should assign segment types correctly', () => {
      const style = getLaneStyle('neutral');
      const longText = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.';
      const segments = createGoldenSegments(longText, style, 2);
      
      const types = segments.map(s => s.type);
      expect(types).toContain('primary');
      expect(types).toContain('secondary');
    });

    it('should include duration weights based on phi', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments('Hello. World.', style, 2);
      
      for (const segment of segments) {
        expect(segment.durationWeight).toBeGreaterThan(0);
      }
    });
  });

  describe('estimateTotalDuration', () => {
    it('should return 0 for empty segments', () => {
      const style = getLaneStyle('neutral');
      expect(estimateTotalDuration([], style)).toBe(0);
    });

    it('should return positive duration for text', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments('Hello world.', style, 2);
      const duration = estimateTotalDuration(segments, style);
      
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('calculateAvgWordsPerSegment', () => {
    it('should return 0 for empty segments', () => {
      expect(calculateAvgWordsPerSegment([])).toBe(0);
    });

    it('should calculate average correctly', () => {
      const style = getLaneStyle('neutral');
      const segments = createGoldenSegments('Hello world. This is a test.', style, 2);
      const avg = calculateAvgWordsPerSegment(segments);
      
      expect(avg).toBeGreaterThan(0);
    });
  });
});

describe('Voice Engine', () => {
  describe('createPhiPassport', () => {
    it('should create a valid passport', () => {
      const passport = createPhiPassport('test-001', 'Test User', 'warm');
      
      expect(passport.id).toBe('test-001');
      expect(passport.name).toBe('Test User');
      expect(passport.primaryStyle).toBe('warm');
    });
  });

  describe('generateVoiceTemplate', () => {
    const validPassport: PhiPassport = {
      id: 'test-001',
      name: 'Test User',
      primaryStyle: 'neutral',
    };

    it('should generate a valid template', () => {
      const result = generateVoiceTemplate({
        text: 'Welcome to the Frey Voice Engine. Experience natural speech synthesis.',
        passport: validPassport,
      });
      
      expect(result.success).toBe(true);
      expect(result.template).toBeDefined();
      expect(result.template!.version).toBe(VOICE_ENGINE_VERSION);
      expect(result.template!.passportId).toBe('test-001');
      expect(result.template!.segments.length).toBeGreaterThan(0);
    });

    it('should apply lane style from passport', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: { ...validPassport, primaryStyle: 'urgent' },
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.appliedStyle.id).toBe('urgent');
    });

    it('should blend styles when secondary is specified', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: {
          ...validPassport,
          primaryStyle: 'calm',
          secondaryStyle: 'urgent',
          blendRatio: 0.5,
        },
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.appliedStyle.name).toContain('Calm');
      expect(result.template!.appliedStyle.name).toContain('Urgent');
    });

    it('should apply rate override', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: { ...validPassport, rateOverride: 1.5 },
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.appliedStyle.rate).toBe(1.5);
    });

    it('should apply pitch override', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: { ...validPassport, pitchOverride: 0.8 },
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.appliedStyle.pitch).toBe(0.8);
    });

    it('should use default resonance depth of 2', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: validPassport,
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.metadata.resonanceDepth).toBe(2);
    });

    it('should respect custom resonance depth', () => {
      const result = generateVoiceTemplate({
        text: 'Test message.',
        passport: { ...validPassport, resonanceDepth: 3 },
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.metadata.resonanceDepth).toBe(3);
    });

    it('should include metadata', () => {
      const result = generateVoiceTemplate({
        text: 'Hello world.',
        passport: validPassport,
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.metadata.segmentCount).toBeGreaterThan(0);
      expect(result.template!.metadata.avgWordsPerSegment).toBeGreaterThan(0);
      expect(result.template!.metadata.generatedAt).toBeTruthy();
    });

    it('should return error for missing input', () => {
      // @ts-expect-error Testing invalid input
      const result = generateVoiceTemplate(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return error for empty text', () => {
      const result = generateVoiceTemplate({
        text: '',
        passport: validPassport,
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Text');
    });

    it('should return error for whitespace-only text', () => {
      const result = generateVoiceTemplate({
        text: '   ',
        passport: validPassport,
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should return error for missing passport', () => {
      // @ts-expect-error Testing invalid input
      const result = generateVoiceTemplate({ text: 'Hello' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('passport');
    });

    it('should return error for missing passport ID', () => {
      const result = generateVoiceTemplate({
        text: 'Hello',
        // @ts-expect-error Testing invalid input
        passport: { name: 'Test', primaryStyle: 'neutral' },
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should return error for missing passport name', () => {
      const result = generateVoiceTemplate({
        text: 'Hello',
        // @ts-expect-error Testing invalid input
        passport: { id: 'test', primaryStyle: 'neutral' },
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('name');
    });

    it('should return error for missing primary style', () => {
      const result = generateVoiceTemplate({
        text: 'Hello',
        // @ts-expect-error Testing invalid input
        passport: { id: 'test', name: 'Test' },
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('style');
    });

    it('should estimate duration correctly', () => {
      const result = generateVoiceTemplate({
        text: 'This is a longer test message with multiple words.',
        passport: validPassport,
      });
      
      expect(result.success).toBe(true);
      expect(result.template!.estimatedDurationMs).toBeGreaterThan(0);
    });
  });
});
