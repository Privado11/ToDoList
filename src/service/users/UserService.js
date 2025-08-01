import BaseService from "../base/baseService";

class UserService extends BaseService {
  static MAX_FILE_SIZE = 5 * 1024 * 1024;

  static validateFile(file) {
    if (!file) {
      throw new Error("File is required");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      throw new Error("Only JPG, PNG and WebP files are allowed");
    }
  }

  static async completeProfile(userId, fullName, password) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(fullName, "Full Name");
    this.validateRequiredString(password, "Password");

    try {
      const { data, error } = await this.supabase.rpc("complete_profile", {
        user_id: userId,
        new_fullname: fullName,
        new_password: password,
      });

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
      console.error("Error checking username update time:", error);
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

  static async checkUsernameAvailability(username) {
    if (!username || username.trim().length === 0) {
      return {
        success: false,
        message: "Username is required",
      };
    }

    try {
      const { data, error } = await this.supabase.rpc(
        "check_username_availability",
        {
          username_to_check: username,
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
        new_username: username,
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
        new_full_name: fullName,
      });

      this.handleError(error, "Error updating full name");

      return data;
    } catch (error) {
      console.error("Error updating full name:", error);
      throw new Error(error.message);
    }
  }

  static async updateDescription(userId, description) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(description, "Description");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({ description })
        .eq("id", userId)
        .select("description");

      this.handleError(error, "Error updating description");

      return data;
    } catch (error) {
      console.error("Error updating description:", error);
      throw new Error(error.message);
    }
  }

  static async updateLocation(userId, location) {
    this.validateRequiredId(userId, "User ID");

    const city = location?.city || "";
    const state = location?.state || "";
    const country = location?.country || "";

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({ city, state, country })
        .eq("id", userId)
        .select("city, state, country");

      this.handleError(error, "Error updating location");

      return data?.[0];
    } catch (error) {
      console.error("Error updating location:", error);
      throw new Error(error.message);
    }
  }

  static async uploadProfilePicture(user, file) {
    try {
      this.validateRequiredId(user.id, "User ID");
      this.validateFile(file);

      await this.deleteOldAvatar(user);

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${uniqueFileName}`;

      const { data, error } = await this.supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      this.handleError(error, "Error uploading Profile Picture");

      const {
        data: { publicUrl },
      } = this.supabase.storage.from("avatars").getPublicUrl(data.path);

      const avatar_url = await this.updateProfilePicture(user.id, publicUrl);
      this.handleError(avatar_url.error, "Error updating avatar URL");
      return publicUrl;
    } catch (error) {
      console.error("Error uploading Profile Picture:", error);
      throw new Error(error.message);
    }
  }

  static async updateProfilePicture(userId, fileUrl) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({ avatar_url: fileUrl })
        .eq("id", userId)
        .select("avatar_url");

      this.handleError(error, "Error updating avatar URL");

      return data;
    } catch (error) {
      console.error("Error updating avatar URL:", error);
      throw new Error(error.message);
    }
  }

  static async deleteOldAvatar(user) {
    if (!user || !user.avatar_url) {
      return;
    }
    const oldFilePath = this.extractFilePathFromUrl(user?.avatar_url, user.id);

    try {
      if (!oldFilePath) return;

      const { error: deleteError } = await this.supabase.storage
        .from("avatars")
        .remove([oldFilePath]);

      this.handleError(deleteError, "Error deleting old avatar");

      const { error: updateError } = await this.supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      this.handleError(updateError, "Error removing avatar_url from profile");

      return true;
    } catch (error) {
      console.error("Error during old avatar cleanup:", error);
    }
  }

  static extractFilePathFromUrl(avatarUrl, userId) {
    try {
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split("/");

      const avatarsIndex = pathParts.indexOf("avatars");
      if (avatarsIndex === -1) return null;

      const userIdFromUrl = pathParts[avatarsIndex + 1];
      const fileName = pathParts[avatarsIndex + 2];

      if (userIdFromUrl !== userId || !fileName) return null;

      return `${userId}/${fileName}`;
    } catch (error) {
      console.error("Error extracting file path from URL:", error);
      return null;
    }
  }

  static async saveUserLanguage(userId, language) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(language, "Language");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({
          language: language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      this.handleError(error, "Error saving user language");

      return data;
    } catch (error) {
      console.error("Error saving user language:", error);
      throw new Error(error.message);
    }
  }

  static async getUserPrivacySettings(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("privacy_settings")
        .select("*")
        .eq("id", userId)
        .single();

      this.handleError(error, "Error fetching user privacy settings");

      return data || {};
    } catch (error) {
      console.error("Error fetching user privacy settings:", error);
      throw new Error(error.message);
    }
  }

  static async updateUserPrivacySettings(userId, privacySettings) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("privacy_settings")
        .update({
          ...privacySettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("*")
        .single();

      this.handleError(error, "Error updating user privacy settings");

      return data;
    } catch (error) {
      console.error("Error updating user privacy settings:", error);
      throw new Error(error.message);
    }
  }

  static async getUserInterests(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("profile_interests")
        .select(
          `interest_id,
          interests:interest_id (id, name, icon_svg)
          `
        )
        .eq("profile_id", userId);

      this.handleError(error, "Error fetching user interests");

      const interests = data.map((item) => item.interests);

      return interests || [];
    } catch (error) {
      console.error("Error fetching user interests:", error);
      throw new Error(error.message);
    }
  }

  static async addUserInterests(userId, interestIds) {
    this.validateRequiredId(userId, "User ID");

    if (!Array.isArray(interestIds) || interestIds.length === 0) {
      throw new Error("Interest IDs must be a non-empty array");
    }

    try {
      const rows = interestIds.map((interestId) => ({
        profile_id: userId,
        interest_id: interestId,
      }));

      const { data, error } = await this.supabase
        .from("profile_interests")
        .insert(rows)
        .select("interest_id");

      this.handleError(error, "Error adding user interests");

      return data || [];
    } catch (error) {
      console.error("Error adding user interests:", error);
      throw new Error(error.message || "Unexpected error");
    }
  }

  static async removeUserInterest(userId, interestId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(interestId, "Interest ID");

    try {
      const { data, error } = await this.supabase
        .from("profile_interests")
        .delete()
        .eq("profile_id", userId)
        .eq("interest_id", interestId)
        .select("interest_id");

      this.handleError(error, "Error removing user interest");

      return data || [];
    } catch (error) {
      console.error("Error removing user interest:", error);
      throw new Error(error.message || "Unexpected error");
    }
  }

  static async getPendingBadges(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_pending_badges", {
        user_id: userId,
      });

      this.handleError(error, "Error getting pending badges");

      return data;
    } catch (error) {
      console.error("Error getting pending badges:", error);
      throw new Error(error.message);
    }
  }

  static async getEarnetBadges(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_earned_badges", {
        user_id: userId,
      });

      this.handleError(error, "Error getting earned badges");

      return data;
    } catch (error) {
      console.error("Error getting earned badges:", error);
      throw new Error(error.message);
    }
  }

  static async getAllBadgesUser(userId, requestingUserId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_all_badges_user", {
        user_id: userId,
        requesting_user_id: requestingUserId,
      });

      this.handleError(error, "Error getting all badges");

      return data;
    } catch (error) {
      console.error("Error getting all badges:", error);
      throw new Error(error.message);
    }
  }

  static async getUserById(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      this.handleError(error, "Error fetching user by ID");

      return data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error(error.message);
    }
  }

  static async getUserByUsername(userId, username) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredString(username, "Username");
    const usernameAux = username?.startsWith("@") ? username : `@${username}`;

    try {
      const { data, error } = await this.supabase.rpc(
        "get_user_profile_and_friendship",
        {
          user_id_params: userId,
          target_username: usernameAux,
        }
      );

      this.handleError(error, "Error fetching user by username");

      return data;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw new Error(error.message);
    }
  }
}

export default UserService;
