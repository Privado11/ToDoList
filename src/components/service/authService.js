import { supabase } from "./supabase";

class AuthService {
  static handleAuthError(error, customMessage) {
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }

  static async signInWithGoogle() {
    return new Promise((resolve, reject) => {
      const width = 400;
      const height = 500;
      const left = Math.floor((window.innerWidth - width) / 2);
      const top = Math.floor((window.innerHeight - height) / 2);

      const redirectTo = `${window.location.origin}/`;
      const providerUrl = `${
        supabase.supabaseUrl
      }/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
        redirectTo
      )}`;

      const popup = window.open(
        providerUrl,
        "googleAuth",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error("Popup closed without signing in."));
        }
      }, 1000);

      supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          clearInterval(interval);
          popup.close();
          resolve(session);
        }
      });
    });
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

  static async signInWithFacebook() {
    return new Promise((resolve, reject) => {
      const width = 700;
      const height = 700;
      const left = Math.floor((window.innerWidth - width) / 2);
      const top = Math.floor((window.innerHeight - height) / 2);

      const redirectTo = `${window.location.origin}/`;
      const providerUrl = `${
        supabase.supabaseUrl
      }/auth/v1/authorize?provider=facebook&redirect_to=${encodeURIComponent(
        redirectTo
      )}`;

      const popup = window.open(
        providerUrl,
        "facebookAuth",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error("Popup closed without signing in."));
        }
      }, 1000);

      supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          clearInterval(interval);
          popup.close();
          resolve(session);
        }
      });
    });
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
