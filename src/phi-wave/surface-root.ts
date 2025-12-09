/**
 * SurfaceRoot - Main integration point for Φ-Harmonic Wavefield Engine
 * 
 * Orchestrates all wave components into a unified rendering system
 * with requestAnimationFrame-based zero-GC render loop.
 * 
 * @tag q7-integrated
 * @tag q7.1-preset-hotswitch
 * @tag q7.3-signature-engine
 * @tag q7.3-pattern-classifier
 */

import type { SurfaceRootConfig, PhiWaveDemoConfig, RendererOptions } from './types.js';
import { PHI } from './types.js';
import { WaveKernel, createWaveKernel } from './wave-kernel.js';
import { WaveLayer, createPhiLayerStack } from './wave-layer.js';
import { PhiHarmonicMap, createPhiHarmonicMap } from './phi-harmonic-map.js';
import { PhiSyncBus, createPhiSyncBus } from './phi-sync-bus.js';
import { AmplitudeController, createAmplitudeController } from './amplitude-controller.js';
import { PhaseController, createPhaseController } from './phase-controller.js';
import { WaveFieldRenderer, createWaveFieldRenderer } from './wave-field-renderer.js';
import { PhiPresetHotSwitch, createPresetHotSwitch, type PresetId } from './preset-hotswitch.js';
import { WaveSignatureEngine, createSignatureEngine, type WaveSignature } from './signature-engine.js';
import { PhiPatternClassifier, createPatternClassifier, type PatternClassification } from './pattern-classifier.js';

/**
 * Q7 Integration Version
 */
export const Q7_VERSION = '7.0.0';

/**
 * Default surface configuration
 */
const DEFAULT_CONFIG: SurfaceRootConfig = {
  canvas: 'phi-wave-canvas',
  width: 800,
  height: 600,
  pixelRatio: 1,
  autoStart: false,
  targetFps: 60,
};



/**
 * SurfaceRoot class - main engine orchestrator
 */
export class SurfaceRoot {
  private readonly config: SurfaceRootConfig;
  private canvas: HTMLCanvasElement | null = null;
  
  // Core components
  private kernel: WaveKernel;
  private layers: WaveLayer[];
  private harmonicMap: PhiHarmonicMap;
  private syncBus: PhiSyncBus;
  private amplitudeController: AmplitudeController;
  private phaseController: PhaseController;
  private renderer: WaveFieldRenderer;
  
  // Q7.1 - Preset HotSwitch
  private presetHotSwitch: PhiPresetHotSwitch;
  
  // Q7.3 - Signature Engine
  private signatureEngine: WaveSignatureEngine;
  private lastSignature: WaveSignature | null = null;
  
  // Q7.3-P - Pattern Classifier
  private patternClassifier: PhiPatternClassifier;
  private lastPattern: PatternClassification | null = null;
  
  // Render loop state
  private running: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameInterval: number;
  
  // Pre-allocated buffer for layer composition
  private compositeBuffer: Float32Array;
  private readonly resolution: number = 64;
  
  constructor(config: Partial<SurfaceRootConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.frameInterval = this.config.targetFps > 0 ? 1000 / this.config.targetFps : 0;
    
    // Initialize components
    this.harmonicMap = createPhiHarmonicMap(0.5, 8);
    this.kernel = createWaveKernel({ resolution: this.resolution }, this.harmonicMap);
    this.layers = createPhiLayerStack(0.5, 5, this.resolution);
    this.syncBus = createPhiSyncBus(60);
    this.amplitudeController = createAmplitudeController();
    this.phaseController = createPhaseController();
    this.renderer = createWaveFieldRenderer({ debug: false });
    
    // Q7.1 - Initialize preset hotswitch
    this.presetHotSwitch = createPresetHotSwitch('default');
    
    // Q7.3 - Initialize signature engine
    this.signatureEngine = createSignatureEngine();
    
    // Q7.3-P - Initialize pattern classifier
    this.patternClassifier = createPatternClassifier();
    
    // Pre-allocate composite buffer
    this.compositeBuffer = new Float32Array(this.kernel.getPointCount());
    
    // Set up sync bus listeners
    this.setupSyncListeners();
  }
  
