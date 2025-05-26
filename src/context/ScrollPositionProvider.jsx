import React, { createContext, useContext, useRef, useCallback } from "react";

const ScrollPositionContext = createContext();

export const ScrollPositionProvider = ({ children }) => {
  const scrollPositions = useRef({});

  const saveScrollPosition = useCallback((key, position) => {
    scrollPositions.current[key] = position;
  }, []);

  const getScrollPosition = useCallback((key) => {
    return scrollPositions.current[key] || 0;
  }, []);

  const clearScrollPosition = useCallback((key) => {
    delete scrollPositionscurrent[key];
  }, []);

  return (
    <ScrollPositionContext.Provider
      value={{
        saveScrollPosition,
        getScrollPosition,
        clearScrollPosition,
      }}
    >
      {children}
    </ScrollPositionContext.Provider>
  );
};

export const useScrollPosition = () => {
  const context = useContext(ScrollPositionContext);
  if (!context) {
    throw new Error(
      "useScrollPosition must be used within a ScrollPositionProvider"
    );
  }
  return context;
};


export const useScrollRestoration = (key) => {
  const { saveScrollPosition, getScrollPosition } = useScrollPosition();
  const elementRef = useRef(null);

  const savePosition = useCallback(() => {
    if (elementRef.current) {
      const scrollTop = elementRef.current.scrollTop || window.pageYOffset;
      saveScrollPosition(key, scrollTop);
    }
  }, [key, saveScrollPosition]);

  const restorePosition = useCallback(() => {
    const savedPosition = getScrollPosition(key);
    if (savedPosition) {
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.scrollTop = savedPosition;
        } else {
          window.scrollTo(0, savedPosition);
        }
      });
    }
  }, [key, getScrollPosition]);

  return {
    elementRef,
    savePosition,
    restorePosition,
  };
};
