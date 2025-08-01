import { supabase } from "../base/supabase";

export const getCategories = async () => {
  try {
   const { data, error } = await supabase
     .from("categories")
     .select()
     .order("name", { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return null;
  }
};
