"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:4000/api/auth/signup",
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

        alert(data.msg || "Signup failed");

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

      <div style={styles.overlay}></div>

      <div style={styles.card}>

        <h1 style={styles.title}>
          ♟️ Join Chess Arena
        </h1>

        <p style={styles.subtitle}>
          Create your account and start battling players worldwide
        </p>

        <form
          onSubmit={handleSignup}
          style={styles.form}
        >

          <input
            type="text"
            placeholder="Username"
            required
            style={styles.input}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
          />

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
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p style={styles.footerText}>
          Already registered?{" "}
          <Link
            href="/signin"
            style={styles.link}
          >
            Sign In
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

    maxWidth: 450,

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