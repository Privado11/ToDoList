import React, { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import logoImg from "../../../../assets/logo-piranha.webp";
import { useAuth } from "@/context/AuthContext";
import MagicLinkModal from "../SignIn/MagicLinkModal";

function PasswordReset() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(location.state?.email || "");
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(email);
      setShowMagicModal(true);
    } catch (error) {
      console.error("Password reset error.", error);
    }
  };

  const handleBackClick = () => {
    navigate("/login");
  };

  const closeMagicModal = () => {
    setShowMagicModal(false);
    setResendMessage("");
  };

  const handleResendMagicLink = async () => {
    setIsResending(true);
    setResendMessage("");
    try {
      await signInWithMagicLink(email);
      setResendMessage("Magic link resent successfully!");
    } catch (error) {
      console.error("Error resending magic link:", error);
      setErrorMessage(error.message || "Failed to resend magic link");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full p-8 overflow-hidden">
      <div className="w-96 h-full flex flex-col justify-center">
        <div className="text-left">
          <div className="w-28 h-28 flex items-center justify-center mx-auto mb-8">
            <img
              src={logoImg}
              alt="Piranha Planner Logo"
              className="w-28 h-28 object-contain rounded-full"
            />
          </div>
          <h1 className="text-3xl font-semibold text-slate-600 mb-2 mt-0">
            Reset Password
          </h1>
          <button
            className="flex items-center h-3 mt-4 text-sm font-medium text-slate-600"
            onClick={handleBackClick}
            type="button"
          >
            <IoIosArrowRoundBack className="mr-2 h-[1.6rem] w-[1.6rem] text-sm text-[#5c6f8a] my-8" />
            Back to Login
          </button>
        </div>

        <form className="text-left mt-4" onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="text-base font-medium leading-8 text-[#5C6F8A]"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-2 h-10 w-full rounded-md border border-[#5C6F8A] px-4 py-2 text-sm font-normal text-[#5C6F8A] outline-none"
          />
          {errorMessage && (
            <div className="mb-4 text-sm text-red-500">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-md border border-[#3FA6F0] bg-[#3FA6F0] px-4 py-2.5 text-sm font-medium text-white"
          >
            Reset Password
          </button>
        </form>
      </div>
      {showMagicModal && (
        <MagicLinkModal
          email={email}
          onClose={closeMagicModal}
          onResend={handleResendMagicLink}
          isResending={isResending}
          mode="reset"
          open={showMagicModal}
          message={resendMessage}
        />
      )}
    </div>
  );
}

export default PasswordReset;
