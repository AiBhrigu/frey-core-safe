# Frey Core Safe - Φ-Voice Output Module

TTS Connector for converting voice_engine output into real audio bytes via OpenAI TTS.

## Features

- **OpenAI TTS Integration**: Converts text to speech using OpenAI's TTS API
- **Φ-Logic Processing**: Implements golden ratio (φ ≈ 1.618) based timing and weighting
- **Lane Style Mapping**: Maps voice styles to appropriate OpenAI voices
- **Flexible Configuration**: Support for multiple audio formats, voice selection, and speed control

## Installation

```bash
npm install
```

## Usage

```typescript
import { TTSConnector, VoiceTemplate, PhiPassport } from 'frey-core-safe';

// Create the TTS connector with your OpenAI API key
const connector = new TTSConnector({
  apiKey: 'your-openai-api-key',
  model: 'tts-1',        // or 'tts-1-hd' for higher quality
  format: 'mp3',         // supported: mp3, opus, aac, flac, wav, pcm
  speed: 1.0,            // 0.25 to 4.0
});

// Create a voice template (typically from voice_engine)
const template: VoiceTemplate = {
  passport: {
    id: 'frey-voice-1',
    name: 'Frey',
    style: 'warm',       // calm, warm, focused, resonant, radiant
    speed: 1.0,
  },
  segments: [
    {
      text: 'Hello, welcome to Frey.',
      index: 0,
      phiWeight: 0.618,
      pauseAfter: 0.3,
      emphasis: 0.5,
    },
  ],
  estimatedDuration: 2.5,
  createdAt: new Date().toISOString(),
  version: '1.0.0',
};

// Synthesize the template to audio
const result = await connector.synthesize(template);

// result.audio is a Buffer containing the audio data
fs.writeFileSync('output.mp3', result.audio);
```

### Direct Text Synthesis

```typescript
// Synthesize raw text without a template
const audio = await connector.synthesizeText('Hello, world!', {
  voice: 'nova',
  speed: 1.0,
});
```

### Segment-by-Segment Processing

```typescript
// Synthesize individual segments for streaming
const audio = await connector.synthesizeSegment(segment, passport, {
  voice: 'echo',
  speed: 0.9,
});
```

## Lane Style to Voice Mapping

| Lane Style | OpenAI Voice | Characteristics |
|------------|--------------|-----------------|
| calm       | echo         | Warm, resonant |
| warm       | nova         | Friendly, upbeat |
| focused    | alloy        | Balanced, neutral |
| resonant   | onyx         | Deep, authoritative |
| radiant    | shimmer      | Clear, bright |

## Φ-Logic Functions

### calculatePhiWeight(index, total)

Calculates the golden ratio-based weight for a segment based on its position.

### calculatePauseDuration(segmentWeight, basePause)

Calculates pause duration using φ-proportions for natural rhythm.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | required | OpenAI API key |
| model | 'tts-1' \| 'tts-1-hd' | 'tts-1' | TTS model |
| defaultVoice | OpenAIVoice | 'nova' | Default voice |
| format | AudioFormat | 'mp3' | Audio output format |
| speed | number | 1.0 | Speech speed (0.25-4.0) |
| timeout | number | 30000 | Request timeout (ms) |
| maxRetries | number | 3 | Max retries on failure |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Type check
npm run lint
```

## License

ISC © ORION Φ-Lab
