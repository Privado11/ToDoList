import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaUserSecret } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/SignInOptions.css";

const providers = [
  { id: 1, name: "Google" },
  { id: 2, name: "Facebook" },
  { id: 3, name: "Guest" },
];

function SignInOptions({ changeToPasswordScreen }) {
  const { signInWithGoogle, signInWithFacebook, signInAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
      } else if (provider.id === 3) {
        await signInAsGuest();
      }

      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Error signing in: " + error.message);
    } finally {
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    changeToPasswordScreen(email);
  };

  const handleInvalid = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Please enter an email address.");
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
    }
  };

  const handleOnChange = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
    setEmailError("");
  };

  return (
    <div className="signin-container">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className="signin-button"
          onClick={() => handleSignIn(provider)}
        >
          {provider.id !== 3 ? (
            <img
              src={`https://www.${provider.name}.com/favicon.ico`}
              alt={provider.name}
              className="provider-icon"
            />
          ) : (
            <FaUserSecret className="provider-icon" />
          )}
          Sign In {provider.id !== 3 ? "With" : "As"} {provider.name}
        </button>
      ))}

      <div className="divider">
        <span className="divider-text">or</span>
      </div>

      <form className="signin-form" onSubmit={handleEmailSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => handleOnChange(e)}
          onInvalid={handleInvalid}
          required
        />
        {emailError && <div className="error">{emailError}</div>}
        
        
        <button type="submit" className="submit-button">
          Next
        </button>
      </form>

      <div className="signup-link-container">
        <span>
          Need an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="signup-link"
            style={{ cursor: "pointer" }}
          >
            Sign Up
          </span>
        </span>
      </div>
    </div>
  );
}

export { SignInOptions };
