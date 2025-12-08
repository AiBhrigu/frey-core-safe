/**
 * WaveFieldRenderer - Zero-GC render loop for wave visualization
 * 
 * Renders wave field data to canvas with no garbage collection
 * during the render loop for smooth 60fps+ performance.
 */

import type { RendererOptions, WaveFrameData, Vec2 } from './types.js';
import { PHI } from './types.js';

/**
 * Default renderer options
 */
const DEFAULT_OPTIONS: RendererOptions = {
  mode: 'points',
  colorScheme: 'phi-spectrum',
  antiAlias: true,
  debug: false,
};

/**
 * Pre-computed color lookup table for zero-GC
 */
const COLOR_LUT_SIZE = 256;
const colorLut: string[] = new Array(COLOR_LUT_SIZE);

/**
 * Initialize color lookup table
 */
function initColorLut(scheme: RendererOptions['colorScheme']): void {
  for (let i = 0; i < COLOR_LUT_SIZE; i++) {
    const t = i / (COLOR_LUT_SIZE - 1);
    colorLut[i] = computeColor(t, scheme);
  }
}

/**
 * Compute color for amplitude value
 */
function computeColor(t: number, scheme: RendererOptions['colorScheme']): string {
  // t is 0-1, representing amplitude from -1 to 1 (mapped)
  
  switch (scheme) {
    case 'phi-spectrum': {
      // φ-based color spectrum
      const hue = (t * 360 * PHI) % 360;
      const sat = 70 + t * 30;
      const light = 30 + t * 40;
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    }
    
    case 'monochrome': {
      const gray = Math.round(t * 255);
      return `rgb(${gray}, ${gray}, ${gray})`;
    }
    
    case 'heat': {
      // Heat map: black -> red -> yellow -> white
      if (t < 0.33) {
        const r = Math.round((t / 0.33) * 255);
        return `rgb(${r}, 0, 0)`;
      } else if (t < 0.66) {
        const g = Math.round(((t - 0.33) / 0.33) * 255);
        return `rgb(255, ${g}, 0)`;
      } else {
        const b = Math.round(((t - 0.66) / 0.34) * 255);
        return `rgb(255, 255, ${b})`;
      }
    }
    
    default:
      return `rgb(${Math.round(t * 255)}, ${Math.round(t * 255)}, ${Math.round(t * 255)})`;
  }
}

/**
 * WaveFieldRenderer class
 */
export class WaveFieldRenderer {
  private readonly options: RendererOptions;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private width: number = 0;
  private height: number = 0;
  
  // Pre-allocated objects for zero-GC rendering
  private readonly tempVec: Vec2 = { x: 0, y: 0 };
  
  // Stats
  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private fps: number = 0;
  
  constructor(options: Partial<RendererOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    initColorLut(this.options.colorScheme);
  }
  
  /**
   * Attach to a canvas element
   */
  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    
    if (this.ctx && this.options.antiAlias) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
    
