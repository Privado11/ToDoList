import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaUserSecret } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { cn } from "@/lib/utils";

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
    signInWithPhone,
    checkEmail,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (provider) => {
    setLoading(true);
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
      navigate("/");
    } catch (error) {
      setErrorMessage("Error signing in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const isRegistered = await checkEmail(email);

      if (isRegistered) {
        changeToPasswordScreen(email);
      } else {
        setEmailError("Email not registered. Would you like to sign up?");
      }
    } catch (error) {
      setErrorMessage("Error checking email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setErrorMessage("");
  };

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className="flex w-full items-center justify-center rounded-md border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
          onClick={() => handleSignIn(provider)}
          disabled={loading}
        >
          <span className="mr-2 text-xl">{provider.icon}</span>
          Sign In {provider.id !== 3 ? "With" : "As"} {provider.name}
        </button>
      ))}

      <div className="relative flex items-center justify-center my-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="relative px-4 text-sm font-medium text-slate-500 bg-white">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
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
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
          {errorMessage && (
            <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-all"
          disabled={loading}
        >
          {loading ? "Loading..." : "Next"}
        </button>
      </form>

      <div className="mt-4 w-full text-center">
        <span className="text-xs text-slate-500">
          Need an account?{" "}
          <span
            onClick={() => navigate("/signup")}
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
