import { supabase } from "../supabase";

class AuthService {
  static getPopupConfig(width = 600, height = 700) {
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;

    return {
      dimensions: { width, height, left, top },
      features: [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        "status=yes",
        "toolbar=no",
        "location=no",
        "menubar=no",
        "resizable=yes",
        "scrollbars=yes",
      ].join(","),
    };
  }

  static async handleOAuthSignIn(provider, options = {}) {
    const { dimensions, features } = AuthService.getPopupConfig();

    try {
      const popup = window.open(
        "about:blank",
        `Login with ${provider}`,
        features
      );

      if (!popup) {
        throw new Error("Popup was blocked by the browser");
      }

      popup.moveTo(dimensions.left, dimensions.top);
      popup.resizeTo(dimensions.width, dimensions.height);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true,
          ...options,
        },
      });

      if (error) throw error;

      if (data?.url && popup) {
        popup.location.href = data.url;
      }

      return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === "SUPABASE_AUTH_COMPLETE") {
            cleanup();
            resolve(event.data);
          }
        };

        const checkInterval = setInterval(() => {
          if (popup?.closed) {
            cleanup();
            reject(new Error("Authentication window closed"));
          }
        }, 500);

        const cleanup = () => {
          window.removeEventListener("message", messageHandler);
          clearInterval(checkInterval);
          popup?.close();
        };

        window.addEventListener("message", messageHandler);
      });
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
      console.error("Error detallado:", error);
      AuthService.handleAuthError(error, "Error signing in as guest");
    }
  }

  static async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    AuthService.handleAuthError(error, "Error getting user");
    if (!user) throw new Error("User not found");
    return user;
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

  static onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback({
        user: session?.user || null,
        isVerified: session?.user?.user_metadata?.email_verified ?? null,
      });
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  }
}

export default AuthService;
