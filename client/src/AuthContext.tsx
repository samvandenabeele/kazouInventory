// AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Define a User type (adjust fields to your app)
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the shape of your context
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
