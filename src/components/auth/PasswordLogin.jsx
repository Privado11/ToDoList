import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoPasskeyFill } from "react-icons/go";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import "../../styles/PasswordLogin.css";

function PasswordLogin({ changeToPasswordScreen, email }) {
  const handleBackClick = () => {
    changeToPasswordScreen();
  };

  const SignInButton = ({ text, icon }) => (
    <button className="button">
      <MdOutlineKeyboardArrowRight className="arrow-icon" />
      <div className="passkey-icon-container">
        {icon} 
      </div>
      <span>{text}</span>
    </button>
  );

  return (
    <div className="container-password">
      <button onClick={handleBackClick} className="back-button">
        <IoIosArrowRoundBack className="back-icon" />
        Back
      </button>

      <div className="button-container">
        <div className="button-passkey-password">
          <SignInButton
            text="Sign in with a passkey"
            icon={<GoPasskeyFill className="passkey-icon" />}
          />
        </div>

        <div className="button-passkey-password">
          <SignInButton
            text="Sign in with a password"
            icon={<FaKey className="passkey-icon" />}
          />
        </div>
      </div>
      <div className="forgot-password-container">
        <a className="forgot-password">Forgot password?</a>
      </div>
    </div>
  );
}

export { PasswordLogin };
