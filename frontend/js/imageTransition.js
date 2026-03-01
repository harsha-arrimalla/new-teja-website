/**
 * Repeating Image Transition Effect
 * Inspired by Codrops RepeatingImageTransition (MIT License)
 * Adapted for Ourgia e-commerce product navigation
 * 
 * When a product card is clicked, the image "flies" from the card
 * to fill the viewport through a series of repeating mover frames,
 * then navigates to the product page.
 */

const ImageTransition = (() => {
  // Animation config
  const config = {
    steps: 6,                     // Number of mover frames
    stepDuration: 0.3,            // Duration per step (seconds)
    stepInterval: 0.04,           // Delay between each mover start
    moverPauseBeforeExit: 0.12,   // Pause before mover exits
    rotationRange: 3,             // Random Z rotation (degrees)
    wobbleStrength: 15,           // Random positional wobble (px)
    clipPathDirection: 'top-bottom',
    moverEnterEase: 'sine.in',
    moverExitEase: 'power2',
    panelRevealEase: 'power2.inOut',
    panelRevealDurationFactor: 2.5,
    gridItemEase: 'sine',
    gridItemStaggerFactor: 0.25,
    pathMotion: 'linear',
    sineAmplitude: 50,
    sineFrequency: Math.PI,
    overlayColor: '#1a1a1a',
  };

  let isAnimating = false;

  // Utility: linear interpolation
  const lerp = (a, b, t) => a + (b - a) * t;

  // Get element center position
  const getElementCenter = (el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  // Get clip-paths for a direction
  const getClipPaths = (direction) => {
    switch (direction) {
      case 'bottom-top':
        return { from: 'inset(0% 0% 100% 0%)', reveal: 'inset(0% 0% 0% 0%)', hide: 'inset(100% 0% 0% 0%)' };
      case 'left-right':
        return { from: 'inset(0% 100% 0% 0%)', reveal: 'inset(0% 0% 0% 0%)', hide: 'inset(0% 0% 0% 100%)' };
      case 'right-left':
        return { from: 'inset(0% 0% 0% 100%)', reveal: 'inset(0% 0% 0% 0%)', hide: 'inset(0% 100% 0% 0%)' };
      case 'top-bottom':
      default:
        return { from: 'inset(100% 0% 0% 0%)', reveal: 'inset(0% 0% 0% 0%)', hide: 'inset(0% 0% 100% 0%)' };
    }
  };

  // Compute stagger delays for grid items based on distance from clicked item
  const computeStaggerDelays = (clickedItem, items) => {
    const baseCenter = getElementCenter(clickedItem);
    const distances = Array.from(items).map((el) => {
      const center = getElementCenter(el);
      return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
    });
    const max = Math.max(...distances) || 1;
    return distances.map((d) => (d / max) * config.gridItemStaggerFactor);
  };

  // Generate motion path between start rect and end rect
  const generateMotionPath = (startRect, endRect, steps) => {
    const path = [];
    const fullSteps = steps + 2;
    const startCenter = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 };
    const endCenter = { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 };

    for (let i = 0; i < fullSteps; i++) {
      const t = i / (fullSteps - 1);
      const width = lerp(startRect.width, endRect.width, t);
      const height = lerp(startRect.height, endRect.height, t);
      const centerX = lerp(startCenter.x, endCenter.x, t);
      const centerY = lerp(startCenter.y, endCenter.y, t);

      const sineOffset = config.pathMotion === 'sine'
        ? Math.sin(t * config.sineFrequency) * config.sineAmplitude
        : 0;

      const wobbleX = (Math.random() - 0.5) * config.wobbleStrength;
      const wobbleY = (Math.random() - 0.5) * config.wobbleStrength;

      path.push({
        left: centerX - width / 2 + wobbleX,
        top: centerY - height / 2 + sineOffset + wobbleY,
        width,
        height,
      });
    }

    return path.slice(1, -1);
  };

  /**
   * Trigger the transition
   * @param {HTMLElement} clickedCard - The product card element
   * @param {string} imageUrl - The product image URL
   * @param {string} navigateTo - The URL to navigate to after animation
   */
  const trigger = (clickedCard, imageUrl, navigateTo) => {
    if (isAnimating || typeof gsap === 'undefined') {
      window.location.href = navigateTo;
      return;
    }

    isAnimating = true;

    // Get the image element inside the clicked card
    const imgEl = clickedCard.querySelector('img') || clickedCard.querySelector('.product-image');
    if (!imgEl) {
      window.location.href = navigateTo;
      return;
    }

    const startRect = imgEl.getBoundingClientRect();

    // End rect = full viewport (the product page image area)
    const endRect = {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'img-transition-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      pointer-events: all; overflow: hidden;
    `;
    document.body.appendChild(overlay);

    const clipPaths = getClipPaths(config.clipPathDirection);

    // Fade out all product cards with stagger
    const allCards = document.querySelectorAll('.product-card');
    const delays = computeStaggerDelays(clickedCard, allCards);

    gsap.to(allCards, {
      opacity: 0,
      scale: (i, el) => (el === clickedCard ? 1 : 0.85),
      duration: (i, el) => (el === clickedCard ? config.stepDuration * 2 : 0.25),
      ease: config.gridItemEase,
      clipPath: (i, el) => (el === clickedCard ? clipPaths.from : 'none'),
      delay: (i) => delays[i],
    });

    // Fade out the rest of the page
    gsap.to(['.header', '.shop-top-banner', '.shop-sidebar', '.shop-toolbar', '.top-banner'], {
      opacity: 0,
      duration: 0.4,
      ease: 'sine.inOut',
    });

    // Generate motion path
    const path = generateMotionPath(startRect, endRect, config.steps);
    const fragment = document.createDocumentFragment();

    // Create mover elements along the path
    path.forEach((step, index) => {
      const mover = document.createElement('div');
      mover.className = 'transition-mover';

      const rotation = gsap.utils.random(-config.rotationRange, config.rotationRange);

      gsap.set(mover, {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'fixed',
        left: step.left,
        top: step.top,
        width: step.width,
        height: step.height,
        clipPath: clipPaths.from,
        zIndex: 100000 + index,
        rotationZ: rotation,
        borderRadius: '4px',
      });

      fragment.appendChild(mover);

      const delay = index * config.stepInterval;

      gsap.timeline({ delay })
        .fromTo(mover,
          { opacity: 0.3, clipPath: clipPaths.hide },
          {
            opacity: 1,
            clipPath: clipPaths.reveal,
            duration: config.stepDuration,
            ease: config.moverEnterEase,
          }
        )
        .to(mover, {
          clipPath: clipPaths.from,
          duration: config.stepDuration,
          ease: config.moverExitEase,
        }, `+=${config.moverPauseBeforeExit}`);
    });

    overlay.appendChild(fragment);

    // Create the final panel that fills the screen
    const panel = document.createElement('div');
    panel.className = 'transition-panel';
    panel.style.cssText = `
      position: fixed; inset: 0; z-index: 100100;
      background-image: url(${imageUrl});
      background-size: cover;
      background-position: center;
    `;
    gsap.set(panel, { clipPath: clipPaths.hide, opacity: 1 });
    overlay.appendChild(panel);

    // Reveal the full-screen panel
    const revealDelay = config.steps * config.stepInterval;
    gsap.to(panel, {
      clipPath: clipPaths.reveal,
      duration: config.stepDuration * config.panelRevealDurationFactor,
      ease: config.panelRevealEase,
      delay: revealDelay,
      onComplete: () => {
        // Store transition data for the product page to pick up
        sessionStorage.setItem('img_transition_active', 'true');
        sessionStorage.setItem('img_transition_url', imageUrl);
        // Navigate
        window.location.href = navigateTo;
      },
    });
  };

  /**
   * Entry animation on product page —
   * Reveals the product page content with a smooth entrance
   */
  const revealProductPage = () => {
    const wasTransition = sessionStorage.getItem('img_transition_active');
    if (!wasTransition || typeof gsap === 'undefined') return;

    sessionStorage.removeItem('img_transition_active');
    const imgUrl = sessionStorage.getItem('img_transition_url') || '';
    sessionStorage.removeItem('img_transition_url');

    // Create a full-screen image overlay that matches end state of transition
    const reveal = document.createElement('div');
    reveal.className = 'transition-reveal';
    reveal.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background-image: url(${imgUrl});
      background-size: cover;
      background-position: center;
    `;
    document.body.appendChild(reveal);

    // Hide everything behind the reveal overlay initially
    const header = document.querySelector('.header');
    const banner = document.querySelector('.top-banner');
    const pageContent = document.getElementById('productContainer');

    gsap.set([pageContent, header, banner].filter(Boolean), { opacity: 0 });

    // Wait a short moment, then peel away regardless of fetch state
    gsap.timeline({ delay: 0.35 })
      .to(reveal, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
      })
      .to([header, banner].filter(Boolean), {
        opacity: 1,
        duration: 0.4,
        ease: 'sine',
      }, '-=0.5')
      .to(pageContent, {
        opacity: 1,
        duration: 0.6,
        ease: 'sine',
        onComplete: () => {
          reveal.remove();
          isAnimating = false;
        },
      }, '-=0.3');
  };

  // Clean up on back/forward navigation (bfcache)
  // When user presses back, the browser may restore a page
  // with leftover overlays or hidden elements
  if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', (event) => {
      // Remove any leftover transition overlays
      document.querySelectorAll('.img-transition-overlay, .transition-reveal').forEach(el => el.remove());
      // Restore visibility of all elements that may have been hidden
      document.querySelectorAll('.product-card, .header, .top-banner, .shop-top-banner, .shop-sidebar, .shop-toolbar').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.clipPath = '';
        el.style.scale = '';
        el.style.boxShadow = '';
      });
      const productContainer = document.getElementById('productContainer');
      if (productContainer) {
        productContainer.style.opacity = '';
      }
      const productSection = document.querySelector('.product-section');
      if (productSection) {
        productSection.style.opacity = '';
      }
      isAnimating = false;
    });
  }

  return { trigger, revealProductPage, config };
})();
