// audio.js - Web Audio API Sound Effects & Cozy Library Atmosphere

class SoundController {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.isMuted = false;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.4;
        this.isAmbientPlaying = false;
        this.ambientNodes = [];
        this.lastFootstepTime = 0;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
    }

    ensureContext() {
        if (!this.ctx) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
        }
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, val));
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // --- SFX: Ambil Buku (Kertas berdesir lembut) ---
    playPickupBook() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        filter.Q.setValueAtTime(3.0, t);

        // White noise burst for paper flutter
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(t);
        noise.stop(t + 0.15);
    }

    // --- SFX: Jatuhkan / Letakkan Buku di Lantai ---
    playDropBook() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.12);
    }

    // --- SFX: Masukkan Buku ke Rak Kayu (Thud Kayu Mantap) ---
    playPlaceBook() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        
        // 1. Click/Slide gesekan kayu
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.1);

        oscGain.gain.setValueAtTime(0.35, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);

        // 2. Resonansi kayu padat
        const woodOsc = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        woodOsc.type = 'sine';
        woodOsc.frequency.setValueAtTime(220, t);
        woodOsc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

        woodGain.gain.setValueAtTime(0.5, t);
        woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        woodOsc.connect(woodGain);
        woodGain.connect(this.sfxGain);
        woodOsc.start(t);
        woodOsc.stop(t + 0.15);
    }

    // --- SFX: Berhasil Susun Benar (Harmoni Lonceng Emas) ---
    playSuccessChime() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const t = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.4);
        });
    }

    // --- SFX: Salah Rak / Salah Urutan (Tone Rendah Halus) ---
    playWrongSound() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.25);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        // Lowpass to make it non-annoying
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.25);
    }

    // --- SFX: Langkah Kaki Halus ---
    playFootstep() {
        const now = performance.now();
        if (now - this.lastFootstepTime < 380) return; // limit step rate
        this.lastFootstepTime = now;

        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90 + Math.random() * 20, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.08);
    }

    // --- SFX: Level Complete Fanfare ---
    playLevelWin() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        arpeggio.forEach((freq, idx) => {
            const t = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.6);
        });
    }

    // --- SFX: Game Grand Victory (Level 10) ---
    playGameVictory() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;

        const chords = [
            [523.25, 659.25, 783.99, 1046.5],
            [587.33, 739.99, 880.00, 1174.66],
            [659.25, 830.61, 987.77, 1318.51],
            [1046.5, 1318.51, 1567.98, 2093.00]
        ];

        chords.forEach((chord, stepIdx) => {
            const startTime = this.ctx.currentTime + stepIdx * 0.35;
            chord.forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(startTime);
                osc.stop(startTime + 0.8);
            });
        });
    }

    // --- Suasana Musik Perpustakaan / Lofi Calming Generator ---
    startAmbient() {
        this.ensureContext();
        if (!this.ctx || this.isAmbientPlaying) return;
        this.isAmbientPlaying = true;

        // Warm drone chord
        const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4
        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

            // Subtle LFO for breathing warmth
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, this.ctx.currentTime);
            lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start();
            lfo.start();

            this.ambientNodes.push(osc, lfo, gain, filter, lfoGain);
        });
    }

    stopAmbient() {
        if (!this.isAmbientPlaying) return;
        this.ambientNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this.ambientNodes = [];
        this.isAmbientPlaying = false;
    }
}

export const sound = new SoundController();
