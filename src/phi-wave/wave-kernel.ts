/**
 * WaveKernel - Core wave computation engine
 * 
 * Deterministic φ-based wave field computation with pre-allocated
 * buffers for zero-GC operation during render loops.
 */

import type { WaveKernelConfig, WaveFrameData, Vec2 } from './types.js';
import { PHI, PHI_ANGLE } from './types.js';
import { PhiHarmonicMap } from './phi-harmonic-map.js';

/**
 * Default kernel configuration
 */
const DEFAULT_CONFIG: WaveKernelConfig = {
  resolution: 64,
  width: 1.0,
  height: 1.0,
  timeScale: 1.0,
  damping: 0.98,
};

/**
 * WaveKernel class for wave field computation
 */
export class WaveKernel {
  private readonly config: WaveKernelConfig;
  private readonly harmonicMap: PhiHarmonicMap;
  private readonly pointCount: number;
  
  // Pre-allocated buffers (zero-GC)
  private readonly positionsX: Float32Array;
  private readonly positionsY: Float32Array;
  private readonly amplitudes: Float32Array;
  private readonly phases: Float32Array;
  private readonly velocities: Float32Array;
  
  // Frame data (reused)
  private readonly frameData: WaveFrameData;
  
  // State
  private lastTimestamp: number = 0;
  private frameIndex: number = 0;
  private currentTime: number = 0;
  
  constructor(config: Partial<WaveKernelConfig> = {}, harmonicMap?: PhiHarmonicMap) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.harmonicMap = harmonicMap ?? new PhiHarmonicMap(1.0, 8);
    
    const resolution = this.config.resolution;
    this.pointCount = resolution * resolution;
    
    // Pre-allocate all buffers
    this.positionsX = new Float32Array(this.pointCount);
    this.positionsY = new Float32Array(this.pointCount);
    this.amplitudes = new Float32Array(this.pointCount);
    this.phases = new Float32Array(this.pointCount);
    this.velocities = new Float32Array(this.pointCount);
    
    // Initialize grid positions
    this.initializeGrid();
    
    // Pre-allocate frame data
    this.frameData = {
      timestamp: 0,
      deltaTime: 0,
      timeSeconds: 0,
      frameIndex: 0,
      points: new Float32Array(this.pointCount * 2), // x,y pairs
      amplitudes: this.amplitudes,
      phases: this.phases,
    };
  }
  
  /**
   * Initialize the grid positions using φ-based distribution
   */
  private initializeGrid(): void {
    const resolution = this.config.resolution;
    const width = this.config.width;
    const height = this.config.height;
    
    let index = 0;
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        // Normalized coordinates (0-1)
        const nx = x / (resolution - 1);
        const ny = y / (resolution - 1);
        
        // Map to field dimensions with φ-based offset
        this.positionsX[index] = nx * width;
        this.positionsY[index] = ny * height;
        
        // Initialize with φ-distributed phases
        this.phases[index] = (PHI_ANGLE * index) % (2 * Math.PI);
        this.amplitudes[index] = 0;
        this.velocities[index] = 0;
        
        index++;
      }
    }
  }
  
  /**
   * Compute wave field at given time (zero-GC)
   * Returns the pre-allocated frame data object
   */
  compute(timestamp: number): WaveFrameData {
    const deltaTime = this.lastTimestamp > 0 ? timestamp - this.lastTimestamp : 16.67;
    this.lastTimestamp = timestamp;
    
    const dt = (deltaTime / 1000) * this.config.timeScale;
    this.currentTime += dt;
    
    // Update frame data (reusing object)
    this.frameData.timestamp = timestamp;
    this.frameData.deltaTime = deltaTime;
    this.frameData.timeSeconds = this.currentTime;
    this.frameData.frameIndex = this.frameIndex++;
    
    // Compute wave values for all points
    this.computeWaveField(this.currentTime, dt);
    
    // Copy positions to interleaved buffer
    for (let i = 0; i < this.pointCount; i++) {
      this.frameData.points[i * 2] = this.positionsX[i];
      this.frameData.points[i * 2 + 1] = this.positionsY[i];
    }
    
    return this.frameData;
  }
  
  /**
   * Compute wave values for all points (zero-GC inner loop)
   */
  private computeWaveField(time: number, dt: number): void {
    const damping = this.config.damping;
    const width = this.config.width;
    const height = this.config.height;
    
    for (let i = 0; i < this.pointCount; i++) {
      // Get normalized position
      const nx = this.positionsX[i] / width;
      const ny = this.positionsY[i] / height;
      
      // Distance from center (0-1)
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) * 2;
      
      // Angle from center
      const angle = Math.atan2(dy, dx);
      
      // Compute φ-harmonic wave contribution
      const basePhase = time * 2 * Math.PI;
      const spatialPhase = dist * PHI * 2 * Math.PI;
      const angularPhase = angle * PHI;
      
      // Get composite amplitude from harmonic map
      const harmonicAmp = this.harmonicMap.computeCompositeAmplitude(
        time + dist * 0.5 + angle * PHI / (2 * Math.PI)
      );
      
      // Combine with spatial wave
      const spatialWave = Math.sin(basePhase - spatialPhase + angularPhase);
      
      // Update with damping
      const targetAmp = (harmonicAmp * 0.6 + spatialWave * 0.4);
      this.velocities[i] = (this.velocities[i] + (targetAmp - this.amplitudes[i]) * dt * 10) * damping;
      this.amplitudes[i] += this.velocities[i] * dt;
      
      // Update phase
      this.phases[i] = (basePhase + spatialPhase + this.phases[i] * 0.1) % (2 * Math.PI);
    }
  }
  
  /**
   * Get amplitude at specific grid index (zero-GC)
   */
  getAmplitude(index: number): number {
    return this.amplitudes[Math.min(index, this.pointCount - 1)];
  }
  
  /**
   * Get phase at specific grid index (zero-GC)
   */
  getPhase(index: number): number {
    return this.phases[Math.min(index, this.pointCount - 1)];
  }
  
  /**
   * Get position at specific grid index (zero-GC)
   * Writes to provided Vec2 object to avoid allocation
   */
  getPosition(index: number, out: Vec2): Vec2 {
    const safeIndex = Math.min(index, this.pointCount - 1);
    out.x = this.positionsX[safeIndex];
    out.y = this.positionsY[safeIndex];
    return out;
  }
  
  /**
   * Reset the kernel state
   */
  reset(): void {
    this.lastTimestamp = 0;
    this.frameIndex = 0;
    this.currentTime = 0;
    
    for (let i = 0; i < this.pointCount; i++) {
      this.amplitudes[i] = 0;
      this.velocities[i] = 0;
      this.phases[i] = (PHI_ANGLE * i) % (2 * Math.PI);
    }
  }
  
  /**
   * Get the point count
   */
  getPointCount(): number {
    return this.pointCount;
  }
  
  /**
   * Get the resolution
   */
  getResolution(): number {
    return this.config.resolution;
  }
  
  /**
   * Get the config (readonly)
   */
  getConfig(): Readonly<WaveKernelConfig> {
    return this.config;
  }
  
  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }
}

/**
 * Create a WaveKernel with configuration
 */
export function createWaveKernel(
  config?: Partial<WaveKernelConfig>,
  harmonicMap?: PhiHarmonicMap
): WaveKernel {
  return new WaveKernel(config, harmonicMap);
}
