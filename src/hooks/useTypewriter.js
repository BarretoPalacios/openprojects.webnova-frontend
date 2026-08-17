import { useEffect, useState } from "react";

export function useTypewriter(lines, { typeSpeed = 32, holdTime = 1400, eraseSpeed = 16 } = {}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!lines.length) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setText(lines[0]);
      return;
    }
    let lineIndex = 0;
    let charIndex = 0;
    let erasing = false;
    let timeout;
    let cancelled = false;

    function step() {
      if (cancelled) return;
      const current = lines[lineIndex];
      if (!erasing) {
        charIndex++;
        setText(current.slice(0, charIndex));
        if (charIndex === current.length) {
          erasing = true;
          timeout = setTimeout(step, holdTime);
          return;
        }
        timeout = setTimeout(step, typeSpeed);
      } else {
        charIndex--;
        setText(current.slice(0, charIndex));
        if (charIndex === 0) {
          erasing = false;
          lineIndex = (lineIndex + 1) % lines.length;
          timeout = setTimeout(step, 400);
          return;
        }
        timeout = setTimeout(step, eraseSpeed);
      }
    }
    timeout = setTimeout(step, typeSpeed);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [lines, typeSpeed, holdTime, eraseSpeed]);

  return text;
}