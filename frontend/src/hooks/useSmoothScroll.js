import { useCallback, useRef } from "react";

/**
 * The "Apple/Stripe" Easing Curve (easeOutExpo)
 * Instantly responsive start, followed by a long, buttery, frictionless glide.
 */
const easeOutExpo = (time) => {
  return time === 1 ? 1 : 1 - Math.pow(2, -10 * time);
};

export const useSmoothScroll = () => {
  const animationRef = useRef(null);

  return useCallback((id, offset = 80) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Clear any existing animation to prevent overlapping glitches
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPosition = window.scrollY;
    // Calculate exact target with your navbar offset
    const targetPosition = element.getBoundingClientRect().top + startPosition - offset;
    const distance = targetPosition - startPosition;
    
    // A fixed duration of 1200ms paired with easeOutExpo creates 
    // the perfect balance of speed and visual smoothness.
    const duration = 1200;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      
      // Calculate progress (0 to 1)
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Apply the premium easing math
      const ease = easeOutExpo(progress);

      // Execute the scroll for this frame
      window.scrollTo(0, startPosition + distance * ease);

      // Continue the loop if we haven't reached 100%
      if (timeElapsed < duration) {
        animationRef.current = requestAnimationFrame(animation);
      }
    };

    // Ignite the animation loop
    animationRef.current = requestAnimationFrame(animation);
  }, []);
};