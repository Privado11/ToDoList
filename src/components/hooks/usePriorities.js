import  { useEffect, useState } from "react";
import { getPriorities } from "../service/priorityService";

export const usePriorities = () => {
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    const fetchPriorities = async () => {
      const prioritiesData = await getPriorities();
      if (prioritiesData) setPriorities(prioritiesData);
    };
    fetchPriorities();
  }, []);

  return {
    priorities,
  };
};
