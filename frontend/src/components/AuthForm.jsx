import React, { useState } from "react";
import { signin, signup } from "../api";

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const res = isLogin
    ? await signin(form.email, form.password)
    : await signup(form.email, form.password);

  if (!res.ok) {
    setError(res.error);
    return;
  }

  onAuthSuccess();
};

  return (
    <div className="auth-container gradient-background">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Sign In" : "Sign Up"}</h2>


        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="error">{error}</p>}

        <button type="submit">{isLogin ? "Login" : "Register"}</button>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="switch-link"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already registered? Login"}
        </p>
      </form>
    </div>
  );
}
