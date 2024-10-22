import React, { useState } from "react";
import { Link } from "@mui/material";
import "../../styles/OAuthSignInPage.css";
import { SignInOptions } from "./SignInOptions";
import { PasswordLogin } from "./PasswordLogin";



function SignUpLink() {
  return (
    <Link href="/" variant="body2">
      Sign up
    </Link>
  );
}

function ForgotPasswordLink() {
  return (
    <Link href="/" variant="body2">
      Forgot password?
    </Link>
  );
}

const OAuthSignInPage = () => {
  
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [email, setEmail] = useState("");

  const changeToPasswordScreen = (email) => {
    setEmail(email);
    setShowPasswordScreen(!showPasswordScreen);
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

          <h1 className="signin-title">Sign In</h1>
          <p className="signin-welcome">
            Welcome user, please sign in to continue
          </p>
          {!showPasswordScreen ? (
            <SignInOptions changeToPasswordScreen={changeToPasswordScreen} />
          ) : (
            <PasswordLogin changeToPasswordScreen={changeToPasswordScreen} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthSignInPage;
