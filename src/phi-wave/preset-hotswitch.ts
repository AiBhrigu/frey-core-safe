/**
 * Φ-Preset HotSwitch Engine (Q7.1-H)
 * 
 * Enables runtime preset switching via PhiSyncBus with
 * safe fallback to default preset.
 * 
 * @tag q7.1-preset-hotswitch
 */

import type { PhiWaveDemoConfig } from './types.js';
import { PHI, PHI_INV } from './types.js';

/**
 * Preset HotSwitch Version
 */
export const Q7_HOTSWITCH_VERSION = '7.1.0';

/**
 * Available preset identifiers
 */
export type PresetId = PhiWaveDemoConfig['preset'];

/**
 * Preset configuration with metadata
 */
export interface PresetConfig {
  id: PresetId;
  name: string;
  description: string;
  layerCount: number;
  baseFrequency: number;
  /** Priority for fallback (higher = preferred) */
  priority: number;
}

/**
 * Preset registry
 */
const PRESET_REGISTRY: Record<PresetId, PresetConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Balanced wave configuration',
    layerCount: 5,
    baseFrequency: 0.5,
    priority: 100,
  },
  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Peaceful, low-frequency waves',
    layerCount: 3,
    baseFrequency: 0.2,
    priority: 90,
  },
  energetic: {
    id: 'energetic',
    name: 'Energetic',
    description: 'Dynamic, high-frequency waves',
    layerCount: 8,
    baseFrequency: 1.5,
    priority: 80,
  },
  harmonic: {
    id: 'harmonic',
    name: 'Harmonic',
    description: 'Φ-resonant harmonic waves (1/φ)',
    layerCount: 5,
    baseFrequency: PHI_INV, // 1/φ
    priority: 95,
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos',
    description: 'Complex, chaotic wave patterns',
    layerCount: 12,
    baseFrequency: 2.0,
    priority: 70,
  },
};

/**
 * Preset hotswitch event
 */
export interface PresetHotSwitchEvent {
  fromPreset: PresetId;
  toPreset: PresetId;
  timestamp: number;
  success: boolean;
  fallback?: boolean;
}

/**
 * Preset hotswitch listener
 */
export type PresetSwitchListener = (event: PresetHotSwitchEvent) => void;

/**
 * PhiPresetHotSwitch class for runtime preset management
 */
export class PhiPresetHotSwitch {
  private currentPreset: PresetId;
  private readonly listeners: PresetSwitchListener[] = [];
  private switchHistory: PresetHotSwitchEvent[] = [];
  private readonly maxHistorySize: number = 50;
  
  constructor(initialPreset: PresetId = 'default') {
    this.currentPreset = this.validatePreset(initialPreset) ? initialPreset : 'default';
  }
  
  /**
   * Get current preset ID
   */
  getCurrentPreset(): PresetId {
    return this.currentPreset;
  }
  
  /**
   * Get current preset configuration
   */
  getCurrentConfig(): PresetConfig {
    return { ...PRESET_REGISTRY[this.currentPreset] };
  }
  
  /**
   * Get preset configuration by ID
   */
  getPresetConfig(presetId: PresetId): PresetConfig | null {
    if (!this.validatePreset(presetId)) {
      return null;
    }
    return { ...PRESET_REGISTRY[presetId] };
  }
  
  /**
   * Get all available presets
   */
  getAllPresets(): PresetConfig[] {
    return Object.values(PRESET_REGISTRY).map(p => ({ ...p }));
  }
  
  /**
   * Validate preset ID
   */
  validatePreset(presetId: string): presetId is PresetId {
    return presetId in PRESET_REGISTRY;
  }
  
  /**
   * Switch to a new preset with safe fallback
   */
  switchPreset(toPreset: PresetId): PresetHotSwitchEvent {
    const fromPreset = this.currentPreset;
    const timestamp = performance.now();
    
    // Validate target preset
    if (!this.validatePreset(toPreset)) {
      // Fallback to default
      const fallbackPreset = this.findFallbackPreset();
      const event: PresetHotSwitchEvent = {
        fromPreset,
        toPreset: fallbackPreset,
        timestamp,
        success: true,
        fallback: true,
      };
      
      this.currentPreset = fallbackPreset;
      this.recordSwitch(event);
      this.notifyListeners(event);
      
      return event;
    }
    
    // Switch to new preset
    this.currentPreset = toPreset;
    
    const event: PresetHotSwitchEvent = {
      fromPreset,
      toPreset,
      timestamp,
      success: true,
      fallback: false,
    };
    
    this.recordSwitch(event);
    this.notifyListeners(event);
    
    return event;
  }
  
  /**
   * Find fallback preset (highest priority available)
   */
  private findFallbackPreset(): PresetId {
    const presets = Object.values(PRESET_REGISTRY);
    presets.sort((a, b) => b.priority - a.priority);
    return presets[0].id;
  }
  
  /**
   * Record switch in history
   */
  private recordSwitch(event: PresetHotSwitchEvent): void {
    this.switchHistory.push(event);
    
    // Maintain max history size
    if (this.switchHistory.length > this.maxHistorySize) {
      this.switchHistory.shift();
    }
  }
  
  /**
   * Get switch history
   */
  getSwitchHistory(): readonly PresetHotSwitchEvent[] {
    return [...this.switchHistory];
  }
  
  /**
   * Subscribe to preset switch events
   */
  onSwitch(listener: PresetSwitchListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(event: PresetHotSwitchEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('PhiPresetHotSwitch: Error in listener:', error);
      }
    }
  }
  
  /**
   * Clear switch history
   */
  clearHistory(): void {
    this.switchHistory = [];
  }
  
  /**
   * Get version
   */
  getVersion(): string {
    return Q7_HOTSWITCH_VERSION;
  }
}

/**
 * Create a PhiPresetHotSwitch instance
 */
export function createPresetHotSwitch(initialPreset?: PresetId): PhiPresetHotSwitch {
  return new PhiPresetHotSwitch(initialPreset);
}
