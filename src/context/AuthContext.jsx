import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";
import { seedUser } from "../utils/seedData";

const AuthContext = createContext(null);

// NOTE: this is a mock credential store for a prototype only. Passwords are
// kept in plain text in localStorage — fine for demoing in a browser, never
// acceptable for anything real.

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => loadState("users", []));
  const [sessionUserId, setSessionUserId] = useState(() => loadState("sessionUserId", null));

  useEffect(() => saveState("users", users), [users]);
  useEffect(() => saveState("sessionUserId", sessionUserId), [sessionUserId]);

  const user = users.find((u) => u.id === sessionUserId) ?? null;

  const signup = ({ fullName, email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { error: "An account with this email already exists." };
    }
    const newUser = {
      ...seedUser,
      id: "user-" + Date.now().toString(36),
      name: fullName,
      email: normalizedEmail,
      password,
      role,
      // Both roles now have a mandatory one-time questionnaire before they
      // can use the rest of the app — see AppLayout's redirect check.
      profileComplete: false,
    };
    setUsers((prev) => [...prev, newUser]);
    setSessionUserId(newUser.id);
    return { user: newUser };
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const match = users.find((u) => u.email === normalizedEmail && u.password === password);
    if (!match) {
      return { error: "Incorrect email or password." };
    }
    setSessionUserId(match.id);
    return { user: match };
  };

  const logout = () => setSessionUserId(null);

  const updateProfile = (updates) => {
    if (!user) return;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updates } : u)));
  };

  // Used by MessagesContext to decide whether a message recipient is a real
  // account (worth mirroring the message into their own inbox) or a seeded
  // placeholder character (roommates/listings with no real login).
  const isRegisteredUser = (id) => users.some((u) => u.id === id);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout, updateProfile, isRegisteredUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
