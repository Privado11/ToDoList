import React, { useState } from "react";
import { SignInOptions } from "./SignInOptions";
import { PasswordLogin } from "./PasswordLogin";
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
        </div>
        {!showPasswordScreen ? (
          <SignInOptions changeToPasswordScreen={changeToPasswordScreen} />
        ) : (
          <PasswordLogin changeToPasswordScreen={changeToPasswordScreen} 
          email={email}
          captchaToken={captchaToken}/>
        )}
      </div>
    </div>
  );
};

export default OAuthSignInPage;
