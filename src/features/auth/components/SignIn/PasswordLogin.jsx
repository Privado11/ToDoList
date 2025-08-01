import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaKey } from "react-icons/fa";
import { ImMagicWand } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MagicLinkModal from "./MagicLinkModal";

function PasswordLogin({ changeToPasswordScreen, email }) {
  const { signInWithEmail, signInWithMagicLink, isProcessing } = useAuth();
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [errorMessagePassword, setErrorMessagePassword] = useState("");
  const [errorMessageMagic, setErrorMessageMagic] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const navigate = useNavigate();

  const handleBackClick = () => changeToPasswordScreen();

  const handleOnChange = (e) => {
    setPassword(e.target.value);
    // Solo limpia el error si hay texto en el campo
    if (e.target.value.length > 0) {
      setErrorMessagePassword("");
    }
  };

  const togglePasswordForm = () => {
    setErrorMessageMagic("");
    setShowPasswordForm((prev) => !prev);
    if (showPasswordForm) {
      setPassword("");
      setErrorMessagePassword("");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    // Limpiar error previo
    setErrorMessagePassword("");

    try {
      const result = await signInWithEmail(email, password);

      // Check if the result indicates success or failure
      if (result && result.error) {
        setErrorMessagePassword("Incorrect password. Please try again.");
        return;
      }

      // If we get here, login was successful
      console.log("Login successful");
    } catch (error) {
      console.error("Authentication error:", error);

      // Handle different types of errors
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" ||
        error.message?.includes("password") ||
        error.message?.includes("credential")
      ) {
        setErrorMessagePassword("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMessagePassword("No account found with this email.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessagePassword(
          "Too many failed attempts. Please try again later."
        );
      } else {
        setErrorMessagePassword("Failed to sign in. Please try again.");
      }
    }
  };

  const closeMagicModal = () => {
    setShowMagicModal(false);
    setResendMessage("");
  };

  const handleMagicSignIn = async (e) => {
    e.preventDefault();
    if (showPasswordForm) {
      setShowPasswordForm(false);
    }

    setErrorMessageMagic("");
    try {
      await signInWithMagicLink(email);
      setShowMagicModal(true);
    } catch (error) {
      setErrorMessageMagic("Failed to send magic link. Please try again.");
    }
  };

  const handleResendMagicLink = async () => {
    setIsResending(true);
    setResendMessage("");
    try {
      await signInWithMagicLink(email);
      setResendMessage("Magic link resent successfully!");
    } catch (error) {
      setResendMessage("Failed to resend magic link. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const SignInButton = ({ text, icon, onClick, rotateIcon }) => (
    <button
      className="flex items-center justify-start gap-2 py-2 pl-2 pr-12 cursor-pointer relative"
      onClick={onClick}
    >
      <ChevronRight
        className={`absolute right-6 text-slate-400 text-base transition-all duration-300 ease-in-out ${
          rotateIcon ? "rotate-90" : ""
        }`}
      />
      <div className="inline-flex self-start p-2 rounded-lg bg-sky-50 text-sky-500 w-8 h-8">
        {icon}
      </div>
      <span className="text-base leading-8 text-slate-500 font-normal">
        {text}
      </span>
    </button>
  );

  return (
    <>
      <button
        className="flex items-center h-3 mt-4 text-sm font-medium text-slate-600"
        onClick={handleBackClick}
        type="button"
      >
        <IoIosArrowRoundBack className="mr-2 h-[1.6rem] w-[1.6rem] text-sm text-[#5c6f8a] my-8" />
        Back
      </button>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col p-0 relative overflow-hidden box-border rounded-lg border border-slate-400">
          <SignInButton
            text="Sign in with Magic Link"
            icon={<ImMagicWand className="passkey-icon" />}
            onClick={handleMagicSignIn}
          />
        </div>
        <div className="flex flex-col p-0 relative overflow-hidden box-border rounded-lg border border-slate-400">
          <SignInButton
            text="Sign in with Password"
            icon={<FaKey className="passkey-icon" />}
            onClick={togglePasswordForm}
            rotateIcon={showPasswordForm}
          />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showPasswordForm ? "max-h-64" : "max-h-0"
            }`}
          >
            <form
              className="px-4 pb-4 flex flex-col gap-4"
              onSubmit={handleSignIn}
            >
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  showPasswordForm
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-8 opacity-0"
                }`}
              >
                <input
                  className="mt-2 h-10 w-full rounded-md border border-[#5C6F8A] px-4 py-2 text-base font-normal text-[#5C6F8A] outline-none"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleOnChange}
                  required
                />
              </div>

              {errorMessagePassword && (
                <div
                  className={`text-sm text-red-500 transition-all duration-500 ease-in-out ${
                    showPasswordForm ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {errorMessagePassword}
                </div>
              )}

              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  showPasswordForm
                    ? "translate-y-0 opacity-100 delay-100"
                    : "-translate-y-8 opacity-0"
                }`}
              >
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-sky-500 text-white border border-sky-500 rounded cursor-pointer text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {errorMessageMagic && (
        <div className="mb-4 text-sm text-red-500">{errorMessageMagic}</div>
      )}

      <div className="w-full text-center text-[12px] text-[#5c6f8a] font-light mt-4">
        <span
          onClick={() => navigate("/password-reset", { state: { email } })}
          className="ml-0.5 cursor-pointer text-sm font-medium text-[#6E829E] hover:underline"
        >
          Forgot password?
        </span>
      </div>

      {showMagicModal && (
        <MagicLinkModal
          email={email}
          onClose={closeMagicModal}
          onResend={handleResendMagicLink}
          isResending={isResending}
          open={showMagicModal}
          message={resendMessage}
        />
      )}
    </>
  );
}

export default PasswordLogin;
