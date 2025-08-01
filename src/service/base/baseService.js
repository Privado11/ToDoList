import { supabase } from "./supabase";


class baseService {
  static supabase = supabase;

  static validateRequiredId(id, name = "ID") {
    if (!id) {
      throw new Error(`${name} is required`);
    }
  }

  static validateRequiredString(value, name = "Value") {
    if (!value || typeof value !== "string" || value.trim() === "") {
      throw new Error(`${name} must be a non-empty string`);
    }
  }

  static handleError(error, customMessage) {
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }
}

export default baseService;
