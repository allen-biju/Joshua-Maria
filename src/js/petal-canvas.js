/* --- Upgraded Canvas Particle System with Ambient & Celebration Modes --- */

export class CelebrationCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    
    // Configs
    this.mode = 'ambient'; // 'ambient' or 'celebration'
    this.celebrationDuration = 4500; // 4.5 seconds for heavy rain
    this.celebrationStart = null;
    
    // Performance Fallback Diagnostics
    this.fpsCount = 0;
    this.lastFrameTime = null;
    this.fpsHistory = [];
    this.isLowPowerDevice = false;
    this.maxFallbackFrames = 25; // Disable if low FPS for 25 frames
    
    this.colors = {
      petals: [
        'rgba(255, 255, 255, 0.95)',    // Premium Pure White
        'rgba(250, 246, 238, 0.9)',     // Elegant Warm Ivory
        'rgba(255, 250, 250, 0.95)',    // Soft Snow White
        'rgba(255, 240, 245, 0.88)',    // Lavender Blush (Hint of premium blossom rose-white)
        'rgba(245, 245, 245, 0.85)'     // Whisper White / Silver Tint
      ],
      gold: [
        'rgba(197, 160, 89, 0.65)',     // Pale Gold
        'rgba(229, 196, 131, 0.85)',    // Bright Gold
        'rgba(154, 118, 52, 0.45)'      // Dark Gold
      ]
    };
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  start(mode = 'ambient') {
    if (this.isLowPowerDevice) return; // Do not run on flagged low-power devices
    
    this.mode = mode;
    this.resizeCanvas();
    this.canvas.style.display = 'block';
    
    if (mode === 'ambient') {
      this.canvas.style.opacity = '0.75';
      this.particles = [];
      this.spawnParticles(16); // Tiny particle footprint (16 items) for 0% CPU footprint
    } else {
      // Transitioning to Celebration (RSVP success)
      this.canvas.style.opacity = '1';
      this.celebrationStart = Date.now();
      this.spawnParticles(90); // Add 90 heavy rain particles
    }
    
    // Start loop if not already running
    if (!this.animationId) {
      this.lastFrameTime = performance.now();
      this.loop();
    }
  }

  spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      const isPetal = Math.random() > 0.45;
      const isCelebration = this.mode === 'celebration';
      
      if (isPetal) {
        // Organic floating petals
        this.particles.push({
          type: 'petal',
          x: Math.random() * this.canvas.width,
          y: Math.random() * -this.canvas.height - 20,
          size: Math.random() * 8 + (isCelebration ? 8 : 6),
          speedY: Math.random() * (isCelebration ? 1.8 : 0.8) + (isCelebration ? 1.2 : 0.5),
          speedX: Math.random() * 0.6 - 0.3,
          color: this.colors.petals[Math.floor(Math.random() * this.colors.petals.length)],
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 1.5 - 0.75,
          swingSpeed: Math.random() * 0.015 + 0.005,
          swingWidth: Math.random() * (isCelebration ? 20 : 12) + 8,
          swingOffset: Math.random() * 100,
          isExtra: isCelebration // Mark if spawned during celebration
        });
      } else {
        // Gold sparkles / diamonds
        this.particles.push({
          type: 'sparkle',
          x: Math.random() * this.canvas.width,
          y: Math.random() * -this.canvas.height - 20,
          size: Math.random() * (isCelebration ? 3.5 : 2.5) + 1,
          speedY: Math.random() * (isCelebration ? 2.2 : 1.2) + (isCelebration ? 1.0 : 0.6),
          speedX: Math.random() * 1.0 - 0.5,
          color: this.colors.gold[Math.floor(Math.random() * this.colors.gold.length)],
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          isExtra: isCelebration
        });
      }
    }
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate((p.rotation * Math.PI) / 180);
    
    // Create soft gradient for premium 3D petal depth
    const gradient = this.ctx.createLinearGradient(0, -p.size, 0, p.size);
    gradient.addColorStop(0, p.color);
    // Dynamic replacement to make the tip slightly softer/more translucent
    gradient.addColorStop(1, p.color.replace(/[\d.]+\)$/, '0.65)')); 
    
    this.ctx.fillStyle = gradient;
    
    // Soft shadow for realistic overlays on top of text/images
    this.ctx.shadowColor = 'rgba(58, 53, 45, 0.04)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.3, p.size * 0.6);
    this.ctx.quadraticCurveTo(0, p.size, -p.size * 0.3, p.size * 0.6);
    this.ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.5, 0, -p.size);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSparkle(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate((p.rotation * Math.PI) / 180);
    this.ctx.fillStyle = p.color;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.lineTo(p.size * 0.6, 0);
    this.ctx.lineTo(0, p.size);
    this.ctx.lineTo(-p.size * 0.6, 0);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  loop() {
    if (this.isLowPowerDevice) {
      this.stop();
      return;
    }

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Performance Fallback Monitor
    // 1 frame took longer than 33ms (equivalent to < 30 FPS)
    if (elapsed > 33) {
      this.fpsHistory.push(elapsed);
      if (this.fpsHistory.length > this.maxFallbackFrames) {
        console.warn("Low performance detected. Disabling background canvas particles to conserve battery and CPU.");
        this.isLowPowerDevice = true;
        this.stop();
        return;
      }
    } else {
      // Gradually empty history if performance returns to 60FPS
      if (this.fpsHistory.length > 0) this.fpsHistory.shift();
    }

    // Clear context
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let isCelebrationRunning = false;
    let celebrationElapsed = 0;
    
    if (this.mode === 'celebration') {
      celebrationElapsed = Date.now() - this.celebrationStart;
      if (celebrationElapsed < this.celebrationDuration) {
        isCelebrationRunning = true;
      } else {
        // Celebration finished, switch back to ambient
        this.mode = 'ambient';
        this.canvas.style.opacity = '0.75';
      }
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update coordinates
      p.y += p.speedY;
      
      if (p.type === 'petal') {
        p.swingOffset += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swingOffset) * 0.25;
        p.rotation += p.rotationSpeed;
        this.drawPetal(p);
      } else {
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        this.drawSparkle(p);
      }

      // Recycle or destroy particle if it falls off-screen
      if (p.y > this.canvas.height + 20) {
        if (p.isExtra && !isCelebrationRunning) {
          // Remove extra celebration particles when celebration expires
          this.particles.splice(i, 1);
        } else {
          // Recycle ambient particles
          p.y = -20;
          p.x = Math.random() * this.canvas.width;
          
          // Re-randomize speeds slightly to prevent sync patterns
          p.speedY = Math.random() * (isCelebrationRunning ? 1.8 : 0.8) + (isCelebrationRunning ? 1.2 : 0.5);
        }
      }
    }

    // Request next frame
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }
}
