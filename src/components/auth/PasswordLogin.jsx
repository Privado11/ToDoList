import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoPasskeyFill } from "react-icons/go";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

function PasswordLogin({ changeToPasswordScreen, email }) {
  const handleBackClick = () => {
    changeToPasswordScreen();
  };

  return (
    <div
      style={{
        marginTop: "1.5rem",
      }}
    >
      <button
        onClick={handleBackClick}
        style={{
          display: "flex",
          color: "rgb(92, 111, 138)",
          fontSize: "16px",
          fontWeight: "500",
          padding: "1rem 1.5rem",
          paddingLeft: "0",
        }}
      >
        <IoIosArrowRoundBack
          style={{
            marginRight: "8px",
            cursor: "pointer",
            height: "1.6rem",
            width: "1.6rem",
          }}
        />
        Back
      </button>

      <div>
        <button style={buttonStyle}>
          <MdOutlineKeyboardArrowRight
            style={{ position: "absolute", top: "2.4rem", right: "2.4rem" }}
          />
          <div
            style={{
              display: "inline-flex",
              alignItems: "flex-start",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "rgb(231, 247, 255)",
              color: "rgb(63, 166, 240)",
            }}
          >
            <GoPasskeyFill style={{width: "2rem", height: "2rem"}}/>
          </div>
          <span>Sign in with a passkey</span>
        </button>

        <button style={buttonStyle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>Sign in with a password</span>
          </div>
        </button>
      </div>

      <button
        style={{
          background: "none",
          border: "none",
          color: "#3b82f6",
          marginTop: "16px",
          alignSelf: "center",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Forgot password?
      </button>
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  backgroundColor: "white",
  padding: "16px 48px 16px 16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontSize: "16px",
  position: "relative",
};

export { PasswordLogin };
