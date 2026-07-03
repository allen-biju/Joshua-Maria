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

  // 2. Interactive Preloader Logic
  const preloader = document.getElementById('interactive-preloader');
  const loadingRing = document.getElementById('loading-ring');
  const preloaderPercentage = document.getElementById('preloader-percentage');
  const plSkipBtn = document.getElementById('pl-skip-btn');
  
  let isLoaded = false;
  let loadingProgress = 0;
  
  // Simulated progress logic: increment to 90%
  const progressTimer = setInterval(() => {
    if (loadingProgress < 90) {
      loadingProgress += Math.random() * 4;
      if (loadingProgress > 90) loadingProgress = 90;
      
      const roundedProgress = Math.floor(loadingProgress);
      if (loadingRing) loadingRing.style.setProperty('--p', roundedProgress + '%');
      if (preloaderPercentage) preloaderPercentage.innerText = roundedProgress + '%';
    }
  }, 60);

  function finishLoading() {
    if (isLoaded) return;
    isLoaded = true;

    clearInterval(progressTimer);
    
    // Fast-forward animation to exactly 100% when everything is loaded
    const finishTimer = setInterval(() => {
      loadingProgress += 5;
      if (loadingProgress >= 100) {
        loadingProgress = 100;
        
        if (loadingRing) loadingRing.style.setProperty('--p', '100%');
        if (preloaderPercentage) preloaderPercentage.innerText = '100%';
        
        clearInterval(finishTimer);
        
        setTimeout(() => {
          if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.remove(), 800);
          }
        }, 300);
      } else {
        const roundedProgress = Math.floor(loadingProgress);
        if (loadingRing) loadingRing.style.setProperty('--p', roundedProgress + '%');
        if (preloaderPercentage) preloaderPercentage.innerText = roundedProgress + '%';
      }
    }, 16);
  }

  // Trigger when the window is fully loaded
  window.addEventListener('load', finishLoading);

  // Skip button click handler
  if (plSkipBtn) {
    plSkipBtn.addEventListener('click', finishLoading);
  }

  // Fallback: Force load if it takes too long (e.g. 5 seconds)
  setTimeout(finishLoading, 5000);

  // 3. Open Envelope Flap, Slide Card Up, then Reveal Main Content
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelopeContainer = document.getElementById('envelope-container');
  const mainContent = document.getElementById('main-content');
  const weddingFrameStage = document.getElementById('wedding-frame-stage');
  const frameAssemblyDuration = 2600;
  
  function startFrameAssembly() {
    document.body.classList.add('frame-sequence-active');
    
    if (weddingFrameStage) {
      weddingFrameStage.hidden = false;
      weddingFrameStage.classList.add('frame-stage-visible');
      
      requestAnimationFrame(() => {
        weddingFrameStage.classList.add('frame-stage-assembling');
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
        });
      }
      
      triggerScrollReveals();
      resizeGallery();
      updateScrollMetrics();
    }, frameAssemblyDuration);
  }
  
  if (openEnvelopeBtn && envelopeWrapper) {
    openEnvelopeBtn.addEventListener('click', () => {
      // Start background soundscape
      audioPlayer.start();
      
      // Trigger envelope flap folding open and card sliding up (styled in CSS)
      envelopeWrapper.classList.add('opened');
      
      // Start background ambient floating petals immediately
      ambientCanvas.start('ambient');
      
      // Stage 2: Fade envelope out and assemble the custom frame
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.style.opacity = '0';
          envelopeContainer.style.transform = 'translateY(80px) scale(0.95)';
        }
        startFrameAssembly();
      }, 1500); // Wait for flap opening + card sliding transitions
      
      // Stage 3: Clean up envelope from DOM after the frame has taken over
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.remove();
        }
      }, 1500 + frameAssemblyDuration + 600);
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

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function updateScrollMetrics() {
    const currentScrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

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
    if (timeline && progressLine) {
      const timelineRect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const timelineTop = timelineRect.top + currentScrollY;
      const timelineHeight = timelineRect.height;
      const targetScroll = currentScrollY + (windowHeight * 0.75);

      if (targetScroll > timelineTop) {
        let progress = (targetScroll - timelineTop) / timelineHeight;
        progress = Math.max(0, Math.min(1, progress));
        progressLine.style.height = `${progress * 100}%`;
      } else {
        progressLine.style.height = '0%';
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

  // Calculate gallery height on setup and on resize/load events
  resizeGallery();
  window.addEventListener('resize', resizeGallery);
  window.addEventListener('load', resizeGallery);

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
  });
  
  // Trigger initial metrics run
  updateScrollMetrics();

  // Back-to-Top smooth scroll
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 8. Countdown Timer Logic
  const countdownTimer = document.getElementById('countdown-timer');
  const weddingDate = new Date('Nov 21, 2026 10:00:00').getTime();

  function updateCountdown() {
    if (!countdownTimer) return;
    
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      countdownTimer.innerHTML = `<p class="font-serif italic" style="font-size: 1.5rem; color: var(--color-gold);">Joshua & Maria are celebrating their wedding day today! 🕊</p>`;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownTimer.innerHTML = `
      <div style="text-align: center; min-width: 60px;">
        <span style="display: block; font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 300; color: var(--color-gold-dark);">${days}</span>
        <span style="font-family: var(--font-sans); font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">Days</span>
      </div>
      <div style="font-family: var(--font-serif); font-size: 2rem; font-weight: 300; color: var(--color-gold-light);">:</div>
      <div style="text-align: center; min-width: 60px;">
        <span style="display: block; font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 300; color: var(--color-gold-dark);">${hours}</span>
        <span style="font-family: var(--font-sans); font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">Hrs</span>
      </div>
      <div style="font-family: var(--font-serif); font-size: 2rem; font-weight: 300; color: var(--color-gold-light);">:</div>
      <div style="text-align: center; min-width: 60px;">
        <span style="display: block; font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 300; color: var(--color-gold-dark);">${minutes}</span>
        <span style="font-family: var(--font-sans); font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">Mins</span>
      </div>
      <div style="font-family: var(--font-serif); font-size: 2rem; font-weight: 300; color: var(--color-gold-light);">:</div>
      <div style="text-align: center; min-width: 60px;">
        <span style="display: block; font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 300; color: var(--color-gold-dark);">${seconds}</span>
        <span style="font-family: var(--font-sans); font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">Secs</span>
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
