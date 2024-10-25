import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/OAuthSignInPage.css";

const providers = [
  { id: 1, name: "Google", icon: <FcGoogle /> },
  { id: 2, name: "Facebook", icon: <FaFacebook color="#4267B2" /> },
];

function SignUp() {
  const { signInWithGoogle, signInWithFacebook, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(""); 

  const navigate = useNavigate();

  useEffect(() => {
    if (confirmPassword.length >= 6) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match.");
      }
    } else {
      setPasswordError("");
    }
  }, [confirmPassword, password]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
      }
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
     
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email.");
      return;
    } else {
      setEmailError("");
    }

 
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (!passwordsMatch) {
      return; 
    }

    try {
      await signUpWithEmail(email, password);
      navigate("/");
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
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: "2rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="signin-title">Sign Up</h1>
        </div>
        <button onClick={handleBackClick} className="back-button">
          <IoIosArrowRoundBack className="back-icon" />
          Back
        </button>
        <div className="signin-container">
          {providers.map((provider) => (
            <button
              key={provider.id}
              className="signin-button"
              onClick={() => handleSignIn(provider)}
            >
              {provider.icon} Sign Up With {provider.name}
            </button>
          ))}

          <div className="divider">
            <span className="divider-text">or</span>
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

            <div className="signup-link-container">
              <span>
                By entering your email to sign up, you agree to our Terms and to
                receive service-related emails from us.
              </span>
            </div>
            <button type="submit" className="submit-button">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { SignUp };
