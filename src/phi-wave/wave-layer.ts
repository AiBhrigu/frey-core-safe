/**
 * WaveLayer - Wave layer composition
 * 
 * Manages individual wave layers that can be combined
 * for complex wave field effects.
 */

import type { WaveLayerConfig, WaveFrameData } from './types.js';
import { PHI, PHI_INV } from './types.js';
import { WaveKernel, createWaveKernel } from './wave-kernel.js';
import { PhiHarmonicMap } from './phi-harmonic-map.js';

/**
 * Default layer configuration
 */
const DEFAULT_LAYER_CONFIG: WaveLayerConfig = {
  id: 'default',
  harmonicMultiplier: 1.0,
  baseFrequency: 1.0,
  amplitudeScale: 1.0,
  phaseOffset: 0,
  blendMode: 'add',
  opacity: 1.0,
  enabled: true,
};

/**
 * WaveLayer class for individual wave layers
 */
export class WaveLayer {
  private readonly config: WaveLayerConfig;
  private readonly kernel: WaveKernel;
  private readonly harmonicMap: PhiHarmonicMap;
  
  // Pre-allocated output buffer
  private readonly outputAmplitudes: Float32Array;
  
  constructor(config: Partial<WaveLayerConfig> = {}, resolution: number = 64) {
    this.config = { ...DEFAULT_LAYER_CONFIG, ...config };
    
    // Create harmonic map with φ-scaled frequency
    this.harmonicMap = new PhiHarmonicMap(
      this.config.baseFrequency * this.config.harmonicMultiplier,
      8
    );
    
    // Create kernel for this layer
    this.kernel = createWaveKernel({ resolution }, this.harmonicMap);
    
    // Pre-allocate output buffer
    this.outputAmplitudes = new Float32Array(this.kernel.getPointCount());
  }
  
  /**
   * Compute layer at given timestamp
   * Returns pre-allocated amplitude buffer (zero-GC)
   */
  compute(timestamp: number): Float32Array {
    if (!this.config.enabled) {
      // Return zeroed buffer
      this.outputAmplitudes.fill(0);
      return this.outputAmplitudes;
    }
    
    // Compute kernel
    const frameData = this.kernel.compute(timestamp);
    
    // Apply layer transformations
    const scale = this.config.amplitudeScale * this.config.opacity;
    const phaseOffset = this.config.phaseOffset;
    
    for (let i = 0; i < this.outputAmplitudes.length; i++) {
      // Get base amplitude and apply phase offset
      const phase = frameData.phases[i] + phaseOffset;
      const amplitude = frameData.amplitudes[i];
      
      // Apply scale with phase-modulated amplitude
      this.outputAmplitudes[i] = amplitude * scale * (0.5 + 0.5 * Math.cos(phase));
    }
    
    return this.outputAmplitudes;
  }
  
  /**
   * Blend this layer's amplitudes with a target buffer
   */
  blendInto(target: Float32Array, source: Float32Array): void {
    if (!this.config.enabled) return;
    
    const opacity = this.config.opacity;
    
    switch (this.config.blendMode) {
      case 'add':
        for (let i = 0; i < target.length; i++) {
          target[i] += source[i] * opacity;
        }
        break;
        
      case 'multiply':
        for (let i = 0; i < target.length; i++) {
          target[i] *= 1 + (source[i] - 1) * opacity;
        }
        break;
        
      case 'screen':
        for (let i = 0; i < target.length; i++) {
          const t = (target[i] + 1) / 2; // Normalize to 0-1
          const s = (source[i] + 1) / 2;
          const result = 1 - (1 - t) * (1 - s * opacity);
          target[i] = result * 2 - 1; // Back to -1..1
        }
        break;
        
      case 'overlay':
        for (let i = 0; i < target.length; i++) {
          const t = (target[i] + 1) / 2;
          const s = (source[i] + 1) / 2;
          const result = t < 0.5
            ? 2 * t * s * opacity
            : 1 - 2 * (1 - t) * (1 - s * opacity);
          target[i] = result * 2 - 1;
        }
        break;
    }
  }
  
  /**
   * Get the layer ID
   */
  getId(): string {
    return this.config.id;
  }
  
  /**
   * Get the layer config
   */
  getConfig(): Readonly<WaveLayerConfig> {
    return this.config;
  }
  
  /**
   * Set enabled state
   */
  setEnabled(enabled: boolean): void {
    (this.config as WaveLayerConfig).enabled = enabled;
  }
  
  /**
   * Set opacity
   */
  setOpacity(opacity: number): void {
    (this.config as WaveLayerConfig).opacity = Math.max(0, Math.min(1, opacity));
  }
  
  /**
   * Set amplitude scale
   */
  setAmplitudeScale(scale: number): void {
    (this.config as WaveLayerConfig).amplitudeScale = scale;
  }
  
  /**
   * Set phase offset
   */
  setPhaseOffset(offset: number): void {
    (this.config as WaveLayerConfig).phaseOffset = offset;
  }
  
  /**
   * Reset the layer
   */
  reset(): void {
    this.kernel.reset();
    this.outputAmplitudes.fill(0);
  }
  
  /**
   * Get point count
   */
  getPointCount(): number {
    return this.kernel.getPointCount();
  }
}

/**
 * Create a WaveLayer with configuration
 */
export function createWaveLayer(
  config?: Partial<WaveLayerConfig>,
  resolution?: number
): WaveLayer {
  return new WaveLayer(config, resolution);
}

/**
 * Create φ-based layer stack (fundamental + harmonics)
 */
export function createPhiLayerStack(
  baseFrequency: number = 1.0,
  layerCount: number = 5,
  resolution: number = 64
): WaveLayer[] {
  const layers: WaveLayer[] = [];
  
  for (let i = 0; i < layerCount; i++) {
    const harmonicMultiplier = Math.pow(PHI, i);
    const amplitudeScale = Math.pow(PHI_INV, i);
    
    layers.push(createWaveLayer({
      id: `phi-layer-${i}`,
      harmonicMultiplier,
      baseFrequency,
      amplitudeScale,
      phaseOffset: (i * Math.PI * PHI_INV) % (2 * Math.PI),
      blendMode: 'add',
      opacity: 1.0,
      enabled: true,
    }, resolution));
  }
  
  return layers;
}
