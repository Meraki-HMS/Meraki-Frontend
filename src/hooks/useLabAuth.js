"use client";
import { useState, useEffect } from "react";

export const useLabAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const labLoggedIn = localStorage.getItem("labLoggedIn");
        const userData = localStorage.getItem("hmsUser");

        if (labLoggedIn === "true" && userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role === "lab") {
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Lab auth error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("labLoggedIn");
    localStorage.removeItem("hmsUser");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/lab/login";
  };

  return { user, loading, isAuthenticated, logout };
};
