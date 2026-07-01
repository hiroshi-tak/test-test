"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {

        if (!username || !password) {
            alert("ユーザー名とパスワードを入力してください");
            return;
        }

        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const message = await res.text();
                setError(message);
                return;
            }

            alert("登録成功");
            router.push("/auth/login");

        } catch (error: any) {
            setError("通信エラーが発生しました");
        }
    };

    return (
        <main>
            <div className="max-w-md mx-auto mt-20 space-y-6">
                <h1 className="text-3xl font-bold mb-6 text-red-500">
                    ユーザー登録
                </h1>

                <div>
                    <label
                        className="block mb-1"
                    >
                        ユーザー名
                    </label>
                    <input
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </div>

                <div>
                    <label
                        className="block mb-1"
                    >
                        パスワード
                    </label>
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleRegister}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        登録
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-center">
                        {error}
                    </p>
                )}

                <div className="flex justify-center">
                    <Link href="/auth/login" className="text-blue-600 underline">
                        ログインはこちら
                    </Link>
                </div>
            </div>
        </main>
    );
}