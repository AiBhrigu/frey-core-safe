#!/usr/bin/env node
/**
 * Generate Flow Diagram - CLI script
 * 
 * Usage: npx ts-node src/phi-wave/flow-autogen/generate-flow-diagram.ts
 */

import { createEnergyFlowGenerator } from './energy-flow-generator.js';

function main() {
  const generator = createEnergyFlowGenerator();
  const diagram = generator.generateQ7ToQ8Flow();
  const mermaid = generator.toMermaid(diagram);

  console.log('# Φ-Wave Energy Flow Diagram\n');
  console.log('```mermaid');
  console.log(mermaid);
  console.log('```');
  console.log('\n## Layers');
  for (const layer of diagram.layers) {
    console.log(`- ${layer}`);
  }
}

if (require.main === module) {
  main();
}
