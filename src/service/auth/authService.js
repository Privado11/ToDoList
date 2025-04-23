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

      // Redirect to the OAuth provider's authentication page
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

  static async signInWithEmail(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    AuthService.handleAuthError(error, "Error signing in with email");
    return data;
  }

  static async signUpWithEmail(email, password = "Temporary Password") {
    if (!email) {
      throw new Error("Email is required");
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

    AuthService.handleAuthError(userError, "Error getting user");

    if (!user) throw new Error("User not found");

    return user;
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

  static async completeProfile(fullName, password, id) {
    if (!fullName || !password) {
      throw new Error("Full name and password are required");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", id);

    AuthService.handleAuthError(profileError, "Error updating profile");

    const { data, error: userError } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName, email_verified: true },
    });

    AuthService.handleAuthError(userError, "Error updating user");
    return data;
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
    const { data, error } = await supabase.rpc("check_email_registered", {
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
