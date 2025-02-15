import React, { useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/SignInOptions.css";
import { useAuth } from "../../context/AuthContext";

const providers = [
  { id: 1, name: "Google" },
  { id: 2, name: "Facebook" },
  { id: 3, name: "Guest" },
];

function SignInOptions({ changeToPasswordScreen }) {
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInAsGuest,
    signInWithPhone,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (provider) => {
    setLoading(true);
    try {
      switch (provider.id) {
        case 1:
          await signInWithGoogle();
          break;
        case 2:
          await signInWithFacebook();
          break;
        case 3:
          await signInAsGuest();
          break;
        default:
          throw new Error("Unknown provider");
      }
      navigate("/");
    } catch (error) {
      setErrorMessage("Error signing in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    changeToPasswordScreen(email);
  };

  const handleOnChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setErrorMessage(""); 
  };

  return (
    <div className="signin-container">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className="signin-button"
          onClick={() => handleSignIn(provider)}
          disabled={loading}
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
          onChange={handleOnChange}
          required
        />
        {emailError && <div className="error">{emailError}</div>}
        {errorMessage && <div className="error">{errorMessage}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Loading..." : "Next"}
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
