import React, { useEffect, useRef, useState } from "react";
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
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInAsGuest,
    checkIfEmailExists,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const captcha = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (captchaToken) {
      setCaptchaError("");
    }
  }, [captchaToken]);

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
      } else if (provider.id === 3) {
        if (!captchaToken) {
          setCaptchaError("Por favor, completa el captcha.");
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    //if (!email) {
    //  setEmailError("El correo electrónico es requerido.");
    //  return;
    //} else if (!/\S+@\S+\.\S+/.test(email)) {
    //  setEmailError("Por favor, introduce un correo electrónico válido.");
    //  return;
    //} else {
    //  setEmailError("");
    //}
//
    //if (!captchaToken) {
    //  setCaptchaError("Por favor, completa el captcha.");
    //  return;
    //}

    changeToPasswordScreen(email);
  };

  const handleInvalid = (e) => {
    e.preventDefault();
    setEmailError("El correo electrónico es requerido.");
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

      <form className="signin-form" onSubmit={handleEmailSubmit} novalidate>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => handleOnChange(e)}
         onInvalid={handleInvalid}
          required
        />
        {emailError && <div className="error">{emailError}</div>}{" "}
        <div className="captcha-container">
          <Turnstile
            siteKey="0x4AAAAAAAyDiG3nWfF90m8c"
            onSuccess={(token) => setCaptchaToken(token)}
            ref={captcha}
          />
        </div>
        {captchaError && <div className="error">{captchaError}</div>}{" "}
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
