import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoPasskeyFill } from "react-icons/go";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import "../../styles/PasswordLogin.css";

function PasswordLogin({ changeToPasswordScreen, email }) {
  const [password, setPassword] = useState("");

  const handleBackClick = () => {
    changeToPasswordScreen();
  };

  const handleOnChange = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const SignInButton = ({ text, icon }) => (
    <button className="button">
      <MdOutlineKeyboardArrowRight className="arrow-icon" />
      <div className="passkey-icon-container">{icon}</div>
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
          <form
            className="signin-form"
            novalidate
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => handleOnChange(e)}
              required
              style={{ marginTop: "1rem", width: "90%" }}
            />

            <button
              type="submit"
              className="submit-button"
              style={{ marginTop: "1rem", width: "80%", padding: "1rem 1.6rem", justifyContent: "center", marginBottom: "2rem", marginTop: "2rem" }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
      <div className="forgot-password-container">
        <a className="forgot-password">Forgot password?</a>
      </div>
    </div>
  );
}

export { PasswordLogin };
