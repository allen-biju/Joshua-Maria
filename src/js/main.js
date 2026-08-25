/* --- Upgraded Main Application Orchestrator --- */

import { AmbientPlayer } from './audio-player.js';
import { RSVPHandler } from './rsvp-handler.js';
import { CelebrationCanvas } from './petal-canvas.js';
import weddingMusic from '../assets/audio/wedding_bg.mp3';

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Initialize Classes
  const audioPlayer = new AmbientPlayer(weddingMusic);
  
  // Confetti celebration canvas on RSVP success
  const canvasEffect = new CelebrationCanvas('celebration-canvas');
  
  // Ambient falling petals canvas in background
  const ambientCanvas = new CelebrationCanvas('ambient-canvas');
  
  const rsvp = new RSVPHandler(() => {
    // On RSVP submission success, start heavy petal rain shower
    canvasEffect.start('celebration');
  });

  // Set a stable CSS viewport height variable for mobile browsers.
  // Android browser chrome can report a shorter visualViewport while the
  // layout viewport is taller, so use the largest live viewport signal.
  function getViewportHeight() {
    return Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      window.visualViewport ? window.visualViewport.height : 0
    );
  }

  function setSVH() {
    const svh = getViewportHeight();
    document.documentElement.style.setProperty('--svh', svh + 'px');
    document.documentElement.style.setProperty('--vh', (svh * 0.01) + 'px');
  }
  setSVH();
  window.addEventListener('resize', setSVH);
  window.addEventListener('scroll', setSVH, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setSVH);
  }
  window.addEventListener('orientationchange', () => setTimeout(setSVH, 200));

  // 2. Interactive Preloader Logic (Upgraded: smooth progressive minimum-duration load)
  const preloader = document.getElementById('interactive-preloader');
  const loadingRing = document.getElementById('loading-ring');
  const preloaderPercentage = document.getElementById('preloader-percentage');
  const plSkipBtn = document.getElementById('pl-skip-btn');
  
  const loaderStartTime = Date.now();
  const minLoaderDuration = 2500; // Guarantee 2.5s minimum load display
  let pageResourcesLoaded = false;
  let currentLoaderProgress = 0;
  
  function updateLoader() {
    const elapsed = Date.now() - loaderStartTime;
    let targetProgress = 0;
    
    if (!pageResourcesLoaded) {
      // Slow load fallback: reach up to 95% over 6 seconds
      targetProgress = Math.min(95, (elapsed / 6000) * 95);
    } else {
      // Fully loaded resources: animate to 100% by the end of minLoaderDuration
      if (elapsed < minLoaderDuration) {
        targetProgress = (elapsed / minLoaderDuration) * 100;
      } else {
        targetProgress = 100;
      }
    }
    
    // Smooth ease-out interpolation
    currentLoaderProgress += (targetProgress - currentLoaderProgress) * 0.08;
    
    // Check if we are close enough to 100% to snap and complete
    if (targetProgress === 100 && (100 - currentLoaderProgress) < 0.5) {
      currentLoaderProgress = 100;
    }
    
    const displayProgress = Math.min(100, Math.floor(currentLoaderProgress));
    if (loadingRing) loadingRing.style.setProperty('--p', displayProgress + '%');
    if (preloaderPercentage) preloaderPercentage.innerText = displayProgress + '%';
    
    if (displayProgress >= 100) {
      setTimeout(() => {
        if (preloader) {
          preloader.style.opacity = '0';
          preloader.style.visibility = 'hidden';
          setTimeout(() => preloader.remove(), 800);
        }
      }, 400);
    } else {
      requestAnimationFrame(updateLoader);
    }
  }
  
  // Start the animated loader loop
  requestAnimationFrame(updateLoader);
  
  // Register page loaded event
  window.addEventListener('load', () => {
    pageResourcesLoaded = true;
  });
  
  // Fallback: force page loaded status after 5 seconds in case of network issues
  setTimeout(() => {
    pageResourcesLoaded = true;
  }, 5000);
  
  // Skip button handler
  if (plSkipBtn) {
    plSkipBtn.addEventListener('click', () => {
      pageResourcesLoaded = true;
      currentLoaderProgress = 100;
      if (loadingRing) loadingRing.style.setProperty('--p', '100%');
      if (preloaderPercentage) preloaderPercentage.innerText = '100%';
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => preloader.remove(), 800);
      }
    });
  }

  // 3. Envelope Hover 3D Parallax & Letters Open Interaction
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelopeContainer = document.getElementById('envelope-container');
  const mainContent = document.getElementById('main-content');
  const weddingFrameStage = document.getElementById('wedding-frame-stage');
  const frameAssemblyDuration = 2600;
  
  // 3A. Mouse Move 3D Tilt Effect
  if (envelopeContainer && envelopeWrapper) {
    envelopeContainer.addEventListener('mousemove', (e) => {
      if (envelopeWrapper.classList.contains('opened')) {
        envelopeWrapper.style.transform = '';
        return;
      }
      
      const rect = envelopeContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate tilt angles (limit to max 10 degrees)
      const tiltX = -(y / (rect.height / 2)) * 10;
      const tiltY = (x / (rect.width / 2)) * 10;
      
      envelopeWrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
    });
    
    envelopeContainer.addEventListener('mouseleave', () => {
      if (envelopeWrapper.classList.contains('opened')) return;
      envelopeWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }
  
  // 3B. Dynamic Particle Burst Sparkle Generator
  function createSparkleBurst(element) {
    const container = document.getElementById('envelope-container');
    if (!container) return;
    
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Middle position of wax seal relative to envelope overlay
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;
    
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'gold-sparkle';
      
      // Randomize shape clip paths: 50% circle, 25% diamond, 25% star
      const shapeRand = Math.random();
      if (shapeRand > 0.75) {
        particle.classList.add('sparkle-star');
      } else if (shapeRand > 0.5) {
        particle.classList.add('sparkle-diamond');
      }
      
      // Velocity vectors (x and y offsets)
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const vx = Math.cos(angle) * speed * 12;
      const vy = Math.sin(angle) * speed * 12;
      
      // Size variance (from 4px to 10px)
      const size = 4 + Math.random() * 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      
      // Custom variables passed to keyframes
      particle.style.setProperty('--vx', `${vx}px`);
      particle.style.setProperty('--vy', `${vy}px`);
      particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
      
      container.appendChild(particle);
      
      // Clean up DOM
      setTimeout(() => particle.remove(), 1000);
    }
  }

  function adjustFrameStageHeight() {
    setSVH();
  }

  function startFrameAssembly() {
    adjustFrameStageHeight();
    document.body.classList.add('frame-sequence-active');
    
    if (weddingFrameStage) {
      weddingFrameStage.hidden = false;
      weddingFrameStage.classList.remove('frame-stage-assembling', 'frame-stage-assembled');
      weddingFrameStage.classList.add('frame-stage-visible');

      // Mobile browsers can coalesce hidden -> visible -> assembling into one
      // paint. Force the initial off-screen state to render before animating in.
      void weddingFrameStage.offsetHeight;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          weddingFrameStage.classList.add('frame-stage-assembling');
        });
      });
    }
    
    setTimeout(() => {
      document.body.classList.add('frame-active');
      
      if (weddingFrameStage) {
        weddingFrameStage.classList.add('frame-stage-assembled');
      }
      
      if (mainContent) {
        mainContent.style.display = 'block';
        requestAnimationFrame(() => {
          mainContent.style.opacity = '1';
          drawTimelineCurve();
        });
      }
      
      triggerScrollReveals();
      resizeGallery();
      updateScrollMetrics();
      drawTimelineCurve();
    }, frameAssemblyDuration);
  }
  
  if (openEnvelopeBtn && envelopeWrapper) {
    openEnvelopeBtn.addEventListener('click', () => {
      // Start background soundscape
      audioPlayer.start();
      
      // Trigger envelope flap folding open and card sliding up (styled in CSS)
      envelopeWrapper.classList.add('opened');
      
      // Trigger golden sparkle burst on click
      createSparkleBurst(openEnvelopeBtn);
      
      // Start background ambient floating petals immediately
      ambientCanvas.start('ambient');
      
      // Stage 2: Fade envelope out and assemble the custom frame
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.style.opacity = '0';
          envelopeContainer.style.transform = 'translateY(120px) scale(0.92)';
        }
        startFrameAssembly();
      }, 2200); // Wait for flap opening + full card slide transitions (2.2s total)
      
      // Stage 3: Clean up envelope from DOM after the frame has taken over
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.remove();
        }
      }, 2200 + frameAssemblyDuration + 600);
    });
  }

  // 4. Character-by-Character Text Splitting Utility
  const splitTextElements = document.querySelectorAll('.split-text');
  splitTextElements.forEach(el => {
    const textContent = el.textContent.trim();
    el.innerHTML = ''; // Empty text
    
    // Split into letters
    [...textContent].forEach((char, index) => {
      const span = document.createElement('span');
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
        span.className = 'char-reveal';
        // Add staggering transition delay inline style variable
        span.style.transitionDelay = `calc(${index} * 0.05s)`;
      }
      el.appendChild(span);
    });
  });

  // 5. Scroll Reveal Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-element');
  
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };
 
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // If it contains split-text character spans, reveal them
        const chars = entry.target.querySelectorAll('.char-reveal');
        chars.forEach(char => char.classList.add('revealed'));
        
        // If it's a timeline node, mark active
        if (entry.target.classList.contains('timeline-node')) {
          entry.target.classList.add('active');
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
 
  function triggerScrollReveals() {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 6. High-Performance Throttled Scroll Engine (Scroll Bar, Nav, Timeline, Back-to-Top, Mouse-Indicator)
  const timeline = document.querySelector('.timeline');
  const progressLine = document.getElementById('timeline-progress');
  const heroScrollIndicator = document.getElementById('hero-scroll-indicator');
  const siteNav = document.getElementById('site-nav');
  const backToTopBtn = document.getElementById('back-to-top');
  const heroSection = document.getElementById('hero');
  const gallerySection = document.querySelector('.gallery-section');
  const galleryTrack = document.getElementById('gallery-masonry-track');

  if (mainContent) {
    mainContent.style.display = 'none';
  }

  if (heroScrollIndicator) {
    heroScrollIndicator.addEventListener('click', () => {
      const nextSection = document.getElementById('story') || document.getElementById('timeline');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  let lastScrollY = 0;
  let scrollTicking = false;
  const mainContentScrollContainer = document.getElementById('main-content');

  function drawTimelineCurve() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    const svg = document.querySelector('.timeline-curve-svg');
    const pathBg = document.querySelector('.timeline-curve-path-bg');
    const pathProgress = document.querySelector('.timeline-curve-path-progress');
    if (!svg || !pathBg) return;

    const markers = timeline.querySelectorAll('.timeline-marker');
    if (markers.length < 2) return;

    const timelineRect = timeline.getBoundingClientRect();
    
    let pathD = '';
    const points = [];

    markers.forEach(marker => {
      const rect = marker.getBoundingClientRect();
      const x = rect.left - timelineRect.left + rect.width / 2;
      const y = rect.top - timelineRect.top + rect.height / 2;
      points.push({ x, y });
    });

    pathD = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      pathD += ` L ${p1.x} ${p1.y}`;
    }

    pathBg.setAttribute('d', pathD);
    if (pathProgress) {
      pathProgress.setAttribute('d', pathD);
      const pathLength = pathProgress.getTotalLength();
      pathProgress.style.strokeDasharray = `${pathLength} ${pathLength}`;
      pathProgress.style.strokeDashoffset = pathLength;
      pathProgress.style.opacity = '1';
    }
  }

  function updateScrollMetrics() {
    const isFrameActive = document.body.classList.contains('frame-active');
    const scrollContainer = isFrameActive 
      ? (document.getElementById('main-content') || document.documentElement)
      : (document.scrollingElement || document.documentElement);
      
    const currentScrollY = isFrameActive ? scrollContainer.scrollTop : window.scrollY;
    const documentHeight = isFrameActive
      ? scrollContainer.scrollHeight - scrollContainer.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;

    // Calculate scroll percentage (0 to 1)
    const scrollPercent = documentHeight > 0 ? currentScrollY / documentHeight : 0;

    // 1. Update Scroll Progress CSS Property
    document.documentElement.style.setProperty('--scroll-percent', scrollPercent);
    document.documentElement.style.setProperty('--scroll-y', `${currentScrollY}px`);

    // 2. Hide Hero Scroll Indicator on scroll down
    if (heroScrollIndicator) {
      heroScrollIndicator.classList.toggle('hidden', currentScrollY > 100);
    }

    // 3. Sticky Nav — show after scrolling past hero height, add glass bg after 80px
    if (siteNav) {
      const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
      siteNav.classList.toggle('nav-visible', currentScrollY > heroHeight * 0.85);
      siteNav.classList.toggle('nav-scrolled', currentScrollY > 80);
    }

    // 4. Back-to-Top button — show after 600px of scroll
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', currentScrollY > 600);
    }

    // 5. Scroll-Driven Timeline Progress Line
    const pathProgress = document.querySelector('.timeline-curve-path-progress');
    if (timeline && pathProgress) {
      const timelineRect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const timelineTop = timelineRect.top + currentScrollY;
      const timelineHeight = timelineRect.height;
      const targetScroll = currentScrollY + (windowHeight * 0.75);

      let progress = 0;
      if (targetScroll > timelineTop) {
        progress = (targetScroll - timelineTop) / timelineHeight;
        progress = Math.max(0, Math.min(1, progress));
      }

      try {
        const pathLength = pathProgress.getTotalLength();
        pathProgress.style.strokeDasharray = `${pathLength} ${pathLength}`;
        pathProgress.style.strokeDashoffset = pathLength * (1 - progress);
        pathProgress.style.opacity = '1';
      } catch (e) {
        // SVG path is not rendered or has 0 length
      }
    }

    // 6. Horizontal Scroll for Masonry Gallery (Pinning behavior with Premium transitions)
    if (gallerySection && galleryTrack) {
      const sectionTop = gallerySection.getBoundingClientRect().top + currentScrollY;
      const sectionHeight = gallerySection.offsetHeight;
      const maxScrollX = galleryTrack.scrollWidth - gallerySection.clientWidth;
      
      if (maxScrollX > 0) {
        const relativeScrollY = currentScrollY - sectionTop;
        const stickyContainer = gallerySection.querySelector('.gallery-sticky-container');
        const stickyHeight = stickyContainer ? stickyContainer.offsetHeight : window.innerHeight;
        const totalPinScroll = sectionHeight - stickyHeight;
        
        if (relativeScrollY >= 0 && relativeScrollY <= totalPinScroll) {
          const progress = relativeScrollY / totalPinScroll;
          const translateX = progress * maxScrollX;
          galleryTrack.style.transform = `translateX(-${translateX}px)`;
        } else if (relativeScrollY < 0) {
          galleryTrack.style.transform = 'translateX(0px)';
        } else if (relativeScrollY > totalPinScroll) {
          galleryTrack.style.transform = `translateX(-${maxScrollX}px)`;
        }

        // Calculate and apply premium 3D transforms & parallax on each card
        const items = galleryTrack.querySelectorAll('.gallery-item');
        const wrapperRect = gallerySection.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

        items.forEach(item => {
          const itemRect = item.getBoundingClientRect();
          const itemCenter = itemRect.left + itemRect.width / 2;
          
          // Normalized distance from center of the gallery wrapper (-1 to 1)
          const distance = (itemCenter - wrapperCenter) / (wrapperRect.width / 2);
          const clampedDistance = Math.max(-1.5, Math.min(1.5, distance));
          
          // 1. 3D rotate cards slightly inward towards center
          const scrollTiltY = clampedDistance * -10; // up to 10 degrees Y rotation
          item.style.setProperty('--scroll-tilt-y', `${scrollTiltY}deg`);
          
          // 2. Scale cards down slightly when moving off-center
          const scrollScale = 1 - Math.min(0.08, Math.abs(clampedDistance) * 0.05); // scale ranges from 1 to 0.92
          item.style.setProperty('--scroll-scale', `${scrollScale}`);
          
          // 3. Horizontal parallax shift for image inside card (in opposite direction)
          const parallaxX = -clampedDistance * 12; // up to 12% shift
          item.style.setProperty('--img-parallax-x', `${parallaxX}%`);
        });

      } else {
        galleryTrack.style.transform = 'translateX(0px)';
        
        // Reset scroll transformations if track has no overflow
        const items = galleryTrack.querySelectorAll('.gallery-item');
        items.forEach(item => {
          item.style.setProperty('--scroll-tilt-y', '0deg');
          item.style.setProperty('--scroll-scale', '1');
          item.style.setProperty('--img-parallax-x', '0%');
        });
      }
    }

    lastScrollY = currentScrollY;
  }

  function resizeGallery() {
    if (gallerySection && galleryTrack) {
      const maxScrollX = galleryTrack.scrollWidth - gallerySection.clientWidth;
      if (maxScrollX > 0) {
        // Pin duration is 1.5 times the scroll distance (or minimum of 1000px) for smooth speed
        const pinDuration = Math.max(1000, maxScrollX * 1.5);
        const stickyContainer = gallerySection.querySelector('.gallery-sticky-container');
        const stickyHeight = stickyContainer ? stickyContainer.offsetHeight : window.innerHeight;
        gallerySection.style.height = `${stickyHeight + pinDuration}px`;
      } else {
        gallerySection.style.height = 'auto';
      }
    }
  }

  // Calculate gallery height and timeline curves on setup and on resize/load events
  resizeGallery();
  drawTimelineCurve();

  window.addEventListener('resize', () => {
    resizeGallery();
    drawTimelineCurve();
  });
  
  window.addEventListener('load', () => {
    resizeGallery();
    drawTimelineCurve();
  });

  if (mainContentScrollContainer) {
    mainContentScrollContainer.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          updateScrollMetrics();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // Setup ResizeObserver to dynamically update height when track or section size changes
  if (typeof ResizeObserver !== 'undefined' && galleryTrack && gallerySection) {
    const galleryRO = new ResizeObserver(() => {
      resizeGallery();
    });
    galleryRO.observe(galleryTrack);
    galleryRO.observe(gallerySection);
  }
 
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollMetrics();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { capture: true, passive: true });
  
  // Trigger initial metrics run
  updateScrollMetrics();

  // Back-to-Top smooth scroll
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      const isFrameActive = document.body.classList.contains('frame-active');
      const scrollContainer = isFrameActive ? document.getElementById('main-content') : null;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Mobile hamburger menu toggle
  const navMenuToggle = document.getElementById('nav-menu-toggle');
  const navMobileDrawer = document.getElementById('nav-mobile-drawer');

  if (navMenuToggle && navMobileDrawer) {
    navMenuToggle.addEventListener('click', () => {
      const isOpen = navMenuToggle.classList.toggle('open');
      navMobileDrawer.classList.toggle('open', isOpen);
      navMenuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close drawer when a mobile nav link is clicked
    navMobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenuToggle.classList.remove('open');
        navMobileDrawer.classList.remove('open');
        navMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 7. Cursor-Tracking 3D Card Tilt & Glare Effect
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  // Disable 3D tilt completely on mobile touch screens to save battery & processing power
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice) {
    tiltCards.forEach(card => {
      // Find or create glare element
      let glare = card.querySelector('.tilt-card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'tilt-card-glare';
        card.appendChild(glare);
      }
      
      const maxTilt = parseFloat(card.dataset.tiltMax) || 8; // Default tilt limit
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // Mouse x relative to card
        const y = e.clientY - rect.top;  // Mouse y relative to card
        
        const width = rect.width;
        const height = rect.height;
        
        // Normalize coordinates relative to card center (-1 to 1)
        const pctX = (x - width / 2) / (width / 2);
        const pctY = (y - height / 2) / (height / 2);
        
        // Calculate tilt angles (rotateY uses pctX, rotateX uses pctY)
        const rotateY = (pctX * maxTilt).toFixed(2);
        const rotateX = (-pctY * maxTilt).toFixed(2);
        
        // Update CSS custom properties
        card.style.setProperty('--card-tilt-x', `${rotateX}deg`);
        card.style.setProperty('--card-tilt-y', `${rotateY}deg`);
        card.style.setProperty('--mouse-x', `${(x / width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / height) * 100}%`);
      });
      
      card.addEventListener('mouseleave', () => {
        // Reset transform back to center smoothly
        card.style.setProperty('--card-tilt-x', '0deg');
        card.style.setProperty('--card-tilt-y', '0deg');
      });
    });
  }

  // Hero Parallax Mouse Interaction
  const heroSectionEl = document.getElementById('hero');
  const heroBgLayerEl = document.querySelector('.hero-bg-layer');
  const heroContentEl = document.querySelector('#hero .reveal-element');
  const countdownCardEl = document.querySelector('.wedding-countdown-card');

  if (heroSectionEl && !isTouchDevice) {
    heroSectionEl.addEventListener('mousemove', (e) => {
      const rect = heroSectionEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Normalized coordinates from center (-1 to 1)
      const pctX = (x - width / 2) / (width / 2);
      const pctY = (y - height / 2) / (height / 2);
      
      // Translate background opposite to mouse, translate content with mouse
      const bgX = (pctX * -25).toFixed(2);
      const bgY = (pctY * -25).toFixed(2);
      
      const contentX = (pctX * 15).toFixed(2);
      const contentY = (pctY * 15).toFixed(2);
      
      const cardX = (pctX * 8).toFixed(2);
      const cardY = (pctY * 8).toFixed(2);
      
      if (heroBgLayerEl) {
        heroBgLayerEl.style.transform = `translate3d(${bgX}px, ${bgY}px, 0)`;
      }
      if (heroContentEl) {
        const heroTitle = heroContentEl.querySelector('h1');
        const heroSubtitle = heroContentEl.querySelector('.hero-subtitle');
        const heroEyebrow = heroContentEl.querySelector('.hero-eyebrow');
        const heroDetails = heroContentEl.querySelector('.hero-details');
        const heroDivider = heroContentEl.querySelector('.divider');
        
        if (heroTitle) heroTitle.style.transform = `translate3d(${contentX}px, ${contentY}px, 0)`;
        if (heroSubtitle) heroSubtitle.style.transform = `translate3d(${contentX * 0.8}px, ${contentY * 0.8}px, 0)`;
        if (heroEyebrow) heroEyebrow.style.transform = `translate3d(${contentX * 0.5}px, ${contentY * 0.5}px, 0)`;
        if (heroDivider) heroDivider.style.transform = `translate3d(${contentX * 0.6}px, ${contentY * 0.6}px, 0)`;
        if (heroDetails) heroDetails.style.transform = `translate3d(${contentX * 0.7}px, ${contentY * 0.7}px, 0)`;
      }
      if (countdownCardEl) {
        countdownCardEl.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`;
      }
    });

    heroSectionEl.addEventListener('mouseleave', () => {
      if (heroBgLayerEl) heroBgLayerEl.style.transform = 'translate3d(0, 0, 0)';
      if (countdownCardEl) countdownCardEl.style.transform = 'translate3d(0, 0, 0)';
      if (heroContentEl) {
        const elementsToReset = heroContentEl.querySelectorAll('h1, .hero-subtitle, .hero-eyebrow, .divider, .hero-details');
        elementsToReset.forEach(el => el.style.transform = 'translate3d(0, 0, 0)');
      }
    });
  }

  // 8. Countdown Timer Logic
  const countdownTimer = document.getElementById('countdown-timer');
  const weddingDate = new Date('Nov 21, 2026 10:00:00').getTime();

  function updateCountdown() {
    if (!countdownTimer) return;
    
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      countdownTimer.innerHTML = `<p class="font-serif italic" style="font-size: 1.5rem; color: var(--color-gold);">Joshua & Maria are celebrating their wedding day today!</p>`;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (n) => String(n).padStart(2, '0');
      countdownTimer.innerHTML = `
      <div class="countdown-unit">
        <span class="countdown-value">${days}</span>
        <span class="countdown-label">Days</span>
      </div>
      <span class="countdown-separator">:</span>
      <div class="countdown-unit">
        <span class="countdown-value">${pad(hours)}</span>
        <span class="countdown-label">Hrs</span>
      </div>
      <span class="countdown-separator">:</span>
      <div class="countdown-unit">
        <span class="countdown-value">${pad(minutes)}</span>
        <span class="countdown-label">Mins</span>
      </div>
      <span class="countdown-separator">:</span>
      <div class="countdown-unit">
        <span class="countdown-value">${pad(seconds)}</span>
        <span class="countdown-label">Secs</span>
      </div>
    `;
  }
  
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 9. Photo Gallery Lightbox Overlay
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close-btn');

  if (galleryItems && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const fullImgUrl = item.dataset.image;
        lightboxImg.src = fullImgUrl;
        lightbox.style.display = 'flex';
        lightbox.style.opacity = '0';
        void lightbox.offsetWidth;
        lightbox.style.transition = 'opacity 0.4s ease';
        lightbox.style.opacity = '1';
      });
    });

    const closeLightbox = () => {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
      }, 400);
    };

    lightboxClose.setAttribute('role', 'button');
    lightboxClose.tabIndex = 0;
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeLightbox();
      }
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });

    // Swipe-down to close on mobile devices
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    lightbox.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchEndY - touchStartY > 100) {
        closeLightbox();
      }
    });
  }

  // 10. Custom Calendar Reminders Generator (iCal .ics File Builder)
  const addCalButtons = document.querySelectorAll('.add-cal-btn');
  
  addCalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const eventType = btn.dataset.event;
      let title, desc, loc, startStr, endStr;
      
      if (eventType === 'matrimony') {
        title = "Holy Matrimony of Joshua & Maria";
        desc = "Join us for the sacred wedding ceremony of Joshua & Maria at Kottayam Kerala.";
        loc = "St. Mary's Forane Church, Kuravilangad, Kottayam, Kerala";
        startStr = "20261121T043000Z";
        endStr = "20261121T073000Z";
      } else {
        title = "Wedding Reception of Joshua & Maria";
        desc = "Celebrate the marriage of Joshua & Maria at Windsor Castle convention centre.";
        loc = "Windsor Castle Convention Centre, Kottayam, Kerala";
        startStr = "20261121T130000Z";
        endStr = "20261121T170000Z";
      }
      
      downloadICS(title, desc, loc, startStr, endStr);
    });
  });



  function downloadICS(title, description, location, startTime, endTime) {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Joshua and Maria Wedding//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@joshuaandmaria.wedding`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
