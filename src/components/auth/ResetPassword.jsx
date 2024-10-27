import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo-piranha.webp";

function ResetPassword() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    symbol: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });

    if (confirmPassword.length >= 6) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) return;

    try {
      await updatePassword(password);
      console.log("Update completed");
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="oauth-signin-container">
      <div className="oauth-signin">
        <div className="signin-header">
          <div
            className="signin-icon"
            style={{
              width: "9rem",
              height: "9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: "2rem",
            }}
          >
            <img
              src={logoImg}
              alt="Piranha Planner Logo"
              style={{
                width: "9rem",
                height: "9rem",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </div>

          <h1 className="signin-title">Reset Password</h1>
        </div>
        <div className="signin-container">
          <form className="signin-form" onSubmit={handleSubmit}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li
                style={{ color: passwordRequirements.length ? "green" : "red" }}
              >
                {passwordRequirements.length ? "✓" : "✗"} At least 6 characters
              </li>
              <li
                style={{
                  color: passwordRequirements.uppercase ? "green" : "red",
                }}
              >
                {passwordRequirements.uppercase ? "✓" : "✗"} At least one
                uppercase letter
              </li>
              <li
                style={{
                  color: passwordRequirements.lowercase ? "green" : "red",
                }}
              >
                {passwordRequirements.lowercase ? "✓" : "✗"} At least one
                lowercase letter
              </li>
              <li
                style={{ color: passwordRequirements.digit ? "green" : "red" }}
              >
                {passwordRequirements.digit ? "✓" : "✗"} At least one digit
              </li>
              <li
                style={{ color: passwordRequirements.symbol ? "green" : "red" }}
              >
                {passwordRequirements.symbol ? "✓" : "✗"} At least one symbol
                (e.g., !@#$%)
              </li>
            </ul>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

            <button type="submit" className="submit-button">
              Updated Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { ResetPassword };
