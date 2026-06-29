"use client";

import { useEffect, useState } from "react";

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return {
        token,
        login,
        logout,
        isLoggedIn: !!token,
    };
}