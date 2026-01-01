import React from "react";
import { signout } from "../api";

function getEmailFromToken() {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    const payload = t.split(".")[1];
    if (!payload) return null;
    // atob: base64 decode (browser)
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.email || null;
  } catch {
    return null;
  }
}

export default function Header({ onLogout }) {
  const email = getEmailFromToken();

  return (
    <div className="topbar">
      <h1 className="app-title">ToDo App (Drag & Drop)</h1>
      <div className="topbar-right">
        {email && <div className="user-pill" title={email}>{email}</div>}
        <button
          className="logout-btn"
          onClick={() => {
            signout();
            if (onLogout) onLogout();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
