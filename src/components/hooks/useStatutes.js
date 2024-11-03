import { useEffect, useState } from "react";
import { getStatuses } from "../service/statusService";

export const useStatuses = () => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const statusesData = await getStatuses();
      if (statusesData) setStatuses(statusesData);
    };
    fetchStatuses();
  }, []);

  return {
    statuses,
  };
};
