/**
 * Q9 Types - Type definitions for Q9 Prediction Layer
 * 
 * THIS IS SCAFFOLD ONLY. Q9 is NOT instantiated or integrated into runtime.
 * This module defines types for future Q9 implementation.
 */

export type PredictionHorizon = 'short' | 'medium' | 'long' | 'extended';

export interface PredictiveState {
  horizon: PredictionHorizon;
  confidence: number;
  predictedPattern: string;
  predictedEmergent: string;
  timeToEvent: number;
}

export interface CausalRelation {
  source: string;
  target: string;
  strength: number;
  lag: number;
}

export interface LongTermMemoryEntry {
  pattern: string;
  frequency: number;
  lastSeen: number;
  context: string[];
}

// NOTE: These types are for future use only.
// Q9 is NOT implemented or instantiated in this PR.
