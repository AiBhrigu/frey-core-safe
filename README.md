# Frey Core Safe

**Frey Core** — φ-based engines for voice synthesis and wave visualization.

- **Φ-Voice Engine (v0.3)**: Transform plain text + phi-passport into TTS templates
- **Φ-Harmonic Wavefield Engine (v5.0)**: Zero-GC wave computation and rendering

---

## Φ-Voice Engine

Transform plain text + phi-passport into structured voice response templates suitable for TTS.

### Features

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

### Installation

```bash
npm install frey-core-safe
```

### Usage

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

---

## Φ-Harmonic Wavefield Engine (v5.0)

A zero-GC render system using golden ratio (φ) based harmonics for natural wave pattern generation and visualization.

### Features

- **WaveKernel**: Core wave computation with pre-allocated buffers
- **PhiHarmonicMap**: Harmonic frequency mapping based on φ (φ^n scaling)
- **WaveFieldRenderer**: Zero-GC canvas renderer with multiple modes
- **WaveLayer**: Layer composition with blend modes
- **PhiSyncBus**: Event synchronization for component coordination
- **AmplitudeController**: Amplitude control with envelope (attack/release)
- **PhaseController**: Phase control with φ-grid synchronization
- **SurfaceRoot**: Main orchestrator integrating all components

### Zero-GC Design

The engine is designed for smooth 60fps+ rendering with no garbage collection during render loops:

- Pre-allocated Float32Array buffers for wave data
- Object pooling and buffer reuse
- No object allocations in hot paths
- Deterministic φ-based mathematics

### Usage

```typescript
import { 
  createSurfaceRoot,
  createWaveKernel,
  createPhiHarmonicMap,
  PHI,
  PHI_ANGLE
} from 'frey-core-safe';

// Create the main surface
const surface = createSurfaceRoot({
  width: 800,
  height: 600,
  targetFps: 60,
  autoStart: true,
});

// Initialize with a canvas element
surface.init('my-canvas');

// Start rendering
surface.start();

// Control amplitude
surface.setAmplitude(0.8);

// Change render mode
surface.setRenderMode('gradient'); // 'points' | 'lines' | 'mesh' | 'gradient'

// Apply preset
surface.applyPreset('harmonic'); // 'default' | 'calm' | 'energetic' | 'harmonic' | 'chaos'
```

### Working with Individual Components

```typescript
import {
  createWaveKernel,
  createPhiHarmonicMap,
  createPhiLayerStack,
  createAmplitudeController,
  createPhaseController,
} from 'frey-core-safe';

// Create harmonic map with base frequency
const harmonicMap = createPhiHarmonicMap(0.5, 8);

// Get harmonics
const fundamental = harmonicMap.getHarmonic(0);
const firstHarmonic = harmonicMap.getHarmonic(1);

console.log('Fundamental frequency ratio:', fundamental.frequencyRatio); // 1
console.log('First harmonic frequency ratio:', firstHarmonic.frequencyRatio); // φ ≈ 1.618

// Create wave kernel
const kernel = createWaveKernel({ resolution: 64 }, harmonicMap);

// Compute frame
const frameData = kernel.compute(performance.now());
console.log('Amplitudes:', frameData.amplitudes);
console.log('Phases:', frameData.phases);

// Create φ-based layer stack
const layers = createPhiLayerStack(0.5, 5, 64);
// Creates 5 layers with φ-scaled frequencies and φ-decayed amplitudes
```

### Demo Page

Generate a standalone HTML demo page:

```typescript
import { generateDemoHTML, getDemoConfig } from 'frey-core-safe';

// Get preset configuration
const config = getDemoConfig('harmonic');
console.log(config);
// { preset: 'harmonic', layerCount: 5, baseFrequency: 0.618, ... }

// Generate full HTML page
const html = generateDemoHTML({
  preset: 'default',
  showControls: true,
  showStats: true,
});

// Write to file or serve
// fs.writeFileSync('phi-wave-demo.html', html);
```

