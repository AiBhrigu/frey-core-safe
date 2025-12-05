/**
 * TTS Connector Tests
 * 
 * Unit tests for the Φ-Voice Output Module TTS Connector.
 */

import { 
  TTSConnector, 
  TTSError,
  VoiceTemplate,
  PhiPassport,
  VoiceSegment,
  TTSConfig,
  calculatePhiWeight,
  calculatePauseDuration,
  getVoiceForStyle,
  resolveTTSConfig,
  DEFAULT_TTS_CONFIG,
  PHI,
  LANE_STYLE_VOICE_MAP,
} from '../src';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: jest.fn().mockResolvedValue({
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        }),
      },
    },
  }));
});

describe('TTSConnector', () => {
  const validConfig: TTSConfig = {
    apiKey: 'test-api-key',
    model: 'tts-1',
    defaultVoice: 'nova',
    format: 'mp3',
    speed: 1.0,
  };

  const createMockPassport = (overrides?: Partial<PhiPassport>): PhiPassport => ({
    id: 'test-passport',
    name: 'Test Voice',
    style: 'warm',
    speed: 1.0,
    ...overrides,
  });

  const createMockSegment = (overrides?: Partial<VoiceSegment>): VoiceSegment => ({
    text: 'Hello, world!',
    index: 0,
    phiWeight: 0.618,
    pauseAfter: 0.3,
    emphasis: 0.5,
    ...overrides,
  });

  const createMockTemplate = (overrides?: Partial<VoiceTemplate>): VoiceTemplate => ({
    passport: createMockPassport(),
    segments: [createMockSegment()],
    estimatedDuration: 2.5,
    createdAt: new Date().toISOString(),
    version: '1.0.0',
    ...overrides,
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const connector = new TTSConnector(validConfig);
      expect(connector).toBeInstanceOf(TTSConnector);
    });

    it('should apply default values for missing config options', () => {
      const minimalConfig: TTSConfig = { apiKey: 'test-key' };
      const connector = new TTSConnector(minimalConfig);
      const config = connector.configuration;
      
      expect(config.model).toBe(DEFAULT_TTS_CONFIG.model);
      expect(config.defaultVoice).toBe(DEFAULT_TTS_CONFIG.defaultVoice);
      expect(config.format).toBe(DEFAULT_TTS_CONFIG.format);
      expect(config.speed).toBe(DEFAULT_TTS_CONFIG.speed);
    });
  });

  describe('synthesize', () => {
    it('should synthesize a valid voice template', async () => {
      const connector = new TTSConnector(validConfig);
      const template = createMockTemplate();
      
      const result = await connector.synthesize(template);
      
      expect(result).toBeDefined();
      expect(result.audio).toBeInstanceOf(Buffer);
      expect(result.format).toBe('mp3');
      expect(result.text).toContain('Hello, world!');
      expect(result.voice).toBe('nova'); // warm style maps to nova
      expect(result.metadata.segmentCount).toBe(1);
    });

    it('should throw TTSError for empty template', async () => {
      const connector = new TTSConnector(validConfig);
      const template = createMockTemplate({ segments: [] });
      
      await expect(connector.synthesize(template)).rejects.toThrow(TTSError);
      await expect(connector.synthesize(template)).rejects.toMatchObject({
        code: 'EMPTY_TEMPLATE',
      });
    });

    it('should use correct voice for lane style', async () => {
      const connector = new TTSConnector(validConfig);
      
      for (const [style, expectedVoice] of Object.entries(LANE_STYLE_VOICE_MAP)) {
        const template = createMockTemplate({
          passport: createMockPassport({ style: style as keyof typeof LANE_STYLE_VOICE_MAP }),
        });
        
        const result = await connector.synthesize(template);
        expect(result.voice).toBe(expectedVoice);
      }
    });

    it('should combine multiple segments correctly', async () => {
      const connector = new TTSConnector(validConfig);
      const template = createMockTemplate({
        segments: [
          createMockSegment({ text: 'First segment.', index: 0 }),
          createMockSegment({ text: 'Second segment.', index: 1 }),
          createMockSegment({ text: 'Third segment.', index: 2 }),
        ],
      });
      
      const result = await connector.synthesize(template);
      expect(result.text).toBe('First segment. Second segment. Third segment.');
      expect(result.metadata.segmentCount).toBe(3);
    });
  });

  describe('synthesizeText', () => {
    it('should synthesize raw text', async () => {
      const connector = new TTSConnector(validConfig);
      
      const audio = await connector.synthesizeText('Hello, world!');
      
      expect(audio).toBeInstanceOf(Buffer);
    });

    it('should throw TTSError for empty text', async () => {
      const connector = new TTSConnector(validConfig);
      
      await expect(connector.synthesizeText('')).rejects.toThrow(TTSError);
      await expect(connector.synthesizeText('   ')).rejects.toThrow(TTSError);
    });

    it('should accept custom voice and speed options', async () => {
      const connector = new TTSConnector(validConfig);
      
      // Should not throw
      const audio = await connector.synthesizeText('Test', { voice: 'onyx', speed: 1.5 });
      expect(audio).toBeInstanceOf(Buffer);
    });
  });

  describe('synthesizeSegment', () => {
    it('should synthesize a single segment', async () => {
      const connector = new TTSConnector(validConfig);
      const segment = createMockSegment();
      const passport = createMockPassport();
      
      const audio = await connector.synthesizeSegment(segment, passport);
      
      expect(audio).toBeInstanceOf(Buffer);
    });

    it('should allow voice override', async () => {
      const connector = new TTSConnector(validConfig);
      const segment = createMockSegment();
      const passport = createMockPassport({ style: 'warm' });
      
      // Should not throw with override
      const audio = await connector.synthesizeSegment(segment, passport, { voice: 'echo' });
      expect(audio).toBeInstanceOf(Buffer);
    });
  });

  describe('configuration', () => {
    it('should return read-only configuration', () => {
      const connector = new TTSConnector(validConfig);
      const config = connector.configuration;
      
      expect(config.apiKey).toBe(validConfig.apiKey);
      expect(config.model).toBe(validConfig.model);
      expect(config.defaultVoice).toBe(validConfig.defaultVoice);
    });
  });
});

