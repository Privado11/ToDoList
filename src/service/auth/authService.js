import baseService from "../base";
import { supabase } from "../base/supabase";

class AuthService extends baseService {
  static async handleOAuthSignIn(provider, options = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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

  static async linkWithEmail(email) {
    if (!email) {
      throw new Error("Email  are required");
    }

    try {
      const emailExists = await AuthService.checkEmail(email);

     if (emailExists.user_exists) {
       throw new Error(
         "This email is already registered. Please try using a different email address."
       );
     }


      const { data, error } = await supabase.auth.updateUser({
        email: email,
      });

      AuthService.handleAuthError(error, "");
      return data;
    } catch (error) {
      AuthService.handleAuthError(error, "");
      throw error;
    }
  }

  static async linkWithGoogle() {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      AuthService.handleAuthError(error, "Error linking account with Google");

      if (data?.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error) {
      AuthService.handleAuthError(error, "Error linking account with Google");
      throw error;
    }
  }

  static async linkWithFacebook() {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: "email,public_profile",
        },
      });

      AuthService.handleAuthError(error, "Error linking account with Facebook");

      if (data?.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error) {
      AuthService.handleAuthError(error, "Error linking account with Facebook");
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

  static async updatePassword(user, currentPassword, newPassword) {
    if (!currentPassword) throw new Error("Current password is required");
    if (!newPassword) throw new Error("New password is required");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return {
          success: false,
          message: updateError.message,
        };
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Unexpected error: " + error.message,
      };
    }
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

  static async signOutLocal() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    AuthService.handleAuthError(error, "Error signing out");
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
