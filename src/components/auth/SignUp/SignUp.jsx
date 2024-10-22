import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaUserSecret } from "react-icons/fa";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNavigate } from "react-router-dom";

const providers = [
  { id: 1, name: "Google" },
  { id: 2, name: "Facebook" },
];

function SignUp() {
  const { signInWithGoogle, signInWithFacebook, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true); 
  const captcha = useRef();
  const navigate = useNavigate();


  useEffect(() => {
    if (confirmPassword.length >= 6) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true); 
    }
  }, [confirmPassword, password]);

  const handleSignIn = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!captchaToken) {
      alert("Por favor, completa el captcha.");
      return;
    }
    try {
      await signUpWithEmail(email, password, captchaToken);
      navigate("/");
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("Error al registrarse: " + error.message);
    } finally {
      if (captcha.current) captcha.current.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  return (
    <div className="oauth-signin-container">
      <div className="oauth-signin">
        <div
          className="signin-header"
          style={{ textAlign: "center", marginBottom: "1.5rem" }}
        >
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
          <div className="signin-container">
            {providers.map((provider) => (
              <button
                key={provider.id}
                className="signin-button"
                onClick={() => handleSignIn(provider)}
              >
                <img
                  src={`https://www.${provider.name}.com/favicon.ico`}
                  alt={provider.name}
                  className="provider-icon"
                />
                Sign Up With {provider.name}
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
              {!passwordsMatch && confirmPassword.length >= 6 && (
                <p style={{ color: "red" }}>Las contraseñas no coinciden.</p>
              )}
              <Turnstile
                siteKey="0x4AAAAAAAyDiG3nWfF90m8c"
                onSuccess={(token) => setCaptchaToken(token)}
                ref={captcha}
              />
              <div className="signup-link-container">
                <span>
                  By entering your email to sign up, you agree to our Terms and
                  to receive service-related emails from us.
                </span>
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={!passwordsMatch || confirmPassword.length < 6}
              >
                Sign UP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SignUp };
