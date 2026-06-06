"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {

  const router = useRouter();

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
    }

  }, []);

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right,#020617,#0f172a,#111827)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#1e293b",
          borderRadius: 24,
          padding: 40,
          border: "1px solid #334155",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >

        <h1
          style={{
            fontSize: 42,
            marginBottom: 10,
          }}
        >
          ♟ Chess Arena
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: 40,
          }}
        >
          Welcome back,
          {" "}
          <b>{user?.username}</b>
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >

          <Link
            href="/game"
            style={{
              padding: 18,
              borderRadius: 14,
              background:
                "linear-gradient(to right,#2563eb,#3b82f6)",
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ▶ Start Match
          </Link>

          <Link
            href="/history"
            style={{
              padding: 18,
              borderRadius: 14,
              background:
                "linear-gradient(to right,#16a34a,#22c55e)",
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            📜 Match History
          </Link>

        </div>

      </div>

    </div>
  );
}