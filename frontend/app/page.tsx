"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isLoggedIn, login, logout } = useAuth();

  return (
    <main>
      <h1>Frontend OK</h1>

      {isLoggedIn ? (
        <>
          <p>ログイン中</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button
          onClick={async () => {
            const res = await fetch("http://localhost:8080/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: "a", password: "b" }),
            });

            const token = await res.text();
            login(token);
          }}
        >
          Login
        </button>
      )}
    </main>
  );
}

/*
export default function Home() {

  const login = async () => {
    console.log("login clicked");

    const res = await fetch("http://localhost:8080/api/auth/login", {
    //const res = await fetch("http://127.0.0.1:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "a",
        password: "b",
      }),
    });

    console.log("status:", res.status);

    const token = await res.text();
    console.log("token:", token);

    localStorage.setItem("token", token); //保持
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("logged in");
    } else {
      console.log("not logged in");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <main>
      <h1>Frontend OK</h1>

      <button
        type="button"
        onClick={login}
      >
        Login
      </button>

    </main>
  );
}
*/