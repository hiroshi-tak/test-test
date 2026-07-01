"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export async function apiFetch(path: string, options: RequestInit = {}) {

    let res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    // AccessToken期限切れ
    if (res.status === 401 || res.status === 403) {

        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (refreshRes.ok) {
            // もう一回リトライ
            res = await fetch(`${API_BASE}${path}`, {
                ...options,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {}),
                },
            });
        } else {
            // refresh失敗 → ログアウト扱い
            window.location.href = "/auth/login";
        }
    }

    return res;
}

