import React, { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import logoImg from "../../../../assets/logo-piranha.webp";
import { useAuth } from "@/context/AuthContext";

function PasswordReset() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  useEffect(() => {
    setEmail(location.state?.email || "");
  }, [location]);

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email.");
      return;
    } else {
      setEmailError("");
    }

    try {
      await resetPassword(email);
      setSuccessMessage("A reset link has been sent to your email!"); // Mensaje de éxito
      setTimeout(() => {
        navigate("/");
      }, 3000); 
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const handleBackClick = () => {
    navigate("/login");
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
        <button onClick={handleBackClick} className="back-button">
          <IoIosArrowRoundBack className="back-icon" />
          Back
        </button>

        <form className="signin-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <p style={{ color: "red" }}>{emailError}</p>}
          {successMessage && (
            <p style={{ color: "green" }}>{successMessage}</p>
          )}{" "}
          <button type="submit" className="submit-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset;
