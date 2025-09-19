"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  full_name: string | null;
  user_name: string | null;
  user_password: string | null;
  role: string | null;
  number_phone: string | null;
};

type AuthContextType = {
  user: Profile | null;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Para mantener sesión en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("customUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);

    // Buscar en la tabla profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      setLoading(false);
      return { error: "Usuario no encontrado" };
    }

    if (data.user_password !== password) {
      setLoading(false);
      return { error: "Contraseña incorrecta" };
    }

    setUser(data);
    localStorage.setItem("customUser", JSON.stringify(data));
    setLoading(false);

    return { error: null };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("customUser");
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
