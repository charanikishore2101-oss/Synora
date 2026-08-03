// Web Audio API Procedural Sound Synthesizer for LUMA Focus Studio

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // White noise generator node
  private createNoiseBuffer(ctx: AudioContext, durationSec = 5): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Sound 1: Rain Generator
  public playRain(volume = 0.5): () => void {
    const ctx = this.initCtx();
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Pink/Rain filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();

    const stop = () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch {
        // Safe disconnect
      }
    };

    this.nodes.set('rain', { gain, stop });
    return stop;
  }

  // Sound 2: Ocean Waves
  public playWaves(volume = 0.5): () => void {
    const ctx = this.initCtx();
    const noiseBuffer = this.createNoiseBuffer(ctx, 6);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 1.0;

    // LFO for swell
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // 8 second cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = volume;

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start();
    noiseSource.start();

    const stop = () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        lfo.disconnect();
      } catch {
        // Safe disconnect
      }
    };

    this.nodes.set('waves', { gain, stop });
    return stop;
  }

  // Sound 3: Forest Wind
  public playForest(volume = 0.5): () => void {
    const ctx = this.initCtx();
    const noiseBuffer = this.createNoiseBuffer(ctx, 5);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 3.0;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = volume;

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start();
    noiseSource.start();

    const stop = () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        lfo.disconnect();
      } catch {
        // Safe disconnect
      }
    };

    this.nodes.set('forest', { gain, stop });
    return stop;
  }

  // Sound 4: Pure White Noise
  public playWhiteNoise(volume = 0.5): () => void {
    const ctx = this.initCtx();
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.3; // White noise is loud

    noiseSource.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();

    const stop = () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {
        // Safe disconnect
      }
    };

    this.nodes.set('whitenoise', { gain, stop });
    return stop;
  }

  // Sound 5: Cyberpunk Drone Synth
  public playSynth(volume = 0.5): () => void {
    const ctx = this.initCtx();

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // A1 drone

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 110; // A2 fifth

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.35;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    const stop = () => {
      try {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      } catch {
        // Safe disconnect
      }
    };

    this.nodes.set('synth', { gain, stop });
    return stop;
  }

  public setVolume(soundId: string, volume: number) {
    const item = this.nodes.get(soundId);
    if (item && item.gain) {
      item.gain.gain.setTargetAtTime(volume, this.initCtx().currentTime, 0.05);
    }
  }

  public stopSound(soundId: string) {
    const item = this.nodes.get(soundId);
    if (item) {
      item.stop();
      this.nodes.delete(soundId);
    }
  }

  public stopAll() {
    this.nodes.forEach((item) => item.stop());
    this.nodes.clear();
  }
}

export const audioSynth = new AudioSynthEngine();
