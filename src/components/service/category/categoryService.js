import { supabase } from "../supabase";

export const getCategories = async () => {
  try {
    const { data, error } = await supabase.from("categories").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    return null;
  }
};