    this.resize(canvas.width, canvas.height);
  }
  
  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
  
  /**
   * Render a frame (zero-GC)
   */
  render(frameData: WaveFrameData, resolution: number): void {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate point spacing
    const cellWidth = width / resolution;
    const cellHeight = height / resolution;
    
    // Render based on mode
    switch (this.options.mode) {
      case 'points':
        this.renderPoints(ctx, frameData, resolution, cellWidth, cellHeight);
        break;
      case 'lines':
        this.renderLines(ctx, frameData, resolution, cellWidth, cellHeight);
        break;
      case 'mesh':
        this.renderMesh(ctx, frameData, resolution, cellWidth, cellHeight);
        break;
      case 'gradient':
        this.renderGradient(ctx, frameData, resolution, cellWidth, cellHeight);
        break;
    }
    
    // Debug info
    if (this.options.debug) {
      this.renderDebug(ctx, frameData);
    }
    
    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
  }
  
  /**
   * Render points mode (zero-GC)
   */
  private renderPoints(
    ctx: CanvasRenderingContext2D,
    frameData: WaveFrameData,
    resolution: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const amplitudes = frameData.amplitudes;
    const pointSize = Math.max(2, Math.min(cellWidth, cellHeight) * 0.8);
    
    let index = 0;
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const amplitude = amplitudes[index];
        
        // Map amplitude (-1..1) to color LUT index (0..255)
        const lutIndex = Math.floor(((amplitude + 1) / 2) * (COLOR_LUT_SIZE - 1));
        const color = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
        
        const px = x * cellWidth + cellWidth / 2;
        const py = y * cellHeight + cellHeight / 2;
        
        // Size varies with amplitude
        const size = pointSize * (0.3 + Math.abs(amplitude) * 0.7);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        index++;
      }
    }
  }
  
  /**
   * Render lines mode (zero-GC)
   */
  private renderLines(
    ctx: CanvasRenderingContext2D,
    frameData: WaveFrameData,
    resolution: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const amplitudes = frameData.amplitudes;
    
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < resolution; y++) {
      ctx.beginPath();
      
      for (let x = 0; x < resolution; x++) {
        const index = y * resolution + x;
        const amplitude = amplitudes[index];
        
        const px = x * cellWidth + cellWidth / 2;
        const py = y * cellHeight + cellHeight / 2 + amplitude * cellHeight * 0.4;
        
        if (x === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      // Color based on row position
      const lutIndex = Math.floor((y / resolution) * (COLOR_LUT_SIZE - 1));
      ctx.strokeStyle = colorLut[lutIndex];
      ctx.stroke();
    }
  }
  
  /**
   * Render mesh mode (zero-GC)
   */
  private renderMesh(
    ctx: CanvasRenderingContext2D,
    frameData: WaveFrameData,
    resolution: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const amplitudes = frameData.amplitudes;
    
    ctx.lineWidth = 0.5;
    
    for (let y = 0; y < resolution - 1; y++) {
      for (let x = 0; x < resolution - 1; x++) {
        const i00 = y * resolution + x;
        const i10 = y * resolution + x + 1;
        const i01 = (y + 1) * resolution + x;
        
        const a00 = amplitudes[i00];
        const a10 = amplitudes[i10];
        const a01 = amplitudes[i01];
        
        const avgAmp = (a00 + a10 + a01) / 3;
        const lutIndex = Math.floor(((avgAmp + 1) / 2) * (COLOR_LUT_SIZE - 1));
        
        const x0 = x * cellWidth + cellWidth / 2;
        const y0 = y * cellHeight + cellHeight / 2;
        const x1 = (x + 1) * cellWidth + cellWidth / 2;
        const y1 = (y + 1) * cellHeight + cellHeight / 2;
        
        ctx.strokeStyle = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
        
        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(x0, y0 + a00 * cellHeight * 0.3);
        ctx.lineTo(x1, y0 + a10 * cellHeight * 0.3);
        ctx.stroke();
        
        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(x0, y0 + a00 * cellHeight * 0.3);
        ctx.lineTo(x0, y1 + a01 * cellHeight * 0.3);
        ctx.stroke();
      }
    }
  }
  
  /**
   * Render gradient mode (zero-GC)
   */
  private renderGradient(
    ctx: CanvasRenderingContext2D,
    frameData: WaveFrameData,
    resolution: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const amplitudes = frameData.amplitudes;
    
    let index = 0;
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const amplitude = amplitudes[index];
        
        const lutIndex = Math.floor(((amplitude + 1) / 2) * (COLOR_LUT_SIZE - 1));
        const color = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
        
        ctx.fillStyle = color;
        // +1 overlap prevents gaps between adjacent cells due to rounding
        ctx.fillRect(
          x * cellWidth,
          y * cellHeight,
          cellWidth + 1,
          cellHeight + 1
        );
        
        index++;
      }
    }
  }
  
  /**
   * Render debug info
   */
  private renderDebug(ctx: CanvasRenderingContext2D, frameData: WaveFrameData): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 80);
    
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${this.fps}`, 20, 30);
    ctx.fillText(`Frame: ${frameData.frameIndex}`, 20, 46);
    ctx.fillText(`Time: ${frameData.timeSeconds.toFixed(2)}s`, 20, 62);
    ctx.fillText(`Mode: ${this.options.mode}`, 20, 78);
  }
  
  /**
   * Get current FPS
   */
  getFps(): number {
    return this.fps;
  }
  
  /**
   * Set render mode
   */
  setMode(mode: RendererOptions['mode']): void {
    (this.options as RendererOptions).mode = mode;
  }
  
  /**
   * Set color scheme
   */
  setColorScheme(scheme: RendererOptions['colorScheme']): void {
    (this.options as RendererOptions).colorScheme = scheme;
    initColorLut(scheme);
  }
  
  /**
   * Set debug mode
   */
  setDebug(debug: boolean): void {
    (this.options as RendererOptions).debug = debug;
  }
  
  /**
   * Get options
   */
  getOptions(): Readonly<RendererOptions> {
    return this.options;
  }
  
  /**
   * Detach from canvas
   */
  detach(): void {
    this.ctx = null;
    this.canvas = null;
  }
}

/**
 * Create a WaveFieldRenderer instance
 */
export function createWaveFieldRenderer(options?: Partial<RendererOptions>): WaveFieldRenderer {
  return new WaveFieldRenderer(options);
}
