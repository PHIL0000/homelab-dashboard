import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/api";

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  dashboardName?: string;
  timezone?: string;
  timeFormat?: "12h" | "24h" | string;
  dateFormat?:
    | "DD-MM-YYYY"
    | "MM-DD-YYYY"
    | "YYYY-MM-DD"
    | "DD.MM.YYYY"
    | string;
  pageVisibility?: Record<string, boolean>;
  oledAccentRgb?: {
    r: number;
    g: number;
    b: number;
  } | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      // Check setup status
      try {
        const setupStatus = await fetch(
          `${API_BASE}/auth/setup-status`,
        );
        const setupData = await setupStatus.json();

        if (setupData.needsSetup) {
          navigate("/setup");
          setIsLoading(false);
          return;
        }

        // Validate token if it exists
        if (token) {
          try {
            const userRes = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              setUser(userData);
            } else {
              setToken(null);
              localStorage.removeItem("token");
              navigate("/login");
            }
          } catch (e) {
            console.error("Auth validation failed", e);
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Initial check failed", error);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token, navigate]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const updateUser = (updatedUser: User) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
