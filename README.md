# Frey Voice Engine (v0.3)

**Φ-Voice Engine** — Transform plain text + phi-passport into structured voice response templates suitable for TTS.

## Features

- **Lane Styles**: Voice style presets with distinct characteristics
  - `calm` - Peaceful and measured delivery
  - `urgent` - Quick and impactful delivery
  - `poetic` - Expressive and flowing delivery
  - `analytical` - Clear and precise delivery
  - `warm` - Friendly and inviting delivery
  - `neutral` - Balanced and professional delivery

- **Golden Segments**: φ-based text segmentation using the golden ratio (1.618...)
  - Natural rhythm and flow in speech
  - Segment types: primary, secondary, tertiary
  - Duration weights based on golden ratio

- **Phi-Passport**: Identity configuration for voice generation
  - Style blending support
  - Rate and pitch overrides
  - Resonance depth control (1-3 layers)

## Installation

```bash
npm install frey-core-safe
```

## Usage

```typescript
import { generateVoiceTemplate, createPhiPassport } from 'frey-core-safe';

// Create a phi-passport
const passport = createPhiPassport('user-001', 'Demo User', 'warm');

// Generate voice template
const result = generateVoiceTemplate({
  text: 'Welcome to the Frey Voice Engine. Experience natural speech synthesis with golden ratio timing.',
  passport,
});

if (result.success) {
  console.log('Template generated:', result.template);
  console.log('Segments:', result.template.segments);
  console.log('Estimated duration:', result.template.estimatedDurationMs, 'ms');
}
```

### Advanced Usage with Style Blending

```typescript
import { generateVoiceTemplate } from 'frey-core-safe';

const result = generateVoiceTemplate({
  text: 'Your message here.',
  passport: {
    id: 'user-002',
    name: 'Blended User',
    primaryStyle: 'calm',
    secondaryStyle: 'urgent',
    blendRatio: 0.3,  // 70% calm, 30% urgent
    resonanceDepth: 3,
  },
});
```

### Working with Lane Styles

```typescript
import { getLaneStyle, getAllLaneStyles, blendLaneStyles, isValidLaneStyleId } from 'frey-core-safe';

// Get a specific style
const calmStyle = getLaneStyle('calm');
console.log(calmStyle);
// { id: 'calm', name: 'Calm', rate: 0.9, pitch: 0.95, ... }

// Get all available styles
const allStyles = getAllLaneStyles();

// Blend two styles
const blended = blendLaneStyles('calm', 'urgent', 0.5);

// Validate style ID
if (isValidLaneStyleId('warm')) {
  console.log('Valid style!');
}
```

### Working with Golden Segments

```typescript
import { createGoldenSegments, getLaneStyle, PHI } from 'frey-core-safe';

const style = getLaneStyle('neutral');
const segments = createGoldenSegments(
  'Your text here. Another sentence for demonstration.',
  style,
  2  // resonance depth
);

console.log('Golden ratio (φ):', PHI);  // 1.618033988749895

for (const segment of segments) {
  console.log(`[${segment.type}] ${segment.text}`);
  console.log(`  Duration weight: ${segment.durationWeight}`);
  console.log(`  Pause after: ${segment.pauseAfterMs}ms`);
}
```

## API Reference

### Types

#### `PhiPassport`
```typescript
interface PhiPassport {
  id: string;                        // Unique identifier
  name: string;                      // Display name
  primaryStyle: LaneStyleId;         // Primary voice style
  secondaryStyle?: LaneStyleId;      // Optional secondary style
  blendRatio?: number;               // Blend ratio (0-1)
  rateOverride?: number;             // Custom rate
  pitchOverride?: number;            // Custom pitch
  resonanceDepth?: 1 | 2 | 3;        // Segment layering depth
}
```

#### `VoiceTemplate`
```typescript
interface VoiceTemplate {
  version: string;                   // Engine version
  passportId: string;                // Source passport ID
  appliedStyle: LaneStyle;           // Applied voice style
  segments: GoldenSegment[];         // Segmented text
  estimatedDurationMs: number;       // Estimated duration
  metadata: {
    segmentCount: number;
    avgWordsPerSegment: number;
    resonanceDepth: number;
    generatedAt: string;
  };
}
```

#### `GoldenSegment`
```typescript
interface GoldenSegment {
  index: number;                     // Segment index
  text: string;                      // Text content
  durationWeight: number;            // φ-based weight
  pauseAfterMs: number;              // Pause duration
  emphasis: number;                  // Emphasis level
  type: 'primary' | 'secondary' | 'tertiary';
}
```

### Functions

| Function | Description |
|----------|-------------|
| `generateVoiceTemplate(input)` | Generate voice template from text + passport |
| `createPhiPassport(id, name, style)` | Create a new phi-passport |
| `getLaneStyle(id)` | Get a lane style by ID |
| `getAllLaneStyles()` | Get all available lane styles |
| `blendLaneStyles(primary, secondary, ratio)` | Blend two styles |
| `isValidLaneStyleId(id)` | Validate a style ID |
| `createGoldenSegments(text, style, depth)` | Create golden segments |
| `estimateTotalDuration(segments, style)` | Estimate total duration |
| `calculateAvgWordsPerSegment(segments)` | Calculate average words |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `PHI` | 1.618033988749895 | The golden ratio |
| `VOICE_ENGINE_VERSION` | '0.3.0' | Engine version |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch tests
npm run test:watch
```

## Φ-Structure Principles

This engine follows φ-structure principles:

1. **Clarity**: Clean, well-documented API
2. **Modularity**: Separate concerns (styles, segments, engine)
3. **Resonance Layers**: Configurable depth for segment classification

## License

MIT
