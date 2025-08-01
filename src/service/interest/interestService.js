import { supabase } from "../base/supabase";

export const getAvailableInterests = async (userId) => {

  if (!userId) return null;

  try {
    const { data, error } = await supabase.rpc("get_available_interests", {
      user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching available interests:", error.message);
    return null;
  }
};
