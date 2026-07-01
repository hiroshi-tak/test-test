"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export function useAuth() {
    const [status, setStatus] = useState<"loading" | "auth" | "guest">("loading");
    const router = useRouter();

    const fetchMe = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                credentials: "include",
            });

            if (!res.ok) {
                setStatus("guest");
                return false;
            }

            const data = await res.json();

            setStatus(data.loggedIn ? "auth" : "guest");
            return data.loggedIn;
        } catch (e) {
            setStatus("guest");
            return false;
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            return false;
        }

        await fetchMe();
        router.push("/");
        return true;
    };

    const logout = async () => {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        setStatus("guest");
        router.push("/auth/login");
    };

    return {
        status,
        isLoggedIn: status === "auth",
        loading: status === "loading",
        login,
        logout,
    };
}
