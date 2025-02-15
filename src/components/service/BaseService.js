import { supabase } from "./supabase";

class BaseService {
  static supabase = supabase;

  static validateRequiredId(id, name = "ID") {
    if (!id) {
      throw new Error(`${name} is required`);
    }
  }

  static handleError(error, customMessage) {
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }
}

export default BaseService;
