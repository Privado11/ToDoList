import { supabase } from "../base/supabase";

export const getStatuses = async () => {
  try {
    const { data, error } = await supabase.from("statuses").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    return null;
  }
};
