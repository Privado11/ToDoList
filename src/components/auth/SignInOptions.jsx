import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserSecret } from "react-icons/fa";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNavigate } from "react-router-dom";

const providers = [
  { id: 1, name: "Google" },
  { id: 2, name: "Facebook" },
  { id: 3, name: "Guest" },
];

function SignInOptions({ changeToPasswordScreen }) {
  const { signInWithGoogle, signInWithFacebook, signInAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const captcha = useRef(null);
  const navigate = useNavigate();

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
      } else if (provider.id === 3) {
        if (!captchaToken) {
          alert("Por favor, completa el captcha.");
          return;
        }
        await signInAsGuest(captchaToken);
      }

      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      if (captcha.current) captcha.current.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("captcha-error");
      if (errorElement) {
        errorElement.textContent = "Por favor, completa el captcha.";
        errorElement.style.display = "block";
      }
      return;
    }

    changeToPasswordScreen(email);
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
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Turnstile
          siteKey="0x4AAAAAAAyDiG3nWfF90m8c"
          onSuccess={(token) => setCaptchaToken(token)}
          ref={captcha}
        />
        <button type="submit" className="submit-button">
          Next
        </button>
      </form>

      <div className="signup-link-container">
        <span>
          Need an account? <a href="/signup">Sign Up</a>
        </span>
      </div>
    </div>
  );
}

export { SignInOptions };
