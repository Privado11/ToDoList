import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logoImg from "../../../../assets/logo-piranha.webp"; 
import "../../../auth/components/SignIn/OAuthSignInPage.css";
import { useAuth } from "@/context/AuthContext";


const providers = [
  { id: 1, name: "Google", icon: <FcGoogle /> },
  { id: 2, name: "Facebook", icon: <FaFacebook color="#4267B2" /> },
];

function SignUp() {
  const { signInWithGoogle, signInWithFacebook, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState(""); 
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();

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


    try {
      await signUpWithEmail(email);
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

export default SignUp;
