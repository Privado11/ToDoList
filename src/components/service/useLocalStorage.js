import React from "react";

function useLocalStorage(itemName, initialValue) {
  const [item, setItem] = React.useState(() => {
    try {
      const localStorageItem = localStorage.getItem(itemName);
      return localStorageItem ? JSON.parse(localStorageItem) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue; 
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const localStorageItem = localStorage.getItem(itemName);

        if (!localStorageItem) {
          localStorage.setItem(itemName, JSON.stringify(initialValue));
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(true);
      }
    }, 2000);

    return () => clearTimeout(timeout); 
  }, [itemName, initialValue]); 

  const saveItem = (newItem) => {
    try {
      localStorage.setItem(itemName, JSON.stringify(newItem));
      setItem(newItem);
    } catch (error) {
      console.error("Error saving to localStorage", error);
      setError(true); 
    }
  };

  return {
    item,
    saveItem,
    loading,
    error,
  };
}

export { useLocalStorage };
