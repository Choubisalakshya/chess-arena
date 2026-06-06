"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSignin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:4000/api/auth/signin",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // router.push("/game");
        router.push("/dashboard");

      } else {

        alert(data.msg || "Login failed");

      }

    } catch (err) {

      console.log(err);

      alert("Server error");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div style={styles.page}>

      {/* Overlay */}
      <div style={styles.overlay}></div>

      {/* Card */}
      <div style={styles.card}>

        <h1 style={styles.title}>
          ♟️ Welcome Back
        </h1>

        <p style={styles.subtitle}>
          Sign in to continue your chess journey
        </p>

        <form
          onSubmit={handleSignin}
          style={styles.form}
        >

          <input
            type="email"
            placeholder="Email Address"
            required
            style={styles.input}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            style={styles.input}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <p style={styles.footerText}>
          New here?{" "}
          <Link
            href="/signup"
            style={styles.link}
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    position: "relative",

    backgroundImage:
      "url('/images/chess-bg.jpg')",

    backgroundSize: "cover",

    backgroundPosition: "center",

    overflow: "hidden",
  },

  overlay: {
    position: "absolute",

    inset: 0,

    background:
      "rgba(0,0,0,0.7)",
  },

  card: {
    position: "relative",

    zIndex: 2,

    width: "100%",

    maxWidth: 420,

    background:
      "rgba(15, 23, 42, 0.92)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    borderRadius: 24,

    padding: "40px 32px",

    boxShadow:
      "0 20px 60px rgba(0,0,0,0.5)",

    backdropFilter: "blur(10px)",

    color: "white",
  },

  title: {
    fontSize: 38,

    fontWeight: "800",

    textAlign: "center",

    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",

    color: "#cbd5e1",

    marginBottom: 30,

    lineHeight: 1.6,
  },

  form: {
    display: "flex",

    flexDirection: "column",

    gap: 18,
  },

  input: {
    padding: "15px 18px",

    borderRadius: 12,

    border: "1px solid #334155",

    background: "#0f172a",

    color: "white",

    fontSize: 16,

    outline: "none",
  },

  button: {
    padding: "15px",

    borderRadius: 12,

    border: "none",

    cursor: "pointer",

    fontSize: 16,

    fontWeight: "700",

    background:
      "linear-gradient(to right, #facc15, #eab308)",

    color: "black",

    transition: "0.3s",
  },

  footerText: {
    marginTop: 24,

    textAlign: "center",

    color: "#cbd5e1",
  },

  link: {
    color: "#facc15",

    textDecoration: "none",

    fontWeight: "700",
  },
};