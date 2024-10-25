import { supabase } from "./supabase";

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing in with Google: " + error.message);
  }
};

export const signInWithEmail = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing in with email: " + error.message);
  }
};

export const signInMagicLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
  });
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing in with magic link: " + error.message);
  }
};

export const signInWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
  });
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing in with Facebook: " + error.message);
  }
};

export const signInAsGuest = async () => {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing in as guest: " + error.message);
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing out: " + error.message);
  }
};

export const signUpWithEmail = async (email, password, captchaToken) => {
  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { captchaToken },
  });
  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Error signing up: " + error.message);
  }
};

export const onAuthStateChange = (callback) => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user ?? null);
    }
  );

  return {
    unsubscribe: () => listener.subscription.unsubscribe(),
  };
};
