/* --- Upgraded HTML5 Ambient Audio Player --- */

export class AmbientPlayer {
  constructor(audioPath) {
    this.audioPath = audioPath;
    this.isPlaying = false;
    this.audioElement = null;
    
    // UI Elements
    this.widget = document.getElementById('audio-widget');
    this.playIcon = document.getElementById('audio-play-icon');
    this.pauseIcon = document.getElementById('audio-pause-icon');
    
    this.init();
  }

  init() {
    if (!this.widget) return;
    
    // Initialize HTML5 Audio Element
    this.audioElement = new Audio(this.audioPath);
    this.audioElement.loop = true;
    this.audioElement.volume = 0; // Start at 0 for smooth fade-in
    
    this.widget.addEventListener('click', () => this.toggle());
  }

  fadeIn(duration = 2000) {
    if (!this.audioElement) return;
    
    this.audioElement.volume = 0;
    this.audioElement.play()
      .then(() => {
        const start = performance.now();
        const animate = (time) => {
          const elapsed = time - start;
          const progress = Math.min(1, elapsed / duration);
          
          if (this.isPlaying && this.audioElement) {
            this.audioElement.volume = progress;
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
        };
        requestAnimationFrame(animate);
      })
      .catch(err => {
        console.warn("Audio playback blocked or failed to play:", err);
      });
  }

  fadeOut(duration = 1500) {
    if (!this.audioElement) return;
    
    const startVolume = this.audioElement.volume;
    const start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      
      if (this.audioElement) {
        this.audioElement.volume = startVolume * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.audioElement.pause();
        }
      }
    };
    requestAnimationFrame(animate);
  }

  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.widget.classList.add('visible');
    this.widget.querySelector('.audio-icon-btn').classList.add('spinning');
    this.playIcon.style.display = 'none';
    this.pauseIcon.style.display = 'block';

    this.fadeIn(2000);
    console.log("Playing ambient background audio with smooth fade-in.");
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.widget.querySelector('.audio-icon-btn').classList.remove('spinning');
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
