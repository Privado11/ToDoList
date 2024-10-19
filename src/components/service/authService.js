import { supabase } from "./supabase";

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error)
    throw new Error("Error al iniciar sesión con Google: " + error.message);
};

export const signInWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
  });
  if (error)
    throw new Error("Error al iniciar sesión con Facebook: " + error.message);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Error al cerrar sesión: " + error.message);
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
