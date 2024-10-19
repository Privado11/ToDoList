// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import {
  signInWithGoogle,
  signInWithFacebook,
  signOut,
  onAuthStateChange,
} from "../service/authService";

export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });


    return () => unsubscribe();
  }, []);

  return { user, loading, signInWithGoogle, signInWithFacebook, signOut };
};
