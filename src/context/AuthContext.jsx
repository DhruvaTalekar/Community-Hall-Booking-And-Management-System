import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync profile from Firestore or local fallback
  const fetchAndSyncProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        setIsAdmin(data.role === "admin" || firebaseUser.email?.includes("admin"));
      } else {
        // Look up local user storage
        const localKey = `chb_user_${firebaseUser.uid}`;
        const localStored = localStorage.getItem(localKey);
        if (localStored) {
          const parsed = JSON.parse(localStored);
          setUserProfile(parsed);
          setIsAdmin(parsed.role === "admin" || firebaseUser.email?.includes("admin"));
        } else {
          // Default profile
          const isDefaultAdmin = firebaseUser.email?.toLowerCase().includes("admin");
          const defaultProf = {
            name: firebaseUser.displayName || "Valued Customer",
            email: firebaseUser.email,
            phone: "+91 98765 00000",
            address: "City Central",
            role: isDefaultAdmin ? "admin" : "user",
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, defaultProf).catch(() => {});
          localStorage.setItem(localKey, JSON.stringify(defaultProf));
          setUserProfile(defaultProf);
          setIsAdmin(defaultProf.role === "admin");
        }
      }
    } catch (err) {
      console.warn("Profile fetch error, using local fallback:", err.message);
      const isDefaultAdmin = firebaseUser.email?.toLowerCase().includes("admin");
      const fallbackProf = {
        name: firebaseUser.displayName || "Valued Customer",
        email: firebaseUser.email,
        phone: "+91 98765 00000",
        address: "City Central",
        role: isDefaultAdmin ? "admin" : "user"
      };
      setUserProfile(fallbackProf);
      setIsAdmin(isDefaultAdmin);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAndSyncProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register
  const registerUser = async (email, password, { name, phone, address }) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      
      const newProf = {
        name,
        email,
        phone,
        address: address || "",
        role: "user", // Normal users are always "user"
        status: "active",
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", res.user.uid), newProf);
      } catch (e) {
        console.warn("Could not save to firestore, saved locally:", e);
      }

      localStorage.setItem(`chb_user_${res.user.uid}`, JSON.stringify(newProf));
      setUserProfile(newProf);
      setIsAdmin(false);
      return res.user;
    } catch (error) {
      let msg = "Registration failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please log in.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      throw new Error(msg);
    }
  };

  // Login
  const loginUser = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await fetchAndSyncProfile(res.user);
      return res.user;
    } catch (error) {
      let msg = "Invalid email or password.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many failed login attempts. Please reset your password or try again later.";
      }
      throw new Error(msg);
    }
  };

  // Quick Demo / Tester Admin Login (helpful for evaluation and testing without pre-setup)
  const quickDemoLogin = async (role = "admin") => {
    const demoEmail = role === "admin" ? "admin@grandhorizonhall.com" : "customer@grandhorizonhall.com";
    const demoPassword = "Password@123";
    try {
      return await loginUser(demoEmail, demoPassword);
    } catch {
      // If demo user does not exist in Firebase Auth yet, auto-register it
      try {
        const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        const demoProf = {
          name: role === "admin" ? "Hall Administrator" : "Vikram Mehta",
          email: demoEmail,
          phone: "+91 98765 11223",
          address: "Civic Center Suite 4B",
          role: role,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", res.user.uid), demoProf).catch(() => {});
        localStorage.setItem(`chb_user_${res.user.uid}`, JSON.stringify(demoProf));
        setUserProfile(demoProf);
        setIsAdmin(role === "admin");
        return res.user;
      } catch (err) {
        throw new Error("Unable to create demo login: " + err.message);
      }
    }
  };

  // Logout
  const logoutUser = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  // Reset Password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      let msg = "Could not send password reset email.";
      if (error.code === "auth/user-not-found") msg = "No user found with this email.";
      throw new Error(msg);
    }
  };

  // Update Profile details
  const updateProfileData = async (updates) => {
    if (!currentUser) return;
    const updated = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, "users", currentUser.uid), updated, { merge: true });
    } catch (e) {}
    localStorage.setItem(`chb_user_${currentUser.uid}`, JSON.stringify(updated));
    setUserProfile(updated);
    return updated;
  };

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    registerUser,
    loginUser,
    logoutUser,
    quickDemoLogin,
    resetPassword,
    updateProfileData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
