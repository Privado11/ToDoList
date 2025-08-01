import { useState, useEffect } from "react";

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
 
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);


    setMatches(mediaQuery.matches);

 
    const handleChange = (event) => {
      setMatches(event.matches);
    };

 
    mediaQuery.addEventListener("change", handleChange);

  
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};
