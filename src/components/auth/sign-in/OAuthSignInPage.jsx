import React, { useState } from "react";
import { SignInOptions } from "./SignInOptions";
import { PasswordLogin } from "./PasswordLogin";
import logoImg from "../../../assets/logo-piranha.webp";
import "../../../styles/OAuthSignInPage.css";

const OAuthSignInPage = () => {
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);

  const changeToPasswordScreen = (email, captchaToken) => {
    setEmail(email);
    setCaptchaToken(captchaToken);
    setShowPasswordScreen(!showPasswordScreen);
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

          <h1 className="signin-title">Sign In</h1>
          <p className="signin-welcome">
            Welcome user, please sign in to continue
          </p>
        </div>
        {!showPasswordScreen ? (
          <SignInOptions changeToPasswordScreen={changeToPasswordScreen} />
        ) : (
          <PasswordLogin
            changeToPasswordScreen={changeToPasswordScreen}
            email={email}
            captchaToken={captchaToken}
          />
        )}
      </div>
    </div>
  );
};

export default OAuthSignInPage;
