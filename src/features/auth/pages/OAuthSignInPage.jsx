import React, { useState } from "react";
import logoImg from "../../../assets/logo-piranha.webp";
import { PasswordLogin, SignInOptions } from "../components/SignIn";

const OAuthSignInPage = () => {
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [email, setEmail] = useState("");

  const changeToPasswordScreen = (email) => {
    setEmail(email);
    setShowPasswordScreen(true); 
  };

  const goBackToOptions = () => {
    setShowPasswordScreen(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 md:p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="text-left mb-6">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img
              src={logoImg}
              alt="Piranha Planner Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h1 className="text-3xl font-semibold text-slate-700">Sign In</h1>
          <p className="text-base font-medium text-slate-600">
            Welcome user, please sign in to continue
          </p>
        </div>
        {!showPasswordScreen ? (
          <SignInOptions changeToPasswordScreen={changeToPasswordScreen} />
        ) : (
          <PasswordLogin
            changeToPasswordScreen={goBackToOptions}
            email={email}
          />
        )}
      </div>
    </div>
  );
};

export default OAuthSignInPage;
