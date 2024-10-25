import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import { ImMagicWand } from "react-icons/im";
import "../../../styles/PasswordLogin.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import emailImg from "../../../assets/correo-electronico.png";

function PasswordLogin({ changeToPasswordScreen, email }) {
  const { signInWithEmail, signInMagicLink } = useAuth();
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleBackClick = () => changeToPasswordScreen();

  const handleOnChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage("");
  };

  const togglePasswordForm = () => {
    setShowPasswordForm((prev) => !prev);
    if (showPasswordForm) {
      setPassword(""); 
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmail(email, password);
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage(error.message);
    }
  };

  const closeMagicModal = () => {
    setShowMagicModal(false);
    changeToPasswordScreen(false);
  };

  const handleMagicSignIn = async (e) => {
    e.preventDefault();
    if (showPasswordForm) {
      setShowPasswordForm(false); 
    }

    try {
      await signInMagicLink(email);
      setShowMagicModal(true);
    } catch (error) {
      console.error("Magic link sign-in error:", error);
      setErrorMessage(error.message);
    }
  };

  const SignInButton = ({ text, icon, onClick, rotateIcon }) => (
    <button className="button" onClick={onClick}>
      <MdOutlineKeyboardArrowRight
        className={`arrow-icon ${rotateIcon ? "rotate" : ""}`}
      />
      <div className="passkey-icon-container">{icon}</div>
      <span>{text}</span>
    </button>
  );

  const MagicModal = () => (
    <>
      <div className="modal-backdrop" />
      <div className="modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center">
            <img
              src={emailImg}
              alt="Email"
              className="img-fluid"
              style={{ width: "9rem", height: "9rem" }}
            />
            <h2 className="card-title mb-3">An email is on its way!</h2>
            <p className="card-text text-muted mb-4">
              We sent an email to <strong>{email}</strong>.<br />
              <br />
              If this email address has an account on{" "}
              <strong>piranhaplanner.online</strong>, you'll find a magic link
              that will allow you to sign in to the application.
            </p>
            <button className="btn btn-link" onClick={closeMagicModal}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="container-password">
        <button onClick={handleBackClick} className="back-button">
          <IoIosArrowRoundBack className="back-icon" />
          Back
        </button>
        <div className="button-container">
          <div className="button-passkey-password">
            <SignInButton
              text="Sign in with Magic Link"
              icon={<ImMagicWand className="passkey-icon" />}
              onClick={handleMagicSignIn}
            />
          </div>

          <div className="button-passkey-password">
            <SignInButton
              text="Sign in with Password"
              icon={<FaKey className="passkey-icon" />}
              onClick={togglePasswordForm}
              rotateIcon={showPasswordForm}
            />
            {showPasswordForm && (
              <form
                className={`signin-form-password ${
                  showPasswordForm ? "show" : ""
                }`}
                onSubmit={handleSignIn}
              >
                <input
                  className="password-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleOnChange}
                  required
                />
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <button type="submit" className="submit-button-password">
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="forgot-password-container">
          <a className="forgot-password">Forgot password?</a>
        </div>
      </div>
      {showMagicModal && <MagicModal />}
    </>
  );
}

export { PasswordLogin };
