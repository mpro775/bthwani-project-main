import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

interface Driver {
  _id: string;
  fullName: string;
  role: "rider_driver" | "light_driver" | "women_driver";
  [key: string]: any;
}

interface AuthContextType {
  driver: Driver | null;
  token: string | null;
  loading: boolean;
  signIn: (token: string, driver: Driver) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  driver: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      const storedDriver = await SecureStore.getItemAsync("driver");
      if (storedToken && storedDriver) {
        setToken(storedToken);
        setDriver(JSON.parse(storedDriver));
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const signIn = async (newToken: string, newDriver: Driver) => {
    await SecureStore.setItemAsync("token", newToken);
    await SecureStore.setItemAsync("driver", JSON.stringify(newDriver));
    setToken(newToken);
    setDriver(newDriver);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("driver");
    setToken(null);
    setDriver(null);
  };

  return (
    <AuthContext.Provider value={{ driver, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
