import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import logoImg from "../../../../assets/logo-piranha.webp";
import { useAuth } from "@/context";

const providers = [
  { id: 1, name: "Google", icon: <FcGoogle /> },
  { id: 2, name: "Facebook", icon: <FaFacebook color="#4267B2" /> },
];

function SignUp() {
  const { signInWithGoogle, signInWithFacebook, signUpWithEmail } = useAuth();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";
  const [email, setEmail] = useState(prefilledEmail);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignUp = async (provider) => {
    try {
      if (provider.id === 1) {
        await signInWithGoogle();
      } else if (provider.id === 2) {
        await signInWithFacebook();
      }
      navigate("/");
    } catch (error) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signUpWithEmail(email);
    } catch (error) {
      if (error.message && error.message.includes("already registered")) {
        setEmailError(
          "This email is already registered. Please sign in instead."
        );
      } else {
        setEmailError("Sign up failed. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/login");
  };

  const handleSignInRedirect = () => {
    navigate("/login", { state: { email } });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 md:p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img
              src={logoImg}
              alt="Piranha Planner Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h1 className="text-3xl font-semibold text-slate-700">Sign Up</h1>
          <button
            className="flex items-center text-sm font-medium text-slate-600 mx-auto mt-2"
            onClick={handleBackClick}
          >
            <IoIosArrowRoundBack className="mr-1 h-5 w-5 text-slate-600" />
            Back to Login
          </button>
        </div>

        <div className="space-y-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              className="flex w-full items-center justify-center rounded-md border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
              onClick={() => handleSignUp(provider)}
            >
              <span className="mr-2 text-2xl">{provider.icon}</span>
              Sign Up With {provider.name}
            </button>
          ))}

          <div className="relative flex items-center justify-center my-4">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="relative px-4 text-bas font-medium text-slate-500 bg-white">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                onChange={handleEmailChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
              {emailError && (
                <div className="mt-2">
                  <p className="text-sm text-red-500">{emailError}</p>
                  {emailError.includes("already registered") && (
                    <button
                      type="button"
                      onClick={handleSignInRedirect}
                      className="text-sm text-sky-600 font-medium mt-1 hover:text-sky-700"
                    >
                      Go to sign in page
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-1 w-full text-left">
              <span className="text-xs text-slate-500">
                By entering your email to sign up, you agree to our Terms and to
                receive service-related emails from us.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-600"
              } transition-all`}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
