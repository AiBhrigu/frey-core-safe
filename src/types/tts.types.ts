/**
 * TTS Configuration Types - OpenAI TTS Connector settings
 * 
 * Defines the configuration options for the TTS connector,
 * mapping voice engine concepts to OpenAI TTS parameters.
 */

/**
 * OpenAI TTS voices available.
 * Each voice has distinct characteristics.
 */
export type OpenAIVoice = 
  | 'alloy'   // Balanced, neutral
  | 'echo'    // Warm, resonant
  | 'fable'   // British, storytelling
  | 'onyx'    // Deep, authoritative
  | 'nova'    // Friendly, upbeat
  | 'shimmer'; // Clear, feminine

/**
 * Supported audio output formats.
 */
export type AudioFormat = 
  | 'mp3'
  | 'opus'
  | 'aac'
  | 'flac'
  | 'wav'
  | 'pcm';

/**
 * TTS model selection.
 */
export type TTSModel = 
  | 'tts-1'        // Standard quality, faster
  | 'tts-1-hd';    // High definition, slower

/**
 * Configuration for the TTS connector.
 */
export interface TTSConfig {
  /** OpenAI API key (required) */
  apiKey: string;
  /** TTS model to use (default: 'tts-1') */
  model?: TTSModel;
  /** Default voice (default: 'nova') */
  defaultVoice?: OpenAIVoice;
  /** Output format (default: 'mp3') */
  format?: AudioFormat;
  /** Speech speed multiplier (0.25 to 4.0, default: 1.0) */
  speed?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum retries on failure (default: 3) */
  maxRetries?: number;
}

/**
 * Resolved configuration with all defaults applied.
 */
export interface ResolvedTTSConfig {
  apiKey: string;
  model: TTSModel;
  defaultVoice: OpenAIVoice;
  format: AudioFormat;
  speed: number;
  timeout: number;
  maxRetries: number;
}

/**
 * Default configuration values.
 */
export const DEFAULT_TTS_CONFIG: Omit<ResolvedTTSConfig, 'apiKey'> = {
  model: 'tts-1',
  defaultVoice: 'nova',
  format: 'mp3',
  speed: 1.0,
  timeout: 30000,
  maxRetries: 3,
};

/**
 * Mapping from lane styles to OpenAI voices.
 * Provides semantic mapping for voice selection based on style.
 */
import type { LaneStyle } from './voice.types';

export const LANE_STYLE_VOICE_MAP: Record<LaneStyle, OpenAIVoice> = {
  calm: 'echo',      // Warm, resonant for calm delivery
  warm: 'nova',      // Friendly, upbeat for warm tone
  focused: 'alloy',  // Balanced, neutral for focused clarity
  resonant: 'onyx',  // Deep, authoritative for resonant presence
  radiant: 'shimmer', // Clear, bright for radiant energy
};

/**
 * Resolve partial configuration to full configuration with defaults.
 * 
 * @param config - Partial TTS configuration
 * @returns Fully resolved configuration
 */
export function resolveTTSConfig(config: TTSConfig): ResolvedTTSConfig {
  return {
    ...DEFAULT_TTS_CONFIG,
    ...config,
  };
}

/**
 * Get the appropriate OpenAI voice for a lane style.
 * 
 * @param style - The lane style
 * @param defaultVoice - Fallback voice if mapping not found
 * @returns The corresponding OpenAI voice
 */
export function getVoiceForStyle(style: LaneStyle, defaultVoice: OpenAIVoice = 'nova'): OpenAIVoice {
  return LANE_STYLE_VOICE_MAP[style] ?? defaultVoice;
}
