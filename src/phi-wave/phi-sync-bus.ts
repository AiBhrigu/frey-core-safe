/**
 * PhiSyncBus - Synchronization bus for wave components
 * 
 * Provides event-based synchronization between wave engine
 * components with deterministic timing.
 */

import type { SyncEvent, SyncListener } from './types.js';
import { PHI } from './types.js';

/**
 * Maximum listeners per event type
 */
const MAX_LISTENERS = 32;

/**
 * PhiSyncBus class for component synchronization
 */
export class PhiSyncBus {
  private readonly listeners: Map<SyncEvent['type'], SyncListener[]>;
  private readonly eventQueue: SyncEvent[];
  private readonly maxQueueSize: number;
  
  // Timing state
  private lastTickTime: number = 0;
  private tickInterval: number;
  private tickCount: number = 0;
  private running: boolean = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  
  constructor(ticksPerSecond: number = 60) {
    this.listeners = new Map();
    this.eventQueue = [];
    this.maxQueueSize = 100;
    this.tickInterval = 1000 / ticksPerSecond;
    
    // Initialize listener maps
    const eventTypes: SyncEvent['type'][] = ['tick', 'phase-reset', 'frequency-change', 'layer-update', 'q7-wave'];
    for (const type of eventTypes) {
      this.listeners.set(type, []);
    }
  }
  
  /**
   * Subscribe to an event type
   */
  on(type: SyncEvent['type'], listener: SyncListener): () => void {
    const listeners = this.listeners.get(type);
    if (!listeners) return () => {};
    
    if (listeners.length >= MAX_LISTENERS) {
      console.warn(`PhiSyncBus: Max listeners (${MAX_LISTENERS}) reached for event type: ${type}`);
      return () => {};
    }
    
    listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Emit an event (synchronous dispatch)
   */
  emit(event: SyncEvent): void {
    const listeners = this.listeners.get(event.type);
    if (!listeners) return;
    
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`PhiSyncBus: Error in listener for ${event.type}:`, error);
      }
    }
  }
  
  /**
   * Queue an event for deferred dispatch
   */
  queue(event: SyncEvent): void {
    if (this.eventQueue.length >= this.maxQueueSize) {
      // Drop oldest event
      this.eventQueue.shift();
    }
    this.eventQueue.push(event);
  }
  
  /**
   * Flush the event queue
   */
  flush(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.emit(event);
      }
    }
  }
  
  /**
   * Start the tick clock
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTickTime = performance.now();
    
    this.timerId = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }
  
  /**
   * Stop the tick clock
   */
  stop(): void {
    if (!this.running) return;
    
    this.running = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  /**
   * Manual tick (for external timing control)
   */
  tick(): void {
    const now = performance.now();
    const deltaTime = now - this.lastTickTime;
    this.lastTickTime = now;
    
    this.tickCount++;
    
    // Emit tick event
    this.emit({
      type: 'tick',
      timestamp: now,
      data: {
        deltaTime,
        tickCount: this.tickCount,
        phiPhase: (this.tickCount * PHI) % 1,
      },
    });
    
    // Process queued events
    this.flush();
  }
  
  /**
   * Emit phase reset event
   */
  emitPhaseReset(phase: number = 0): void {
    this.emit({
      type: 'phase-reset',
      timestamp: performance.now(),
      data: { phase },
    });
  }
  
  /**
   * Emit frequency change event
   */
  emitFrequencyChange(frequency: number, layerId?: string): void {
    this.emit({
      type: 'frequency-change',
      timestamp: performance.now(),
      data: { 
        frequency,
        ...(layerId ? { layerIndex: parseInt(layerId.split('-').pop() || '0', 10) } : {}),
      },
    });
  }
  
  /**
   * Emit layer update event
   */
  emitLayerUpdate(layerIndex: number, property: string, value: number): void {
    this.emit({
      type: 'layer-update',
      timestamp: performance.now(),
      data: { layerIndex, [property]: value },
    });
  }
  
  /**
   * Emit Q7 wave channel event
   */
  emitQ7Wave(channel: number, amplitude: number, phase: number): void {
    // Validate inputs
    if (!Number.isFinite(channel) || channel < 0 || !Number.isInteger(channel)) {
      return;
    }
    if (!Number.isFinite(amplitude) || !Number.isFinite(phase)) {
      return;
    }
    
    this.emit({
      type: 'q7-wave',
      timestamp: performance.now(),
      data: { channel, amplitude, phase },
    });
  }
  
  /**
   * Get tick count
   */
  getTickCount(): number {
    return this.tickCount;
  }
  
  /**
   * Check if running
   */
  isRunning(): boolean {
    return this.running;
  }
  
  /**
   * Reset the bus
   */
  reset(): void {
    this.stop();
    this.tickCount = 0;
    this.lastTickTime = 0;
    this.eventQueue.length = 0;
  }
  
  /**
   * Dispose the bus
   */
  dispose(): void {
    this.stop();
    this.listeners.clear();
    this.eventQueue.length = 0;
  }
}

/**
 * Create a PhiSyncBus instance
 */
export function createPhiSyncBus(ticksPerSecond: number = 60): PhiSyncBus {
  return new PhiSyncBus(ticksPerSecond);
}
