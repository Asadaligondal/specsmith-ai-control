import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import * as authApi from "./auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // when a user signs in, ensure a theme preference exists; default new users to dark
      (async () => {
        try {
          if (!u) {
            // remove dark class when signed out
            document.documentElement.classList.remove("dark");
            setLoading(false);
            return;
          }
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          const data: any = snap.exists() ? snap.data() : {};
          const theme = data?.theme ?? null;
          if (!theme) {
            // default to dark for new users
            await setDoc(ref, { theme: "dark" }, { merge: true });
            document.documentElement.classList.add("dark");
          } else if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        } catch (e) {
          // ignore errors but ensure loading state is cleared
        } finally {
          setLoading(false);
        }
      })();
    });
    return () => unsub();
  }, []);

  const value = {
    user,
    loading,
    signUp: authApi.signUpWithEmail,
    signIn: authApi.signInWithEmail,
    signOut: authApi.signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
