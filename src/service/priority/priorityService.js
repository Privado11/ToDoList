import { supabase } from "../base/supabase";

export const getPriorities = async () => {
  try {
    const { data, error } = await supabase.from("priorities").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    return null;
  }
};
