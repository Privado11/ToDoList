import { supabase } from "../base/supabase";

class AuthService {
  static async handleOAuthSignIn(provider, options = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          ...options,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error) {
      AuthService.handleAuthError(error, `Error logging in with ${provider}`);
      throw error;
    }
  }

  static handleAuthError(error, customMessage) {
    if (error) {
      console.error("Auth error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }

  static async signInWithGoogle() {
    return AuthService.handleOAuthSignIn("google");
  }

  static async signInWithFacebook() {
    return AuthService.handleOAuthSignIn("facebook", {
      scopes: "email,public_profile",
    });
  }

  static async signInWithEmail(email, password, captchaToken) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    AuthService.handleAuthError(error, "Error signing in with email");
    return data;
  }

  static async signUpWithEmail(email, password = "Temporary Password1@") {
    if (!email) {
      throw new Error("Email is required");
    }

    try {
      const isRegistered = await AuthService.checkEmail(email);

      if (isRegistered.user_exists) {
        throw new Error(
          "This email is already registered. Please sign in instead."
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/complete-profile`,
          data: { email_verified: false },
        },
      });
      AuthService.handleAuthError(error, "Error signing up");
      return data;
    } catch (error) {
      if (error.message.includes("already registered")) {
        throw error;
      }
      AuthService.handleAuthError(error, "Error during registration process");
      throw error;
    }
  }

  static async resendEmailSignUp(email) {
    if (!email) {
      throw new Error("Email is required");
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/complete-profile`,
        data: { email_verified: false },
      },
    });
    AuthService.handleAuthError(error, "Error resending email");
    return true;
  }

  static async signInWithPhone(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    AuthService.handleAuthError(error, "Error signing in with phone");
    return data;
  }

  static async signInWithMagicLink(email) {
    if (!email) throw new Error("Email is required");
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    AuthService.handleAuthError(error, "Error sending magic link");
    return data;
  }

  static async signInAsGuest() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error:", error);
      AuthService.handleAuthError(error, "Error signing in as guest");
    }
  }

  static async getUser() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // No lanzamos error si simplemente no hay sesión activa
    if (userError && userError.message !== "Auth session missing!") {
      AuthService.handleAuthError(userError, "Error getting user");
    }

    return user || null;
  }

  static async getProfile(userId) {
    if (!userId) {
      throw new Error("User Id are required");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    AuthService.handleAuthError(error, "Error updating profile");
    if (!data) throw new Error("Profile not found");
    return data;
  }

  // Resto de métodos se mantienen igual...
  static async completeProfile(fullName, password, id, avatarFile = null) {
    if (!fullName || !password) {
      throw new Error("Full name and password are required");
    }

    let avatarUrl = null;

    if (avatarFile) {
      avatarUrl = await AuthService.uploadAvatar(avatarFile, id);
    }

    const profileData = {
      full_name: fullName,
      is_complete: true,
    };

    if (avatarUrl) {
      profileData.avatar_url = avatarUrl;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", id);

    AuthService.handleAuthError(profileError, "Error updating profile");

    const userData = {
      password,
      data: { full_name: fullName, email_verified: true },
    };

    if (avatarUrl) {
      userData.data.avatar_url = avatarUrl;
    }

    const { data, error: userError } = await supabase.auth.updateUser(userData);

    AuthService.handleAuthError(userError, "Error updating user");
    return data;
  }

  static async uploadAvatar(file, userId) {
    if (!file) {
      throw new Error("Avatar file is required");
    }

    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 4 * 1024 * 1024;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("Avatar must be a JPG, PNG, or WEBP image");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of 4MB`);
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      AuthService.handleAuthError(error, "Error uploading avatar");

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  static async updateAvatar(userId, avatarFile) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!avatarFile) {
      throw new Error("Avatar file is required");
    }

    try {
      // Upload the avatar and get URL
      const avatarUrl = await AuthService.uploadAvatar(avatarFile, userId);

      // Update the profile with the new avatar URL
      const { error: profileError } = await supabase
        .from("avatars")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      AuthService.handleAuthError(
        profileError,
        "Error updating profile with avatar"
      );

      // Also update the user's metadata
      const { data, error: userError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      AuthService.handleAuthError(
        userError,
        "Error updating user metadata with avatar"
      );

      return avatarUrl;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  }

  static async deleteAvatar(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      // Get the current profile to find the avatar URL
      const profile = await AuthService.getProfile(userId);

      if (!profile.avatar_url) {
        // No avatar to delete
        return true;
      }

      // Extract filename from URL
      const avatarUrl = new URL(profile.avatar_url);
      const filePath = avatarUrl.pathname.split("/").slice(-2).join("/");

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("profiles")
        .remove([`avatars/${filePath}`]);

      if (storageError) {
        console.error("Error removing avatar file:", storageError);
      }

      // Update profile to remove avatar URL
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      AuthService.handleAuthError(profileError, "Error updating profile");

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      AuthService.handleAuthError(userError, "Error updating user metadata");

      return true;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }

  static async updatePassword(password) {
    if (!password) throw new Error("Password is required");
    const { data, error } = await supabase.auth.updateUser({
      password,
      options: { redirectTo: `${window.location.origin}/update-password` },
    });
    AuthService.handleAuthError(error, "Error updating password");
    return data;
  }

  static async resetPassword(email) {
    if (!email) throw new Error("Email is required");
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
      shouldCreateSession: false,
    });
    AuthService.handleAuthError(error, "Error resetting password");
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    AuthService.handleAuthError(error, "Error signing out");
  }

  static async checkEmail(email) {
    if (!email) throw new Error("Email is required");
    const { data, error } = await supabase.rpc("check_user_verified", {
      email_query: email,
    });
    AuthService.handleAuthError(error, "Error checking email");
    return data;
  }

  static onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback({
        event,
        user: session?.user || null,
      });
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  }
}

export default AuthService;
