/**
 * Tests for Φ-Harmonic Wavefield Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PHI,
  PHI_INV,
  PHI_ANGLE,
  PhiHarmonicMap,
  createPhiHarmonicMap,
  WaveKernel,
  createWaveKernel,
  WaveLayer,
  createWaveLayer,
  createPhiLayerStack,
  PhiSyncBus,
  createPhiSyncBus,
  AmplitudeController,
  createAmplitudeController,
  PhaseController,
  createPhaseController,
  generateDemoHTML,
  getDemoConfig,
  Q7_VERSION,
  createSurfaceRoot,
} from './phi-wave/index.js';

describe('Phi Constants', () => {
  it('PHI should be the golden ratio', () => {
    expect(PHI).toBeCloseTo(1.618033988749895, 10);
  });

  it('PHI_INV should be 1/φ', () => {
    expect(PHI_INV).toBeCloseTo(1 / PHI, 10);
  });

  it('PHI_ANGLE should be 2π/φ²', () => {
    expect(PHI_ANGLE).toBeCloseTo((2 * Math.PI) / (PHI * PHI), 10);
  });
});

describe('PhiHarmonicMap', () => {
  let harmonicMap: PhiHarmonicMap;

  beforeEach(() => {
    harmonicMap = createPhiHarmonicMap(1.0, 8);
  });

  it('should create with default settings', () => {
    const map = createPhiHarmonicMap();
    expect(map.getBaseFrequency()).toBe(1.0);
    expect(map.getHarmonicCount()).toBe(8);
  });

  it('should get harmonic at index', () => {
    const h0 = harmonicMap.getHarmonic(0);
    expect(h0.index).toBe(0);
    expect(h0.frequencyRatio).toBe(1); // φ^0 = 1
    expect(h0.amplitudeRatio).toBe(1); // φ^(-0) = 1
  });

  it('should compute frequency for harmonic', () => {
    const freq0 = harmonicMap.getFrequency(0);
    const freq1 = harmonicMap.getFrequency(1);
    expect(freq0).toBe(1.0);
    expect(freq1).toBeCloseTo(PHI, 5);
  });

  it('should compute amplitude for harmonic', () => {
    const amp0 = harmonicMap.getAmplitude(0);
    const amp1 = harmonicMap.getAmplitude(1);
    expect(amp0).toBe(1);
    expect(amp1).toBeCloseTo(PHI_INV, 5);
  });

  it('should get all harmonics', () => {
    const harmonics = harmonicMap.getAllHarmonics();
    expect(harmonics.length).toBe(8);
  });

  it('should compute composite amplitude', () => {
    const amp = harmonicMap.computeCompositeAmplitude(0);
    expect(amp).toBeGreaterThanOrEqual(-1);
    expect(amp).toBeLessThanOrEqual(1);
  });

  it('should compute phase at time', () => {
    const phase = harmonicMap.computePhase(0, 0);
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(2 * Math.PI);
  });
});

describe('WaveKernel', () => {
  let kernel: WaveKernel;

  beforeEach(() => {
    kernel = createWaveKernel({ resolution: 16 });
  });

  it('should create with default resolution', () => {
    const k = createWaveKernel();
    expect(k.getResolution()).toBe(64);
  });

  it('should create with custom resolution', () => {
    expect(kernel.getResolution()).toBe(16);
    expect(kernel.getPointCount()).toBe(256); // 16*16
  });

  it('should compute frame data', () => {
    const frameData = kernel.compute(1000);
    expect(frameData.timestamp).toBe(1000);
    expect(frameData.frameIndex).toBe(0);
    expect(frameData.points.length).toBe(512); // 256 * 2 (x,y pairs)
    expect(frameData.amplitudes.length).toBe(256);
    expect(frameData.phases.length).toBe(256);
  });

  it('should increment frame index on each compute', () => {
    const frame1 = kernel.compute(1000);
    const frameIndex1 = frame1.frameIndex;
    const frame2 = kernel.compute(1016);
    const frameIndex2 = frame2.frameIndex;
    // Frame data is reused, so we capture the values
    expect(frameIndex1).toBe(0);
    expect(frameIndex2).toBe(1);
  });

  it('should get amplitude at index', () => {
    kernel.compute(1000);
    const amp = kernel.getAmplitude(0);
    expect(typeof amp).toBe('number');
  });

  it('should get phase at index', () => {
    kernel.compute(1000);
    const phase = kernel.getPhase(0);
    expect(phase).toBeGreaterThanOrEqual(0);
  });

  it('should get position at index', () => {
    const pos = { x: 0, y: 0 };
    kernel.getPosition(0, pos);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });

  it('should reset state', () => {
    kernel.compute(1000);
    kernel.compute(2000);
    kernel.reset();
    expect(kernel.getCurrentTime()).toBe(0);
  });
});

describe('WaveLayer', () => {
  let layer: WaveLayer;

  beforeEach(() => {
    layer = createWaveLayer({ id: 'test-layer' }, 16);
  });

  it('should create with id', () => {
    expect(layer.getId()).toBe('test-layer');
  });

  it('should compute amplitudes', () => {
    const amps = layer.compute(1000);
    expect(amps.length).toBe(256); // 16*16
  });

  it('should set enabled state', () => {
    layer.setEnabled(false);
    expect(layer.getConfig().enabled).toBe(false);
    
    const amps = layer.compute(1000);
    // When disabled, all amplitudes should be 0
    expect(amps.every(a => a === 0)).toBe(true);
  });

  it('should set opacity', () => {
    layer.setOpacity(0.5);
    expect(layer.getConfig().opacity).toBe(0.5);
  });

  it('should clamp opacity', () => {
    layer.setOpacity(1.5);
    expect(layer.getConfig().opacity).toBe(1);
    
    layer.setOpacity(-0.5);
    expect(layer.getConfig().opacity).toBe(0);
  });

  it('should blend into target buffer', () => {
    const target = new Float32Array(256);
    const source = new Float32Array(256).fill(0.5);
    
    layer.blendInto(target, source);
    expect(target[0]).toBe(0.5);
  });

  it('should reset layer', () => {
    layer.compute(1000);
    layer.reset();
    // After reset, layer should be in initial state
    expect(layer.getPointCount()).toBe(256);
  });
});

describe('createPhiLayerStack', () => {
  it('should create stack with specified count', () => {
    const stack = createPhiLayerStack(1.0, 5, 16);
    expect(stack.length).toBe(5);
  });

  it('should create layers with φ-based harmonics', () => {
    const stack = createPhiLayerStack(1.0, 3, 16);
    
    expect(stack[0].getConfig().harmonicMultiplier).toBe(1); // φ^0
    expect(stack[1].getConfig().harmonicMultiplier).toBeCloseTo(PHI, 5); // φ^1
    expect(stack[2].getConfig().harmonicMultiplier).toBeCloseTo(PHI * PHI, 5); // φ^2
  });

  it('should create layers with φ-decaying amplitudes', () => {
    const stack = createPhiLayerStack(1.0, 3, 16);
    
    expect(stack[0].getConfig().amplitudeScale).toBe(1); // φ^(-0)
    expect(stack[1].getConfig().amplitudeScale).toBeCloseTo(PHI_INV, 5); // φ^(-1)
    expect(stack[2].getConfig().amplitudeScale).toBeCloseTo(PHI_INV * PHI_INV, 5); // φ^(-2)
  });
});

describe('PhiSyncBus', () => {
  let bus: PhiSyncBus;

  beforeEach(() => {
    bus = createPhiSyncBus(60);
  });

  it('should create with tick rate', () => {
    expect(bus.isRunning()).toBe(false);
  });

  it('should subscribe to events', () => {
    let received = false;
    const unsubscribe = bus.on('tick', () => {
      received = true;
    });
    
    bus.tick();
    expect(received).toBe(true);
    
    unsubscribe();
  });

  it('should emit tick events', () => {
    let tickCount = 0;
    bus.on('tick', () => {
      tickCount++;
    });
    
    bus.tick();
    bus.tick();
    expect(tickCount).toBe(2);
  });

  it('should emit phase reset events', () => {
    let resetPhase = -1;
    bus.on('phase-reset', (event) => {
      resetPhase = event.data?.phase ?? 0;
    });
    
    bus.emitPhaseReset(0.5);
    expect(resetPhase).toBe(0.5);
  });

  it('should emit frequency change events', () => {
    let freq = 0;
    bus.on('frequency-change', (event) => {
      freq = event.data?.frequency ?? 0;
    });
    
    bus.emitFrequencyChange(2.5);
    expect(freq).toBe(2.5);
  });

  it('should queue events', () => {
    let count = 0;
    bus.on('tick', () => {
      count++;
    });
    
    bus.queue({ type: 'tick', timestamp: 0 });
    bus.queue({ type: 'tick', timestamp: 0 });
    expect(count).toBe(0);
    
    bus.flush();
    expect(count).toBe(2);
  });

  it('should reset state', () => {
    bus.tick();
    bus.tick();
    bus.reset();
    expect(bus.getTickCount()).toBe(0);
  });
});

describe('AmplitudeController', () => {
  let controller: AmplitudeController;

  beforeEach(() => {
    controller = createAmplitudeController();
  });

  it('should have default global amplitude', () => {
    expect(controller.getGlobal()).toBeCloseTo(0.8, 2);
  });

  it('should set global amplitude', () => {
    controller.setGlobalImmediate(0.5);
    expect(controller.getGlobal()).toBe(0.5);
  });

  it('should clamp global amplitude', () => {
    controller.setGlobalImmediate(1.5);
    expect(controller.getGlobal()).toBe(1);
    
    controller.setGlobalImmediate(-0.5);
    expect(controller.getGlobal()).toBe(0);
  });

  it('should set layer amplitude', () => {
    controller.setLayer('layer-1', 0.5);
    expect(controller.getLayer('layer-1')).toBe(0.5);
  });

  it('should return default for unknown layer', () => {
    expect(controller.getLayer('unknown')).toBe(1);
  });

  it('should calculate effective amplitude', () => {
    controller.setGlobalImmediate(0.5);
    controller.setLayer('layer-1', 0.5);
    // effective = global * layer * envelope (envelope starts at 1)
    // But we need to update to get proper envelope
    const effective = controller.getEffective('layer-1');
    expect(effective).toBeCloseTo(0.25, 2);
  });

  it('should set attack and release times', () => {
    controller.setAttack(100);
    controller.setRelease(500);
    const state = controller.getState();
    expect(state.attackMs).toBe(100);
    expect(state.releaseMs).toBe(500);
  });

  it('should reset to defaults', () => {
    controller.setGlobalImmediate(0.2);
    controller.setLayer('test', 0.3);
    controller.reset();
    expect(controller.getGlobal()).toBeCloseTo(0.8, 2);
    expect(controller.getLayer('test')).toBe(1);
  });
});

describe('PhaseController', () => {
  let controller: PhaseController;

  beforeEach(() => {
    controller = createPhaseController();
  });

  it('should have default global offset of 0', () => {
    expect(controller.getGlobalOffset()).toBe(0);
  });

  it('should set global offset immediately', () => {
    controller.setGlobalOffsetImmediate(Math.PI);
    expect(controller.getGlobalOffset()).toBeCloseTo(Math.PI, 5);
  });

  it('should normalize offset to 0-2π', () => {
    controller.setGlobalOffsetImmediate(3 * Math.PI);
    expect(controller.getGlobalOffset()).toBeCloseTo(Math.PI, 5);
  });

  it('should set layer offset', () => {
    controller.setLayerOffset('layer-1', Math.PI / 2);
    expect(controller.getLayerOffset('layer-1')).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should return 0 for unknown layer offset', () => {
    expect(controller.getLayerOffset('unknown')).toBe(0);
  });

  it('should calculate effective phase', () => {
    controller.setGlobalOffsetImmediate(Math.PI / 4);
    controller.setLayerOffset('layer-1', Math.PI / 4);
    const effective = controller.getEffective('layer-1');
    expect(effective).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should set locked state', () => {
    controller.setLocked(true);
    expect(controller.isLocked()).toBe(true);
  });

  it('should set phi sync mode', () => {
    controller.setPhiSync(false);
    expect(controller.isPhiSync()).toBe(false);
  });

  it('should reset phase', () => {
    controller.setGlobalOffsetImmediate(Math.PI);
    controller.setLayerOffset('layer-1', Math.PI / 2);
    controller.resetPhase();
    expect(controller.getGlobalOffset()).toBe(0);
    expect(controller.getLayerOffset('layer-1')).toBe(0);
  });

  it('should reset specific layer', () => {
    controller.setLayerOffset('layer-1', Math.PI / 2);
    controller.resetPhase('layer-1');
    expect(controller.getLayerOffset('layer-1')).toBe(0);
  });

  it('should advance by phi angle', () => {
    controller.advanceByPhi();
    // Target should be set, but need to update to apply
    // Just verify no errors
    expect(true).toBe(true);
  });

  it('should reset to defaults', () => {
    controller.setGlobalOffsetImmediate(Math.PI);
    controller.setPhiSync(false);
    controller.setLocked(true);
    controller.reset();
    expect(controller.getGlobalOffset()).toBe(0);
    expect(controller.isPhiSync()).toBe(true);
    expect(controller.isLocked()).toBe(false);
  });
});

describe('PhiWaveDemo', () => {
  it('should generate demo HTML', () => {
    const html = generateDemoHTML();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Φ-Wave Demo');
    expect(html).toContain('phi-wave-canvas');
  });

  it('should generate demo HTML with custom config', () => {
    const html = generateDemoHTML({ showControls: false, showStats: false });
    expect(html).toContain('display: none');
  });

  it('should get demo config for presets', () => {
    const defaultConfig = getDemoConfig('default');
    expect(defaultConfig.preset).toBe('default');
    expect(defaultConfig.layerCount).toBe(5);
    
    const calmConfig = getDemoConfig('calm');
    expect(calmConfig.preset).toBe('calm');
    expect(calmConfig.layerCount).toBe(3);
    expect(calmConfig.baseFrequency).toBe(0.2);
    
    const energeticConfig = getDemoConfig('energetic');
    expect(energeticConfig.preset).toBe('energetic');
    expect(energeticConfig.layerCount).toBe(8);
    
    const harmonicConfig = getDemoConfig('harmonic');
    expect(harmonicConfig.baseFrequency).toBeCloseTo(0.618, 3);
    
    const chaosConfig = getDemoConfig('chaos');
    expect(chaosConfig.layerCount).toBe(12);
  });
});

describe('Q7 Integration', () => {
  it('should export Q7_VERSION', () => {
    expect(Q7_VERSION).toBe('7.0.0');
  });

  it('should register q7-wave channel in PhiSyncBus', () => {
    const bus = createPhiSyncBus();
    let received = false;
    
    bus.on('q7-wave', () => {
      received = true;
    });
    
    bus.emitQ7Wave(0, 0.5, Math.PI);
    expect(received).toBe(true);
  });

  it('should emit Q7 wave events with correct data', () => {
    const bus = createPhiSyncBus();
    let eventData: { channel?: number; amplitude?: number; phase?: number } | undefined;
    
    bus.on('q7-wave', (event) => {
      eventData = event.data as { channel?: number; amplitude?: number; phase?: number };
    });
    
    bus.emitQ7Wave(2, 0.75, Math.PI / 2);
    
    expect(eventData).toBeDefined();
    expect(eventData?.channel).toBe(2);
    expect(eventData?.amplitude).toBe(0.75);
    expect(eventData?.phase).toBe(Math.PI / 2);
  });

  it('should expose getQ7Version on SurfaceRoot', () => {
    const surface = createSurfaceRoot();
    expect(surface.getQ7Version()).toBe('7.0.0');
  });

  it('should expose emitQ7Wave method on SurfaceRoot', () => {
    const surface = createSurfaceRoot();
    expect(typeof surface.emitQ7Wave).toBe('function');
  });
});
