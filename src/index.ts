/**
 * Frey Core Safe - Φ-Voice Output Module
 * 
 * TTS Connector for converting voice_engine output into real audio bytes
 * via OpenAI TTS. Implements φ-logic for natural audio processing.
 * 
 * @packageDocumentation
 */

// Export TTS connector and types
export { TTSConnector, TTSResult, TTSError, SegmentSynthesisOptions } from './tts';

// Export all types
export {
  // Voice types
  VoiceTemplate,
  VoiceSegment,
  PhiPassport,
  LaneStyle,
  PHI,
  calculatePhiWeight,
  calculatePauseDuration,
  
  // TTS configuration types
  TTSConfig,
  ResolvedTTSConfig,
  OpenAIVoice,
  AudioFormat,
  TTSModel,
  DEFAULT_TTS_CONFIG,
  LANE_STYLE_VOICE_MAP,
  resolveTTSConfig,
  getVoiceForStyle,
} from './types';