  /**
   * Set up sync bus event listeners
   */
  private setupSyncListeners(): void {
    this.syncBus.on('phase-reset', () => {
      this.phaseController.resetPhase();
      this.kernel.reset();
    });
    
    this.syncBus.on('frequency-change', (event) => {
      // Handled by individual layers
    });
    
    // Q7 wave channel integration
    this.syncBus.on('q7-wave', (event) => {
      if (event.data) {
        const { channel, amplitude, phase } = event.data;
        // Validate channel is non-negative and within bounds
        if (channel !== undefined && channel >= 0 && channel < this.layers.length) {
          const layer = this.layers[channel];
          if (amplitude !== undefined && Number.isFinite(amplitude)) {
            this.amplitudeController.setLayer(layer.getId(), amplitude);
          }
          if (phase !== undefined && Number.isFinite(phase)) {
            this.phaseController.setLayerOffset(layer.getId(), phase);
          }
        }
      }
    });
    
    // Q7.1 - Preset hotswitch listener
    this.presetHotSwitch.onSwitch((event) => {
      if (event.success) {
        const config = this.presetHotSwitch.getCurrentConfig();
        this.applyPreset(config.id);
      }
    });
    
    // Q7.3-P - Pattern classifier listener (emit pattern:update via sync bus)
    this.patternClassifier.subscribe((pattern) => {
      this.syncBus.emit({
        type: 'pattern:update',
        timestamp: pattern.timestamp,
        data: pattern,
      });
    });
  }
  
  /**
   * Initialize with a canvas element
   */
  init(canvasOrId: string | HTMLCanvasElement): void {
    if (typeof canvasOrId === 'string') {
      const element = document.getElementById(canvasOrId);
      if (element instanceof HTMLCanvasElement) {
        this.canvas = element;
      } else {
        throw new Error(`Canvas element not found: ${canvasOrId}`);
      }
    } else {
      this.canvas = canvasOrId;
    }
    
    // Set canvas size
    const ratio = this.config.pixelRatio;
    this.canvas.width = this.config.width * ratio;
    this.canvas.height = this.config.height * ratio;
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;
    
    // Attach renderer
    this.renderer.attach(this.canvas);
    this.renderer.resize(this.canvas.width, this.canvas.height);
    
    if (this.config.autoStart) {
      this.start();
    }
  }
  
  /**
   * Start the render loop
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastFrameTime = performance.now();
    this.syncBus.start();
    
    this.renderLoop();
  }
  
  /**
   * Stop the render loop
   */
  stop(): void {
    this.running = false;
    this.syncBus.stop();
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Main render loop (zero-GC)
   */
  private renderLoop = (): void => {
    if (!this.running) return;
    
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    // Frame rate limiting
    if (this.frameInterval > 0 && elapsed < this.frameInterval) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
      return;
    }
    
    this.lastFrameTime = now;
    
    // Update controllers
    this.amplitudeController.update(now);
    this.phaseController.update(now);
    
    // Compute kernel
    const frameData = this.kernel.compute(now);
    
    // Composite layers (zero-GC)
    this.compositeLayers(now);
    
    // Apply composite to frame data amplitudes
    const globalAmp = this.amplitudeController.getGlobal();
    for (let i = 0; i < this.compositeBuffer.length; i++) {
      frameData.amplitudes[i] = this.compositeBuffer[i] * globalAmp;
    }
    
    // Q7.3 - Compute wave signature
    this.lastSignature = this.signatureEngine.computeSignature(frameData, this.resolution);
    
    // Q7.3-P - Classify pattern from signature (non-blocking)
    if (this.lastSignature) {
      this.lastPattern = this.patternClassifier.classify(this.lastSignature);
    }
    
    // Render
    this.renderer.render(frameData, this.resolution);
    
    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };
  
  /**
   * Composite all layers (zero-GC)
   */
  private compositeLayers(timestamp: number): void {
    // Reset composite buffer
    this.compositeBuffer.fill(0);
    
    // Add each layer's contribution
    for (const layer of this.layers) {
      if (!layer.getConfig().enabled) continue;
      
      const layerAmps = layer.compute(timestamp);
      const layerAmp = this.amplitudeController.getLayer(layer.getId());
      const phaseOffset = this.phaseController.getLayerOffset(layer.getId());
      
      layer.setPhaseOffset(phaseOffset);
      layer.blendInto(this.compositeBuffer, layerAmps);
    }
    
    // Normalize composite
    const maxAmp = this.layers.filter(l => l.getConfig().enabled).length;
    if (maxAmp > 1) {
      for (let i = 0; i < this.compositeBuffer.length; i++) {
        this.compositeBuffer[i] /= maxAmp;
      }
    }
  }
  
  /**
   * Apply a preset configuration
   */
  applyPreset(preset: PhiWaveDemoConfig['preset']): void {
    const presetConfig = this.presetHotSwitch.getPresetConfig(preset);
    if (!presetConfig) {
      // Invalid preset, use current config
      return;
    }
    
    // Recreate layers with new configuration
    this.layers = createPhiLayerStack(
      presetConfig.baseFrequency,
      presetConfig.layerCount,
      this.resolution
    );
    
    // Reset composite buffer if size changed
    const newSize = this.kernel.getPointCount();
    if (this.compositeBuffer.length !== newSize) {
      this.compositeBuffer = new Float32Array(newSize);
    }
    
    // Reset controllers
    this.phaseController.reset();
    this.kernel.reset();
  }
  
