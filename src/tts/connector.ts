/**
 * TTS Connector - Φ-Voice Output Module
 * 
 * Converts VoiceTemplate output from the voice engine into real audio bytes
 * using OpenAI's TTS API. Implements φ-logic for audio processing.
 */

import OpenAI from 'openai';
import type { 
  VoiceTemplate, 
  VoiceSegment,
  PhiPassport,
  PHI 
} from '../types/voice.types';
import { 
  TTSConfig, 
  ResolvedTTSConfig,
  resolveTTSConfig,
  getVoiceForStyle,
  AudioFormat,
  OpenAIVoice,
} from '../types/tts.types';

/**
 * Result of a TTS synthesis operation.
 */
export interface TTSResult {
  /** The synthesized audio data */
  audio: Buffer;
  /** Audio format of the result */
  format: AudioFormat;
  /** The text that was synthesized */
  text: string;
  /** Duration estimate in seconds */
  durationEstimate: number;
  /** Voice used for synthesis */
  voice: OpenAIVoice;
  /** Metadata about the synthesis */
  metadata: {
    model: string;
    speed: number;
    segmentCount: number;
    timestamp: string;
  };
}

/**
 * Options for synthesizing a single segment.
 */
export interface SegmentSynthesisOptions {
  /** Override the voice for this segment */
  voice?: OpenAIVoice;
  /** Override the speed for this segment */
  speed?: number;
}

/**
 * Error thrown when TTS synthesis fails.
 */
export class TTSError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'TTSError';
  }
}

/**
 * TTS Connector Class - Main interface for text-to-speech synthesis.
 * 
 * @example
 * ```typescript
 * const connector = new TTSConnector({ apiKey: 'your-api-key' });
 * const result = await connector.synthesize(voiceTemplate);
 * fs.writeFileSync('output.mp3', result.audio);
 * ```
 */
export class TTSConnector {
  private readonly config: ResolvedTTSConfig;
  private readonly client: OpenAI;

  /**
   * Create a new TTS Connector instance.
   * 
   * @param config - TTS configuration options
   */
  constructor(config: TTSConfig) {
    this.config = resolveTTSConfig(config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Synthesize a complete VoiceTemplate into audio.
   * Processes all segments and combines them into a single audio buffer.
   * 
   * @param template - The voice template to synthesize
   * @returns Promise resolving to the synthesized audio result
   */
  async synthesize(template: VoiceTemplate): Promise<TTSResult> {
    if (!template || !template.segments || template.segments.length === 0) {
      throw new TTSError('Voice template must have at least one segment', 'EMPTY_TEMPLATE');
    }

    // Get the voice based on passport style
    const voice = getVoiceForStyle(template.passport.style, this.config.defaultVoice);
    
    // Apply φ-adjusted speed from passport
    const baseSpeed = this.applyPhiSpeed(template.passport.speed);

    // Combine all segment texts with appropriate spacing
    const fullText = this.combineSegments(template.segments);

    try {
      const audio = await this.synthesizeText(fullText, { voice, speed: baseSpeed });
      
      return {
        audio,
        format: this.config.format,
        text: fullText,
        durationEstimate: template.estimatedDuration,
        voice,
        metadata: {
          model: this.config.model,
          speed: baseSpeed,
          segmentCount: template.segments.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof TTSError) throw error;
      throw new TTSError(
        'Failed to synthesize voice template',
        'SYNTHESIS_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Synthesize a single segment of text.
   * Useful for streaming or segment-by-segment processing.
   * 
   * @param segment - The voice segment to synthesize
   * @param passport - The phi-passport for voice configuration
   * @param options - Optional synthesis parameters
   * @returns Promise resolving to the audio buffer
   */
  async synthesizeSegment(
    segment: VoiceSegment,
    passport: PhiPassport,
    options?: SegmentSynthesisOptions
  ): Promise<Buffer> {
    const voice = options?.voice ?? getVoiceForStyle(passport.style, this.config.defaultVoice);
    const speed = options?.speed ?? this.applyPhiSpeed(passport.speed * (1 + segment.emphasis * 0.1));

    return this.synthesizeText(segment.text, { voice, speed });
  }

  /**
   * Synthesize raw text directly without a template.
   * 
   * @param text - The text to synthesize
   * @param options - Voice and speed options
   * @returns Promise resolving to the audio buffer
   */
  async synthesizeText(
    text: string,
    options?: { voice?: OpenAIVoice; speed?: number }
  ): Promise<Buffer> {
    if (!text || text.trim().length === 0) {
      throw new TTSError('Text cannot be empty', 'EMPTY_TEXT');
    }

    const voice = options?.voice ?? this.config.defaultVoice;
    const speed = this.clampSpeed(options?.speed ?? this.config.speed);

    try {
      const response = await this.client.audio.speech.create({
        model: this.config.model,
        voice,
        input: text,
        speed,
        response_format: this.config.format,
      });

      // Convert the response to a Buffer
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new TTSError(
          `OpenAI API error: ${error.message}`,
          error.code ?? 'API_ERROR',
          error
        );
      }
      throw new TTSError(
        'Unexpected error during TTS synthesis',
        'UNKNOWN_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Combine voice segments into a single text string.
   * Preserves natural pausing through punctuation.
   * 
   * @param segments - Array of voice segments
   * @returns Combined text string
   */
  private combineSegments(segments: VoiceSegment[]): string {
    return segments
      .sort((a, b) => a.index - b.index)
      .map(segment => segment.text.trim())
      .filter(text => text.length > 0)
      .join(' ');
  }

  /**
   * Apply φ-logic to speed adjustment.
   * Uses golden ratio to create natural-feeling speed variations.
   * 
   * @param speed - Input speed value
   * @returns φ-adjusted speed value
   */
  private applyPhiSpeed(speed: number): number {
    // The golden ratio (PHI ≈ 1.618) represents balanced proportion
    // We use it to subtly adjust speed toward natural speech rhythm
    const PHI_VALUE = 1.618033988749895;
    const PHI_INVERSE = 1 / PHI_VALUE; // ≈ 0.618
    
    // Center the speed around 1.0 using φ-proportions
    // This creates a more natural-feeling adjustment curve
    if (speed >= 1.0) {
      // For faster speeds, use φ to temper the increase
      return 1.0 + (speed - 1.0) * PHI_INVERSE;
    } else {
      // For slower speeds, use φ-inverse to temper the decrease
      return 1.0 - (1.0 - speed) * PHI_INVERSE;
    }
  }

  /**
   * Clamp speed to OpenAI's acceptable range (0.25 to 4.0).
   * 
   * @param speed - Input speed value
   * @returns Clamped speed value
   */
  private clampSpeed(speed: number): number {
    return Math.max(0.25, Math.min(4.0, speed));
  }

  /**
   * Get the current configuration (read-only).
   */
  get configuration(): Readonly<ResolvedTTSConfig> {
    return { ...this.config };
  }
}

export default TTSConnector;
