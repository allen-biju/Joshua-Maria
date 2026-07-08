/* --- Upgraded HTML5 Ambient Audio Player --- */

export class AmbientPlayer {
  constructor(audioPath) {
    this.audioPath = audioPath;
    this.isPlaying = false;
    this.audioElement = null;
    this.fadeAnimationId = null; // tracks the active rAF id so we can cancel it
    
    // UI Elements
    this.widget = document.getElementById('audio-widget');
    this.playIcon = document.getElementById('audio-play-icon');
    this.pauseIcon = document.getElementById('audio-pause-icon');
    this.iconBtn = null; // cached after DOM is ready in init()
    
    this.init();
  }

  init() {
    if (!this.widget) return;

    // Cache the icon button reference once so start() / stop() never re-query the DOM
    this.iconBtn = this.widget.querySelector('.audio-icon-btn');

    // Initialize HTML5 Audio Element
    this.audioElement = new Audio(this.audioPath);
    this.audioElement.loop = true;
    this.audioElement.volume = 0; // Start at 0 for smooth fade-in

    this.widget.addEventListener('click', () => this.toggle());
  }

  fadeIn(duration = 2000) {
    if (!this.audioElement) return;

    // Cancel any fade that is already running before starting a new one
    if (this.fadeAnimationId !== null) {
      cancelAnimationFrame(this.fadeAnimationId);
      this.fadeAnimationId = null;
    }

    this.audioElement.volume = 0;
    this.audioElement.play()
      .then(() => {
        const start = performance.now();
        const animate = (time) => {
          const elapsed = time - start;
          const progress = Math.min(1, elapsed / duration);

          if (this.isPlaying && this.audioElement) {
            // Clamp to [0, 1] so floating-point drift can never produce an invalid value
            this.audioElement.volume = Math.max(0, Math.min(1, progress));
            if (progress < 1) {
              this.fadeAnimationId = requestAnimationFrame(animate);
            } else {
              this.fadeAnimationId = null;
            }
          }
        };
        this.fadeAnimationId = requestAnimationFrame(animate);
      })
      .catch(err => {
        console.warn("Audio playback blocked or failed to play:", err);
      });
  }

  fadeOut(duration = 1500) {
    if (!this.audioElement) return;

    // Cancel any fade that is already running before starting a new one
    if (this.fadeAnimationId !== null) {
      cancelAnimationFrame(this.fadeAnimationId);
      this.fadeAnimationId = null;
    }

    const startVolume = this.audioElement.volume;
    const start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);

      if (this.audioElement) {
        // Clamp to [0, 1] so floating-point drift can never produce an invalid value
        this.audioElement.volume = Math.max(0, Math.min(1, startVolume * (1 - progress)));
        if (progress < 1) {
          this.fadeAnimationId = requestAnimationFrame(animate);
        } else {
          this.audioElement.volume = 0; // guarantee silence before pausing
          this.audioElement.pause();
          this.fadeAnimationId = null;
        }
      }
    };
    this.fadeAnimationId = requestAnimationFrame(animate);
  }

  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.widget.classList.add('visible');
    if (this.iconBtn) this.iconBtn.classList.add('spinning');
    this.playIcon.style.display = 'none';
    this.pauseIcon.style.display = 'block';

    this.fadeIn(2000);
    console.log("Playing ambient background audio with smooth fade-in.");
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.iconBtn) this.iconBtn.classList.remove('spinning');
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
    
    this.fadeOut(1500);
    console.log("Stopping ambient background audio with smooth fade-out.");
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}