### Render Modes

| Mode | Description |
|------|-------------|
| `points` | Individual points sized by amplitude |
| `lines` | Horizontal waveform lines |
| `mesh` | Connected mesh grid |
| `gradient` | Filled gradient cells |

### Color Schemes

| Scheme | Description |
|--------|-------------|
| `phi-spectrum` | φ-based hue rotation |
| `monochrome` | Grayscale intensity |
| `heat` | Black → Red → Yellow → White |

### Presets

| Preset | Layers | Base Frequency | Character |
|--------|--------|----------------|-----------|
| `default` | 5 | 0.5 Hz | Balanced |
| `calm` | 3 | 0.2 Hz | Peaceful |
| `energetic` | 8 | 1.5 Hz | Dynamic |
| `harmonic` | 5 | 0.618 Hz (1/φ) | Resonant |
| `chaos` | 12 | 2.0 Hz | Complex |

---

## API Reference

### Voice Engine Types

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

### Wavefield Engine Types

#### `WaveKernelConfig`
```typescript
interface WaveKernelConfig {
  resolution: number;    // Grid points per axis (default: 64)
  width: number;         // Field width (default: 1.0)
  height: number;        // Field height (default: 1.0)
  timeScale: number;     // Time multiplier (default: 1.0)
  damping: number;       // Damping factor 0-1 (default: 0.98)
}
```

#### `WaveLayerConfig`
```typescript
interface WaveLayerConfig {
  id: string;                    // Layer identifier
  harmonicMultiplier: number;    // φ-based frequency multiplier
  baseFrequency: number;         // Base frequency (Hz)
  amplitudeScale: number;        // Amplitude scale (0-1)
  phaseOffset: number;           // Phase offset (radians)
  blendMode: 'add' | 'multiply' | 'screen' | 'overlay';
  opacity: number;               // Layer opacity (0-1)
  enabled: boolean;              // Enable state
}
```

#### `PhiHarmonic`
```typescript
interface PhiHarmonic {
  index: number;           // Harmonic index (0 = fundamental)
  frequencyRatio: number;  // φ^index
  amplitudeRatio: number;  // φ^(-index)
  phaseShift: number;      // Golden angle × index
}
```

### Voice Engine Functions

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

### Wavefield Engine Functions

| Function | Description |
|----------|-------------|
| `createSurfaceRoot(config)` | Create main orchestrator |
| `createWaveKernel(config, harmonicMap)` | Create wave computation kernel |
| `createPhiHarmonicMap(baseFreq, count)` | Create harmonic map |
| `createWaveLayer(config, resolution)` | Create single wave layer |
| `createPhiLayerStack(baseFreq, count, res)` | Create φ-scaled layer stack |
| `createPhiSyncBus(ticksPerSec)` | Create sync event bus |
| `createAmplitudeController()` | Create amplitude controller |
| `createPhaseController()` | Create phase controller |
| `createWaveFieldRenderer(options)` | Create canvas renderer |
| `generateDemoHTML(config)` | Generate demo HTML page |
| `getDemoConfig(preset)` | Get preset configuration |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `PHI` | 1.618033988749895 | The golden ratio |
| `PHI_INV` | 0.618033988749895 | Inverse golden ratio (1/φ) |
| `PHI_ANGLE` | 2.399963229728653 | Golden angle (2π/φ²) |
| `VOICE_ENGINE_VERSION` | '0.3.0' | Voice engine version |

---

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

This library follows φ-structure principles:

1. **Clarity**: Clean, well-documented APIs
2. **Modularity**: Separate concerns (voice, waves, rendering)
3. **Resonance Layers**: Configurable depth for layered effects
4. **Deterministic Math**: Reproducible φ-based calculations
5. **Zero-GC**: Pre-allocated buffers for smooth rendering

## License

MIT
