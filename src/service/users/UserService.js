import BaseService from "../base/baseService";

class UserService extends BaseService {

  static async completeProfile(userId, fullName, password) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(fullName, "Full Name");
    this.validateRequiredString(password, "Password");

    try {
      const { data, error } = await this.supabase.rpc(
        "update_user_full_name_and_password",
        {
          user_id: userId,
          full_name: fullName,
          password,
        }
      );

      this.handleError(error, "Error updating user profile");
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async checkFullNameUpdateTime(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "check_full_name_update_time",
        { user_id: userId }
      );

      this.handleError(error, "Error checking full name update time");

      if (data) {
        return {
          canUpdate: data.can_update,
          nextAvailableDate: new Date(data.next_available_date),
          timeRemaining: {
            days: data.time_remaining_days,
            hours: data.time_remaining_hours,
            minutes: data.time_remaining_minutes,
          },
          formattedTimeRemaining: this.formatTimeRemaining(data),
        };
      }

      return null;
    } catch (error) {
      console.error("Error checking full name update time:", error);
      throw new Error(error.message);
    }
  }

  static async checkUsernameUpdateTime(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "check_username_update_time",
        { user_id: userId }
      );

      this.handleError(error, "Error checking full name update time");

      if (data) {
        return {
          canUpdate: data.can_update,
          nextAvailableDate: new Date(data.next_available_date),
          timeRemaining: {
            days: data.time_remaining_days,
            hours: data.time_remaining_hours,
            minutes: data.time_remaining_minutes,
          },
          formattedTimeRemaining: this.formatTimeRemaining(data),
        };
      }

      return null;
    } catch (error) {
      console.error("Error checking full name update time:", error);
      throw new Error(error.message);
    }
  }

  static formatTimeRemaining(data) {
    if (data.can_update) {
      return null;
    }

    const parts = [];
    if (data.time_remaining_days > 0) {
      parts.push(`${Math.floor(data.time_remaining_days)} days`);
    }
    if (data.time_remaining_hours > 0) {
      parts.push(`${Math.floor(data.time_remaining_hours)} hours`);
    }
    if (data.time_remaining_minutes > 0) {
      parts.push(`${Math.floor(data.time_remaining_minutes)} minutes`);
    }

    return `You can update in ${parts.join(", ")}`;
  }

  static async checkUsernameAvailability(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "check_username_availability",
        {
          user_id: userId,
        }
      );

      this.handleError(error, "Error checking username update capability");
      return data;
    } catch (error) {
      console.error("Error checking username update:", error);
      throw new Error(error.message);
    }
  }

  static async updateUsername(userId, username) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(username, "Username");

    try {
      const { data, error } = await this.supabase.rpc("update_username", {
        user_id: userId,
        username,
      });

      this.handleError(error, "Error updating username");

      return data;
    } catch (error) {
      console.error("Error updating username:", error);
      throw new Error(error.message);
    }
  }

  static async updateFullName(userId, fullName) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(fullName, "Full Name");

    try {
      const { data, error } = await this.supabase.rpc("update_full_name", {
        user_id: userId,
        full_name: fullName,
      });

      this.handleError(error, "Error updating full name");

      return data;
    } catch (error) {
      console.error("Error updating full name:", error);
      throw new Error(error.message);
    }
  }

  static async updateProfilePicture(userId, file) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredObject(file, "File");

    try {
      const { data, error } = await this.supabase.storage
        .from("avatars")
        .upload(`user-${userId}`, file);

      this.handleError(error, "Error uploading profile picture");

      return data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error(error.message);
    }
  }
  
}

export default UserService;
