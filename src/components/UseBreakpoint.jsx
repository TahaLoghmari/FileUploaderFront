import { useState, useEffect } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width < breakpoints.sm) {
        setBreakpoint("xs");
      } else if (width < breakpoints.md) {
        setBreakpoint("sm");
      } else {
        setBreakpoint("md");
      }
    };

    updateBreakpoint();

    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}
