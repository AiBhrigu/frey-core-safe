/**
 * PhiHarmonicMap - Harmonic frequency mapping based on φ
 * 
 * Generates harmonic series using the golden ratio for
 * natural, aesthetically pleasing frequency relationships.
 */

import type { PhiHarmonic } from './types.js';
import { PHI, PHI_INV, PHI_ANGLE } from './types.js';

/**
 * Maximum number of harmonics to pre-compute
 */
const MAX_HARMONICS = 32;

/**
 * Pre-computed harmonic map for zero-GC access
 */
const harmonicCache: PhiHarmonic[] = [];

/**
 * Initialize the harmonic cache
 */
function initializeCache(): void {
  if (harmonicCache.length > 0) return;
  
  for (let i = 0; i < MAX_HARMONICS; i++) {
    harmonicCache.push(computeHarmonic(i));
  }
}

/**
 * Compute a single harmonic entry
 */
function computeHarmonic(index: number): PhiHarmonic {
  // Frequency ratio: φ^index for exponential φ-scaling
  const frequencyRatio = Math.pow(PHI, index);
  
  // Amplitude ratio: φ^(-index) for natural decay
  const amplitudeRatio = Math.pow(PHI_INV, index);
  
  // Phase shift: golden angle × index for optimal distribution
  const phaseShift = (PHI_ANGLE * index) % (2 * Math.PI);
  
  return {
    index,
    frequencyRatio,
    amplitudeRatio,
    phaseShift,
  };
}

/**
 * PhiHarmonicMap class for managing harmonic relationships
 */
export class PhiHarmonicMap {
  private readonly baseFrequency: number;
  private readonly harmonicCount: number;
  
  constructor(baseFrequency: number = 1.0, harmonicCount: number = 8) {
    initializeCache();
    this.baseFrequency = baseFrequency;
    this.harmonicCount = Math.min(harmonicCount, MAX_HARMONICS);
  }
  
  /**
   * Get harmonic at index (zero-GC - returns cached object)
   */
  getHarmonic(index: number): PhiHarmonic {
    const safeIndex = Math.max(0, Math.min(index, MAX_HARMONICS - 1));
    return harmonicCache[safeIndex];
  }
  
  /**
   * Get actual frequency for a harmonic index
   */
  getFrequency(index: number): number {
    return this.baseFrequency * this.getHarmonic(index).frequencyRatio;
  }
  
  /**
   * Get amplitude for a harmonic index
   */
  getAmplitude(index: number): number {
    return this.getHarmonic(index).amplitudeRatio;
  }
  
  /**
   * Get phase shift for a harmonic index
   */
  getPhaseShift(index: number): number {
    return this.getHarmonic(index).phaseShift;
  }
  
  /**
   * Get all harmonics up to harmonicCount
   */
  getAllHarmonics(): readonly PhiHarmonic[] {
    return harmonicCache.slice(0, this.harmonicCount);
  }
  
  /**
   * Compute composite amplitude at time t
   * Uses pre-computed harmonics for deterministic, zero-GC calculation
   */
  computeCompositeAmplitude(time: number): number {
    let amplitude = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < this.harmonicCount; i++) {
      const harmonic = harmonicCache[i];
      const freq = this.baseFrequency * harmonic.frequencyRatio;
      const phase = (2 * Math.PI * freq * time) + harmonic.phaseShift;
      const weight = harmonic.amplitudeRatio;
      
      amplitude += Math.sin(phase) * weight;
      totalWeight += weight;
    }
    
    // Normalize to -1..1 range
    return totalWeight > 0 ? amplitude / totalWeight : 0;
  }
  
  /**
   * Compute phase at time t for a specific harmonic
   */
  computePhase(time: number, harmonicIndex: number): number {
    const harmonic = this.getHarmonic(harmonicIndex);
    const freq = this.baseFrequency * harmonic.frequencyRatio;
    return ((2 * Math.PI * freq * time) + harmonic.phaseShift) % (2 * Math.PI);
  }
  
  /**
   * Get the base frequency
   */
  getBaseFrequency(): number {
    return this.baseFrequency;
  }
  
  /**
   * Get the harmonic count
   */
  getHarmonicCount(): number {
    return this.harmonicCount;
  }
}

/**
 * Create a PhiHarmonicMap with default settings
 */
export function createPhiHarmonicMap(
  baseFrequency: number = 1.0,
  harmonicCount: number = 8
): PhiHarmonicMap {
  return new PhiHarmonicMap(baseFrequency, harmonicCount);
}

/**
 * Pre-initialize the cache (call at module load)
 */
initializeCache();
