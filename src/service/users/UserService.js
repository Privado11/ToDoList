import BaseService from "../base/baseService";

class UserService extends BaseService {
  static formatTaskResponse(data) {
    if (!data) return null;
    return {
      ...data,
      ...DEFAULT_BLOCKED_RELATIONS,
      profiles: data.profiles || [],
    };
  }

  static async searchUsers(query, currentUserId) {
    this.validateRequiredId(currentUserId, "Current User ID");

    try {
      const { data, error } = await this.supabase.rpc("search_users", {
        current_user_id: currentUserId,
        search_query: query,
      });

      this.handleError(error, "Error searching users");

      return data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error(error.message);
    }
  }

  static async getUserById(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .single();

      this.handleError(error, "Error fetching user");

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getUserByUsername(username) {
    this.validateRequiredString(username, "Username");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select()
        .eq("username", username)
        .single();

      this.handleError(error, "Error fetching user");

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

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
      parts.push(`${Math.floor(data.time_remaining_days)} días`);
    }
    if (data.time_remaining_hours > 0) {
      parts.push(`${Math.floor(data.time_remaining_hours)} horas`);
    }
    if (data.time_remaining_minutes > 0) {
      parts.push(`${Math.floor(data.time_remaining_minutes)} minutos`);
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
  f;
  static async blockUser(blockerId, blockedId, reason) {
    this.validateRequiredId(blockerId, "Blocker ID");
    this.validateRequiredId(blockedId, "Blocked ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "block_user_cascade_delete",
        {
          blocker_id: blockerId,
          blocked_id: blockedId,
          reason,
        }
      );

      this.handleError(error, "Error blocking user");

      return data?.[0];
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  }

  static async unblockUser(blockerId, blockedId) {
    this.validateRequiredId(blockerId, "Blocker ID");
    this.validateRequiredId(blockedId, "Blocked ID");

    try {
      const { data, error } = await this.supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId);

      this.handleError(error, "Error unblocking user");

      return data?.[0];
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  }

  static async getBlockedUsers(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("blocked_users")
        .select(this.BLOCKED_USER_SELECT)
        .eq("blocker_id", userId)
        .eq("status", "active");

      this.handleError(error, "Error fetching blocked users");

      this.formatTaskResponse(data);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      throw error;
    }
  }
}

export default UserService;
