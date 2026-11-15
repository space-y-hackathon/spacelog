class AudioManager {
  constructor() {
    this.currentBGM = null;
    this.bgmVolume = 1.0;
    this.sfxVolume = 1.0;
    this.muted = false;

    // Web Audio API untuk SFX tanpa delay
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = AudioCtx ? new AudioCtx() : null;
    this.sfxBuffers = new Map(); // Menyimpan hasil decode audio di RAM
    this.activeSFX = new Map();  // Menyimpan node suara yang sedang berbunyi

    // Fallback ke HTML5 Audio jika browser sangat lawas
    this.sfxCache = new Map();

    // Buka kunci audio otomatis pada interaksi pertama user
    this._setupUnlock();
  }

  _setupUnlock() {
    const unlock = () => {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
  }

  // Memuat & mendekode SFX ke memori lebih awal
  preloadSFX(sources) {
    sources.forEach(async (src) => {
      if (!src || this.sfxBuffers.has(src)) return;

      if (this.ctx) {
        try {
          const response = await fetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.sfxBuffers.set(src, audioBuffer);
        } catch (err) {
          console.warn("Gagal decode SFX:", src, err);
        }
      }
    });
  }

  playBGM(src) {
    if (!src) return;

    const resolvedSrc = new URL(src, window.location.href).href;
    if (this.currentBGM?.src === resolvedSrc) return;

    this.stopBGM();

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = this.muted ? 0 : this.bgmVolume;

    this.currentBGM = audio;
    audio.play().catch((error) => {
      console.warn("BGM gagal diputar:", error);
    });
  }

  stopBGM() {
    if (!this.currentBGM) return;
    this.currentBGM.pause();
    this.currentBGM.currentTime = 0;
    this.currentBGM = null;
  }

  playSFX(src) {
    if (!src || this.muted) return;

    // Jalur Cepat (Zero-Latency) dengan Web Audio API
    if (this.ctx && this.sfxBuffers.has(src)) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const source = this.ctx.createBufferSource();
      const gainNode = this.ctx.createGain();

      source.buffer = this.sfxBuffers.get(src);
      gainNode.gain.value = this.muted ? 0 : this.sfxVolume;

      source.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      // Cari titik awal suara (otomatis melewati bagian hening di awal MP3)
      const offset = this._findAudioStartOffset(source.buffer);
      source.start(0, offset);

      if (!this.activeSFX.has(src)) {
        this.activeSFX.set(src, new Set());
      }
      const activeEntry = { source, gainNode };
      this.activeSFX.get(src).add(activeEntry);

      source.onended = () => {
        this.activeSFX.get(src)?.delete(activeEntry);
      };

      return source;
    }

    // Jika belum selesai di-decode, trigger preload untuk pemutaran berikutnya
    this.preloadSFX([src]);
  }

  // Fungsi otomatis memotong "leading silence" (jeda hening di awal file MP3)
  _findAudioStartOffset(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const threshold = 0.005; // Batas minimal gelombang suara
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        return i / audioBuffer.sampleRate;
      }
    }
    return 0;
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, Number(volume)));
    if (this.currentBGM) {
      this.currentBGM.volume = this.muted ? 0 : this.bgmVolume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(volume)));
    this.activeSFX.forEach((entries) => {
      entries.forEach(({ gainNode }) => {
        gainNode.gain.value = this.muted ? 0 : this.sfxVolume;
      });
    });
  }

  setMute(value) {
    this.muted = value;
    if (this.currentBGM) {
      this.currentBGM.volume = value ? 0 : this.bgmVolume;
    }
    this.activeSFX.forEach((entries) => {
      entries.forEach(({ gainNode }) => {
        gainNode.gain.value = value ? 0 : this.sfxVolume;
      });
    });
  }

  stopSFX(src) {
    if (!src) return;
    const entries = this.activeSFX.get(src);
    if (entries) {
      entries.forEach(({ source }) => {
        try {
          source.stop();
        } catch (e) {
          // Abaikan jika sudah berhenti
        }
      });
      entries.clear();
    }
  }
}

const audioManager = new AudioManager();
export default audioManager;