describe('Voice Types', () => {
  describe('PHI constant', () => {
    it('should be approximately 1.618', () => {
      expect(PHI).toBeCloseTo(1.618033988749895, 10);
    });
  });

  describe('calculatePhiWeight', () => {
    it('should return 0 for empty set', () => {
      expect(calculatePhiWeight(0, 0)).toBe(0);
      expect(calculatePhiWeight(5, 0)).toBe(0);
    });

    it('should return 1 for single element', () => {
      expect(calculatePhiWeight(0, 1)).toBe(1);
    });

    it('should return values between 0 and 1', () => {
      for (let i = 0; i < 10; i++) {
        const weight = calculatePhiWeight(i, 10);
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
    });

    it('should produce varying weights for different indices', () => {
      const weights = new Set<number>();
      for (let i = 0; i < 5; i++) {
        weights.add(Math.round(calculatePhiWeight(i, 5) * 1000));
      }
      // Weights should not all be the same
      expect(weights.size).toBeGreaterThan(1);
    });
  });

  describe('calculatePauseDuration', () => {
    it('should return base pause for weight 0', () => {
      const basePause = 0.3;
      const result = calculatePauseDuration(0, basePause);
      expect(result).toBeCloseTo(basePause, 5);
    });

    it('should increase pause for higher weights', () => {
      const lowWeight = calculatePauseDuration(0.2, 0.3);
      const highWeight = calculatePauseDuration(0.8, 0.3);
      expect(highWeight).toBeGreaterThan(lowWeight);
    });

    it('should use φ-proportions for scaling', () => {
      const weight = 1.0;
      const basePause = 0.3;
      const result = calculatePauseDuration(weight, basePause);
      // Maximum pause should be basePause * φ
      expect(result).toBeCloseTo(basePause * PHI, 5);
    });
  });
});

describe('TTS Types', () => {
  describe('resolveTTSConfig', () => {
    it('should fill in default values', () => {
      const partial: TTSConfig = { apiKey: 'test-key' };
      const resolved = resolveTTSConfig(partial);
      
      expect(resolved.apiKey).toBe('test-key');
      expect(resolved.model).toBe('tts-1');
      expect(resolved.defaultVoice).toBe('nova');
      expect(resolved.format).toBe('mp3');
      expect(resolved.speed).toBe(1.0);
      expect(resolved.timeout).toBe(30000);
      expect(resolved.maxRetries).toBe(3);
    });

    it('should preserve provided values', () => {
      const partial: TTSConfig = {
        apiKey: 'test-key',
        model: 'tts-1-hd',
        defaultVoice: 'onyx',
        format: 'wav',
        speed: 1.5,
      };
      const resolved = resolveTTSConfig(partial);
      
      expect(resolved.model).toBe('tts-1-hd');
      expect(resolved.defaultVoice).toBe('onyx');
      expect(resolved.format).toBe('wav');
      expect(resolved.speed).toBe(1.5);
    });
  });

  describe('getVoiceForStyle', () => {
    it('should map calm to echo', () => {
      expect(getVoiceForStyle('calm')).toBe('echo');
    });

    it('should map warm to nova', () => {
      expect(getVoiceForStyle('warm')).toBe('nova');
    });

    it('should map focused to alloy', () => {
      expect(getVoiceForStyle('focused')).toBe('alloy');
    });

    it('should map resonant to onyx', () => {
      expect(getVoiceForStyle('resonant')).toBe('onyx');
    });

    it('should map radiant to shimmer', () => {
      expect(getVoiceForStyle('radiant')).toBe('shimmer');
    });
  });

  describe('LANE_STYLE_VOICE_MAP', () => {
    it('should have all lane styles mapped', () => {
      const styles = ['calm', 'warm', 'focused', 'resonant', 'radiant'];
      styles.forEach(style => {
        expect(LANE_STYLE_VOICE_MAP[style as keyof typeof LANE_STYLE_VOICE_MAP]).toBeDefined();
      });
    });
  });
});