  /**
   * Set render mode
   */
  setRenderMode(mode: RendererOptions['mode']): void {
    this.renderer.setMode(mode);
  }
  
  /**
   * Set color scheme
   */
  setColorScheme(scheme: RendererOptions['colorScheme']): void {
    this.renderer.setColorScheme(scheme);
  }
  
  /**
   * Set debug mode
   */
  setDebug(debug: boolean): void {
    this.renderer.setDebug(debug);
  }
  
  /**
   * Set global amplitude
   */
  setAmplitude(value: number): void {
    this.amplitudeController.setGlobal(value);
  }
  
  /**
   * Set layer amplitude
   */
  setLayerAmplitude(layerIndex: number, value: number): void {
    if (layerIndex >= 0 && layerIndex < this.layers.length) {
      const layerId = this.layers[layerIndex].getId();
      this.amplitudeController.setLayer(layerId, value);
    }
  }
  
  /**
   * Set global phase offset
   */
  setPhaseOffset(value: number): void {
    this.phaseController.setGlobalOffset(value);
  }
  
  /**
   * Toggle layer
   */
  toggleLayer(layerIndex: number): void {
    if (layerIndex >= 0 && layerIndex < this.layers.length) {
      const layer = this.layers[layerIndex];
      layer.setEnabled(!layer.getConfig().enabled);
    }
  }
  
  /**
   * Reset the engine
   */
  reset(): void {
    this.kernel.reset();
    this.amplitudeController.reset();
    this.phaseController.reset();
    this.syncBus.reset();
    
    for (const layer of this.layers) {
      layer.reset();
    }
    
    this.compositeBuffer.fill(0);
  }
  
  /**
   * Get component references
   */
  getKernel(): WaveKernel {
    return this.kernel;
  }
  
  getLayers(): readonly WaveLayer[] {
    return this.layers;
  }
  
  getHarmonicMap(): PhiHarmonicMap {
    return this.harmonicMap;
  }
  
  getSyncBus(): PhiSyncBus {
    return this.syncBus;
  }
  
  getAmplitudeController(): AmplitudeController {
    return this.amplitudeController;
  }
  
  getPhaseController(): PhaseController {
    return this.phaseController;
  }
  
  getRenderer(): WaveFieldRenderer {
    return this.renderer;
  }
  
  /**
   * Get current FPS
   */
  getFps(): number {
    return this.renderer.getFps();
  }
  
  /**
   * Check if running
   */
  isRunning(): boolean {
    return this.running;
  }
  
  /**
   * Get Q7 version
   */
  getQ7Version(): string {
    return Q7_VERSION;
  }
  
  /**
   * Emit Q7 wave signal to a specific channel
   */
  emitQ7Wave(channel: number, amplitude: number, phase: number): void {
    this.syncBus.emitQ7Wave(channel, amplitude, phase);
  }
  
  /**
   * Q7.1 - Get preset hotswitch
   */
  getPresetHotSwitch(): PhiPresetHotSwitch {
    return this.presetHotSwitch;
  }
  
  /**
   * Q7.1 - Switch preset via hotswitch
   */
  switchPreset(presetId: PresetId): void {
    this.presetHotSwitch.switchPreset(presetId);
  }
  
  /**
   * Q7.1 - Get current preset
   */
  getCurrentPreset(): PresetId {
    return this.presetHotSwitch.getCurrentPreset();
  }
  
  /**
   * Q7.3 - Get signature engine
   */
  getSignatureEngine(): WaveSignatureEngine {
    return this.signatureEngine;
  }
  
  /**
   * Q7.3 - Get last computed signature
   */
  getLastSignature(): WaveSignature | null {
    return this.lastSignature ? { ...this.lastSignature } : null;
  }
  
  /**
   * Q7.3-P - Get pattern classifier
   */
  getPatternClassifier(): PhiPatternClassifier {
    return this.patternClassifier;
  }
  
  /**
   * Q7.3-P - Get last classified pattern
   */
  getLastPattern(): PatternClassification | null {
    return this.lastPattern ? { ...this.lastPattern } : null;
  }
  
  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stop();
    this.syncBus.dispose();
    this.renderer.detach();
    this.canvas = null;
  }
}

/**
 * Create a SurfaceRoot instance
 */
export function createSurfaceRoot(config?: Partial<SurfaceRootConfig>): SurfaceRoot {
  return new SurfaceRoot(config);
}
