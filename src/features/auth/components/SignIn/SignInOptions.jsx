import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaUserSecret } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const providers = [
  { id: 1, name: "Google", icon: <FcGoogle /> },
  { id: 2, name: "Facebook", icon: <FaFacebook color="#4267B2" /> },
  { id: 3, name: "Guest", icon: <FaUserSecret /> },
];

function SignInOptions({ changeToPasswordScreen }) {
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInAsGuest,
    resendEmailSignUp,
    checkEmail,
    isProcessing,
  } = useAuth();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";
  const [email, setEmail] = useState(prefilledEmail);
  const [emailError, setEmailError] = useState("");
  const [emailResend, setEmailResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (provider) => {
    if (isProcessing) return;

    try {
      switch (provider.id) {
        case 1:
          await signInWithGoogle();
          break;
        case 2:
          await signInWithFacebook();
          break;
        case 3:
          await signInAsGuest();
          break;
        default:
          throw new Error("Unknown provider");
      }
    } catch (error) {
      setErrorMessage("Error signing in: " + error.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setNeedsVerification(false);

    try {
      const result = await checkEmail(email);

      if (result.user_exists) {
        if (result.email_verified) {
          changeToPasswordScreen(email);
        } else {
          setNeedsVerification(true);
        }
      } else {
        setEmailError("Email not registered. Would you like to sign up?");
      }
    } catch (error) {
      setErrorMessage("Error checking email: " + error.message);
    } 
  };

  const handleResendVerification = async () => {
    if (isProcessing) return;

    try {
      await resendEmailSignUp(email);
      setEmailResend("Verification email sent. Please check your inbox.");
      setNeedsVerification(false);
      setEmailError("");
    } catch (error) {
      setErrorMessage("Error sending verification email: " + error.message);
    }
  };

  const handleOnChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setErrorMessage("");
    setNeedsVerification(false);
  };

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className="flex w-full items-center justify-center rounded-md border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
          onClick={() => handleSignIn(provider)}
          disabled={isProcessing}
        >
          <span className="mr-2 text-2xl">{provider.icon}</span>
          Sign In {provider.id !== 3 ? "With" : "As"} {provider.name}
        </button>
      ))}

      <div className="relative flex items-center justify-center my-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="relative px-4 text-base font-medium text-slate-500 bg-white">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-base font-medium text-slate-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={handleOnChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
          {errorMessage && (
            <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
          )}
          {emailResend && (
            <p className="mt-1 text-sm text-green-500">{emailResend}</p>
          )}

          {needsVerification && (
            <div className="mt-2">
              <p className="text-sm text-amber-600 mb-1">
                Your email is not verified yet. Please check your inbox or
                request a new verification email.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm font-medium text-sky-600 hover:text-sky-800"
                disabled={isProcessing}
              >
                Resend verification email
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-all"
          disabled={isProcessing}
        >
          {isProcessing ? "Loading..." : "Next"}
        </button>
      </form>

      <div className="mt-4 w-full text-center">
        <span className="text-sm text-slate-500">
          Need an account?{" "}
          <span
            onClick={() => navigate("/signup", { state: { email } })}
            className="ml-0.5 cursor-pointer font-medium text-slate-700 hover:underline"
          >
            Sign Up
          </span>
        </span>
      </div>
    </div>
  );
}

export default SignInOptions;
