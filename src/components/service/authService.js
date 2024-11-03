import { supabase } from "./supabase";

class AuthService {
  static handleAuthError(error, customMessage) {
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }

  static async signInWithGoogle() {
    const width = 600;
    const height = 700;

    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;

    const popupFeatures = [
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
    ].join(",");

    try {
      const popup = window.open(
        "about:blank",
        "Login with Google",
        popupFeatures
      );

      if (!popup) {
        throw new Error("The popup was blocked by the browser");
      }

      popup.moveTo(left, top);
      popup.resizeTo(width, height);

      const options = {
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true,
        },
      };

      const { data, error } = await supabase.auth.signInWithOAuth(options);

      if (error) throw error;

      if (data?.url && popup) {
        popup.location.href = data.url;
      }

      return await new Promise((resolve, reject) => {
        window.addEventListener("message", (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === "SUPABASE_AUTH_COMPLETE") {
            popup?.close();
            resolve(event.data);
          }
        });

        const checkInterval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkInterval);
            reject(new Error("Authentication window closed"));
          }
        }, 500);
      });
    } catch (error) {
      AuthService.handleAuthError(error, "Error logging in with Google");
      throw error;
    }
  }

  static async signInWithEmail(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    AuthService.handleAuthError(error, "Error signing in with email");
  }

  static async signInWithMagicLink(email) {
    if (!email) {
      throw new Error("Email is required");
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    AuthService.handleAuthError(error, "Error sending magic link");
  }

  static async signInWithGoogle() {
    const width = 600;
    const height = 700;

    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;

    const popupFeatures = [
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
    ].join(",");

    try {
      const popup = window.open(
        "about:blank",
        "Login with Google",
        popupFeatures
      );

      if (!popup) {
        throw new Error("The popup was blocked by the browser");
      }

      popup.moveTo(left, top);
      popup.resizeTo(width, height);

      const options = {
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true,
        },
      };

      const { data, error } = await supabase.auth.signInWithOAuth(options);

      if (error) throw error;

      if (data?.url && popup) {
        popup.location.href = data.url;
      }

      return await new Promise((resolve, reject) => {
        window.addEventListener("message", (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === "SUPABASE_AUTH_COMPLETE") {
            popup?.close();
            resolve(event.data);
          }
        });

        const checkInterval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkInterval);
            reject(new Error("Authentication window closed"));
          }
        }, 500);
      });
    } catch (error) {
      AuthService.handleAuthError(error, "Error logging in with Google");
      throw error;
    }
  }

  static async signInAsGuest() {
    const { error } = await supabase.auth.signInAnonymously();
    AuthService.handleAuthError(error, "Error signing in as guest");
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    AuthService.handleAuthError(error, "Error signing out");
  }

  static async signUpWithEmail(email, password = "Piranha Planner Sign Up") {
    if (!email) {
      throw new Error("Email is required");
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/complete-profile`,
        data: {
          email_verified: false,
        },
      },
    });
    AuthService.handleAuthError(error, "Error signing up");
  }

  static async getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async resetPassword(email) {
    if (!email) {
      throw new Error("Email is required");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    AuthService.handleAuthError(error, "Error resetting password");
  }

  static async completeProfile(fullName, password) {
    if (!fullName || !password) {
      throw new Error("Full name and password are required");
    }
    const { error } = await supabase.auth.updateUser({
      password: password,
      data: {
        full_name: fullName,
        email_verified: true,
      },
    });
    AuthService.handleAuthError(error, "Error updating profile");
  }

  static async updatePassword(password) {
    if (!password) {
      throw new Error("Password is required");
    }
    const { error } = await supabase.auth.updateUser({
      password: password,
      options: {
        redirectTo: `${window.location.origin}/update-password`,
      },
    });
    AuthService.handleAuthError(error, "Error updating password");
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

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

export default AuthService;
