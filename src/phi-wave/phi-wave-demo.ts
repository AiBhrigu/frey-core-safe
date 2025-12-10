/**
 * Φ-Wave Demo - Interactive demonstration page
 * 
 * Exports a function to create the demo HTML page
 * for the Φ-Harmonic Wavefield Engine.
 */

import type { PhiWaveDemoConfig, RendererOptions } from './types.js';

/**
 * Default demo configuration
 */
const DEFAULT_DEMO_CONFIG: PhiWaveDemoConfig = {
  preset: 'default',
  layerCount: 5,
  baseFrequency: 0.5,
  showControls: true,
  showStats: true,
};

/**
 * Generate the demo HTML page content
 */
export function generateDemoHTML(config: Partial<PhiWaveDemoConfig> = {}): string {
  const finalConfig = { ...DEFAULT_DEMO_CONFIG, ...config };
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Φ-Wave Demo | Frey Harmonic Wavefield Engine</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0a0a12;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    
    h1 {
      font-size: 2rem;
      font-weight: 300;
      margin-bottom: 10px;
      color: #00ff88;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }
    
    .subtitle {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 20px;
    }
    
    .phi-symbol {
      color: #ffd700;
      font-size: 1.2em;
    }
    
    .canvas-container {
      position: relative;
      border: 1px solid #333;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.1);
    }
    
    #phi-wave-canvas {
      display: block;
      background: #0a0a12;
    }
    
    .controls {
      margin-top: 20px;
      display: ${finalConfig.showControls ? 'flex' : 'none'};
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      max-width: 800px;
    }
    
    .control-group {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      min-width: 180px;
    }
    
    .control-group h3 {
      font-size: 0.85rem;
      color: #00ff88;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .control-row label {
      font-size: 0.8rem;
      color: #aaa;
    }
    
    .control-row input[type="range"] {
      width: 100px;
      accent-color: #00ff88;
    }
    
    .control-row select {
      background: #1a1a24;
      color: #e0e0e0;
      border: 1px solid #333;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .btn {
      background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
      color: #000;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #e0e0e0;
    }
    
    .stats {
      display: ${finalConfig.showStats ? 'flex' : 'none'};
      gap: 20px;
      margin-top: 15px;
      font-size: 0.8rem;
      color: #666;
    }
    
    .stat {
      background: rgba(0, 0, 0, 0.3);
      padding: 8px 12px;
      border-radius: 4px;
    }
    
    .stat-value {
      color: #00ff88;
      font-weight: 600;
    }
    
    .info {
      margin-top: 30px;
      max-width: 600px;
      text-align: center;
      font-size: 0.85rem;
      color: #666;
      line-height: 1.6;
    }
    
    .info a {
      color: #00ff88;
      text-decoration: none;
    }
    
    .info a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1><span class="phi-symbol">Φ</span>-Wave Demo</h1>
  <p class="subtitle">Φ-Harmonic Wavefield Engine v5.0</p>
  
  <div class="canvas-container">
    <canvas id="phi-wave-canvas" width="800" height="600"></canvas>
  </div>
  
  <div class="stats">
    <div class="stat">FPS: <span class="stat-value" id="fps-value">0</span></div>
    <div class="stat">Frame: <span class="stat-value" id="frame-value">0</span></div>
    <div class="stat">Layers: <span class="stat-value" id="layers-value">${finalConfig.layerCount}</span></div>
  </div>
  
  <div class="controls">
    <div class="control-group">
      <h3>Presets</h3>
      <div class="control-row">
        <label>Mode</label>
        <select id="preset-select">
          <option value="default">Default</option>
          <option value="calm">Calm</option>
          <option value="energetic">Energetic</option>
          <option value="harmonic">Harmonic (1/φ)</option>
          <option value="chaos">Chaos</option>
        </select>
      </div>
    </div>
    
    <div class="control-group">
      <h3>Rendering</h3>
      <div class="control-row">
        <label>Mode</label>
        <select id="render-mode">
          <option value="points">Points</option>
          <option value="lines">Lines</option>
          <option value="mesh">Mesh</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
      <div class="control-row">
        <label>Colors</label>
        <select id="color-scheme">
          <option value="phi-spectrum">Φ-Spectrum</option>
          <option value="monochrome">Monochrome</option>
          <option value="heat">Heat</option>
        </select>
      </div>
    </div>
    
    <div class="control-group">
      <h3>Amplitude</h3>
      <div class="control-row">
        <label>Global</label>
        <input type="range" id="amplitude" min="0" max="100" value="80">
      </div>
    </div>
    
    <div class="control-group">
      <h3>Phase</h3>
      <div class="control-row">
        <label>Offset</label>
        <input type="range" id="phase" min="0" max="628" value="0">
      </div>
      <div class="control-row">
        <button class="btn btn-secondary" id="advance-phi">+Φ</button>
        <button class="btn btn-secondary" id="reset-phase">Reset</button>
      </div>
    </div>
    
    <div class="control-group">
      <h3>Playback</h3>
      <div class="control-row">
        <button class="btn" id="play-pause">Pause</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    </div>
  </div>
  
  <div class="info">
    <p>
      This demo showcases the <strong>Φ-Harmonic Wavefield Engine</strong> — 
      a zero-GC render system using golden ratio (φ ≈ 1.618) based harmonics 
      for natural wave patterns.
    </p>
  </div>
  
  <script type="module">
    // Import from your built module or use inline initialization
    // For demo purposes, we'll initialize inline
    
    const canvas = document.getElementById('phi-wave-canvas');
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    
    // Constants
    const PHI = 1.618033988749895;
    const PHI_INV = 1 / PHI;
    const PHI_ANGLE = (2 * Math.PI) / (PHI * PHI);
    const RESOLUTION = 64;
    
    // State
    let running = true;
    let frameIndex = 0;
    let currentTime = 0;
    let lastTimestamp = 0;
    let amplitude = 0.8;
    let phaseOffset = 0;
    let renderMode = 'points';
    let colorScheme = 'phi-spectrum';
    let preset = 'default';
    let layerCount = ${finalConfig.layerCount};
    let baseFrequency = ${finalConfig.baseFrequency};
    
    // Pre-allocated buffers
    const amplitudes = new Float32Array(RESOLUTION * RESOLUTION);
    const phases = new Float32Array(RESOLUTION * RESOLUTION);
    
    // Color LUT
    const COLOR_LUT_SIZE = 256;
    const colorLut = new Array(COLOR_LUT_SIZE);
    
    function initColorLut() {
      for (let i = 0; i < COLOR_LUT_SIZE; i++) {
        const t = i / (COLOR_LUT_SIZE - 1);
        
        if (colorScheme === 'phi-spectrum') {
          const hue = (t * 360 * PHI) % 360;
          const sat = 70 + t * 30;
          const light = 30 + t * 40;
          colorLut[i] = \`hsl(\${hue}, \${sat}%, \${light}%)\`;
        } else if (colorScheme === 'monochrome') {
          const gray = Math.round(t * 255);
          colorLut[i] = \`rgb(\${gray}, \${gray}, \${gray})\`;
        } else {
          if (t < 0.33) {
            const r = Math.round((t / 0.33) * 255);
            colorLut[i] = \`rgb(\${r}, 0, 0)\`;
          } else if (t < 0.66) {
            const g = Math.round(((t - 0.33) / 0.33) * 255);
            colorLut[i] = \`rgb(255, \${g}, 0)\`;
          } else {
            const b = Math.round(((t - 0.66) / 0.34) * 255);
            colorLut[i] = \`rgb(255, 255, \${b})\`;
          }
        }
      }
    }
    
    initColorLut();
    
    // Harmonic computation
    function computeHarmonic(time, harmonicIndex) {
      const freqRatio = Math.pow(PHI, harmonicIndex);
      const ampRatio = Math.pow(PHI_INV, harmonicIndex);
      const phaseShift = (PHI_ANGLE * harmonicIndex) % (2 * Math.PI);
      
      const freq = baseFrequency * freqRatio;
      const phase = (2 * Math.PI * freq * time) + phaseShift;
      
      return Math.sin(phase) * ampRatio;
    }
    
    // Compute wave field
    function computeWaveField(time, dt) {
      const width = 1;
      const height = 1;
      
      for (let i = 0; i < RESOLUTION * RESOLUTION; i++) {
        const x = (i % RESOLUTION) / (RESOLUTION - 1);
        const y = Math.floor(i / RESOLUTION) / (RESOLUTION - 1);
        
        const dx = x - 0.5;
        const dy = y - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy) * 2;
        const angle = Math.atan2(dy, dx);
        
        // Sum harmonics
        let amp = 0;
        for (let h = 0; h < layerCount; h++) {
          const harmonicAmp = computeHarmonic(time + dist * 0.3 + angle / (2 * Math.PI) * 0.2, h);
          amp += harmonicAmp / layerCount;
        }
        
        // Spatial modulation
        const spatialWave = Math.sin(time * 2 * Math.PI * baseFrequency - dist * PHI * 2 * Math.PI + angle * PHI);
        
        amplitudes[i] = (amp * 0.6 + spatialWave * 0.4) * amplitude;
        phases[i] = ((time * 2 * Math.PI + dist * PHI) + phaseOffset) % (2 * Math.PI);
      }
    }
    
    // Render functions
    function renderPoints() {
      const cellWidth = canvas.width / RESOLUTION;
      const cellHeight = canvas.height / RESOLUTION;
      const pointSize = Math.max(2, Math.min(cellWidth, cellHeight) * 0.8);
      
      let index = 0;
      for (let y = 0; y < RESOLUTION; y++) {
        for (let x = 0; x < RESOLUTION; x++) {
          const amp = amplitudes[index];
          const lutIndex = Math.floor(((amp + 1) / 2) * (COLOR_LUT_SIZE - 1));
          const color = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
          
          const px = x * cellWidth + cellWidth / 2;
          const py = y * cellHeight + cellHeight / 2;
          const size = pointSize * (0.3 + Math.abs(amp) * 0.7);
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          
          index++;
        }
      }
    }
    
    function renderLines() {
      const cellWidth = canvas.width / RESOLUTION;
      const cellHeight = canvas.height / RESOLUTION;
      
      ctx.lineWidth = 1;
      
      for (let y = 0; y < RESOLUTION; y++) {
        ctx.beginPath();
        
        for (let x = 0; x < RESOLUTION; x++) {
          const index = y * RESOLUTION + x;
          const amp = amplitudes[index];
          
          const px = x * cellWidth + cellWidth / 2;
          const py = y * cellHeight + cellHeight / 2 + amp * cellHeight * 0.4;
          
          if (x === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        
        const lutIndex = Math.floor((y / RESOLUTION) * (COLOR_LUT_SIZE - 1));
        ctx.strokeStyle = colorLut[lutIndex];
        ctx.stroke();
      }
    }
    
    function renderGradient() {
      const cellWidth = canvas.width / RESOLUTION;
      const cellHeight = canvas.height / RESOLUTION;
      
      let index = 0;
      for (let y = 0; y < RESOLUTION; y++) {
        for (let x = 0; x < RESOLUTION; x++) {
          const amp = amplitudes[index];
          const lutIndex = Math.floor(((amp + 1) / 2) * (COLOR_LUT_SIZE - 1));
          
          ctx.fillStyle = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth + 1, cellHeight + 1);
          
          index++;
        }
      }
    }
    
    function renderMesh() {
      const cellWidth = canvas.width / RESOLUTION;
      const cellHeight = canvas.height / RESOLUTION;
      
      ctx.lineWidth = 0.5;
      
      for (let y = 0; y < RESOLUTION - 1; y++) {
        for (let x = 0; x < RESOLUTION - 1; x++) {
          const i00 = y * RESOLUTION + x;
          const i10 = y * RESOLUTION + x + 1;
          const i01 = (y + 1) * RESOLUTION + x;
          
          const avgAmp = (amplitudes[i00] + amplitudes[i10] + amplitudes[i01]) / 3;
          const lutIndex = Math.floor(((avgAmp + 1) / 2) * (COLOR_LUT_SIZE - 1));
          
          const x0 = x * cellWidth + cellWidth / 2;
          const y0 = y * cellHeight + cellHeight / 2;
          const x1 = (x + 1) * cellWidth + cellWidth / 2;
          const y1 = (y + 1) * cellHeight + cellHeight / 2;
          
          ctx.strokeStyle = colorLut[Math.max(0, Math.min(COLOR_LUT_SIZE - 1, lutIndex))];
          
          ctx.beginPath();
          ctx.moveTo(x0, y0 + amplitudes[i00] * cellHeight * 0.3);
          ctx.lineTo(x1, y0 + amplitudes[i10] * cellHeight * 0.3);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(x0, y0 + amplitudes[i00] * cellHeight * 0.3);
          ctx.lineTo(x0, y1 + amplitudes[i01] * cellHeight * 0.3);
          ctx.stroke();
        }
      }
    }
    
    // Main render loop
    let fps = 0;
    let fpsFrameCount = 0;
    let fpsLastTime = 0;
    
    function render(timestamp) {
      if (!running) {
        requestAnimationFrame(render);
        return;
      }
      
      const dt = lastTimestamp > 0 ? (timestamp - lastTimestamp) / 1000 : 0.016;
      lastTimestamp = timestamp;
      currentTime += dt;
      frameIndex++;
      
      // FPS calculation
      fpsFrameCount++;
      if (timestamp - fpsLastTime >= 1000) {
        fps = fpsFrameCount;
        fpsFrameCount = 0;
        fpsLastTime = timestamp;
        document.getElementById('fps-value').textContent = fps;
      }
      document.getElementById('frame-value').textContent = frameIndex;
      
      // Compute
      computeWaveField(currentTime, dt);
      
      // Clear
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Render
      switch (renderMode) {
        case 'points': renderPoints(); break;
        case 'lines': renderLines(); break;
        case 'mesh': renderMesh(); break;
        case 'gradient': renderGradient(); break;
      }
      
      requestAnimationFrame(render);
    }
    
    // Event handlers
    document.getElementById('play-pause').addEventListener('click', (e) => {
      running = !running;
      e.target.textContent = running ? 'Pause' : 'Play';
    });
    
    document.getElementById('reset').addEventListener('click', () => {
      currentTime = 0;
      frameIndex = 0;
      phaseOffset = 0;
      document.getElementById('phase').value = 0;
    });
    
    document.getElementById('amplitude').addEventListener('input', (e) => {
      amplitude = e.target.value / 100;
    });
    
    document.getElementById('phase').addEventListener('input', (e) => {
      phaseOffset = e.target.value / 100;
    });
    
    document.getElementById('advance-phi').addEventListener('click', () => {
      phaseOffset = (phaseOffset + PHI_ANGLE) % (2 * Math.PI);
      document.getElementById('phase').value = Math.round(phaseOffset * 100);
    });
    
    document.getElementById('reset-phase').addEventListener('click', () => {
      phaseOffset = 0;
      document.getElementById('phase').value = 0;
    });
    
    document.getElementById('render-mode').addEventListener('change', (e) => {
      renderMode = e.target.value;
    });
    
    document.getElementById('color-scheme').addEventListener('change', (e) => {
      colorScheme = e.target.value;
      initColorLut();
    });
    
    document.getElementById('preset-select').addEventListener('change', (e) => {
      preset = e.target.value;
      
      const presets = {
        default: { layerCount: 5, baseFrequency: 0.5 },
        calm: { layerCount: 3, baseFrequency: 0.2 },
        energetic: { layerCount: 8, baseFrequency: 1.5 },
        harmonic: { layerCount: 5, baseFrequency: 0.618 },
        chaos: { layerCount: 12, baseFrequency: 2.0 },
      };
      
      const p = presets[preset];
      layerCount = p.layerCount;
      baseFrequency = p.baseFrequency;
      document.getElementById('layers-value').textContent = layerCount;
      
      currentTime = 0;
      frameIndex = 0;
    });
    
    // Start
    requestAnimationFrame(render);
  </script>
</body>
</html>`;
}

/**
 * Get demo configuration
 */
export function getDemoConfig(preset: PhiWaveDemoConfig['preset'] = 'default'): PhiWaveDemoConfig {
  const presets: Record<PhiWaveDemoConfig['preset'], PhiWaveDemoConfig> = {
    default: {
      preset: 'default',
      layerCount: 5,
      baseFrequency: 0.5,
      showControls: true,
      showStats: true,
    },
    calm: {
      preset: 'calm',
      layerCount: 3,
      baseFrequency: 0.2,
      showControls: true,
      showStats: true,
    },
    energetic: {
      preset: 'energetic',
      layerCount: 8,
      baseFrequency: 1.5,
      showControls: true,
      showStats: true,
    },
    harmonic: {
      preset: 'harmonic',
      layerCount: 5,
      baseFrequency: 0.618,
      showControls: true,
      showStats: true,
    },
    chaos: {
      preset: 'chaos',
      layerCount: 12,
      baseFrequency: 2.0,
      showControls: true,
      showStats: true,
    },
  };
  
  return presets[preset];
}
