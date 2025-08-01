import React, { createContext, useContext, useState } from "react";

const PopoverContext = createContext();

export const PopoverProvider = ({ children }) => {
  const [activePopover, setActivePopover] = useState(null);

  const openPopover = (popoverName) => {
    setActivePopover(popoverName);
  };

  const closePopover = () => {
    setActivePopover(null);
  };

  const isPopoverOpen = (popoverName) => {
    return activePopover === popoverName;
  };

  return (
    <PopoverContext.Provider
      value={{
        activePopover,
        openPopover,
        closePopover,
        isPopoverOpen,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
};

export const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used inside a PopoverProvider");
  }
  return context;
};
