"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger, in ms — lets a row of cards arrive one after another rather than all at once. */
  delay?: number;
  className?: string;
}

/**
 * Eases its children up into place the first time they scroll into view, then stops observing —
 * content that has arrived stays put rather than re-animating on the way back up, which reads as
 * flicker on a long page. Reduced-motion is handled in CSS, so this component doesn't need to
 * branch on it.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Must start false on both server and client — deriving it from something that differs between
  // the two (say, whether IntersectionObserver exists) hydrates mismatched and flashes the content
  // visible before hiding it again. Readers without JS are covered by the noscript rule in layout.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      // Fires a little before the element is fully on screen, so it finishes arriving as it lands.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

