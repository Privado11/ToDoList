import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logoImg from "../../../../assets/logo-piranha.webp";

function ResetPassword() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    symbol: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });

    if (confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  }, [password, confirmPassword]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const isFormValid = allRequirementsMet && !passwordError && confirmPassword;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;
    setErrorMessage("");

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      console.log("Password updated successfully");
      setIsSuccess(true);

    } catch (error) {
      setErrorMessage("Error updating password. Please try again.");
      console.error("Error updating password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
 
    await signOut();

    navigate("/login");
  };

  
  const SuccessMessage = () => (
    <div className="text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-slate-700">
        Password updated!
      </h2>
      <p className="text-slate-500">
        Your password has been successfully updated. You can now log in with
        your new password.
      </p>

      <button
        onClick={handleSignIn}
        className="mt-6 w-full rounded-md px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all"
      >
        Login
      </button>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 md:p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4">
            <img
              src={logoImg}
              alt="Piranha Planner Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {!isSuccess && (
            <>
              <h1 className="text-2xl font-semibold text-slate-700">
                Reset Your Password
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Please create a new secure password for your account
              </p>
            </>
          )}
        </div>

        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Password requirements:
                </p>
                <ul className="space-y-1 text-xs">
                  {Object.entries({
                    "At least 6 characters": passwordRequirements.length,
                    "At least one uppercase letter":
                      passwordRequirements.uppercase,
                    "At least one lowercase letter":
                      passwordRequirements.lowercase,
                    "At least one digit": passwordRequirements.digit,
                    "At least one symbol (e.g., !@#$%)":
                      passwordRequirements.symbol,
                  }).map(([text, met]) => (
                    <li
                      key={text}
                      className={`flex items-center transition-colors duration-300 ${
                        met ? "text-green-600" : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 mr-2 rounded-full ${
                          met
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {met ? "✓" : "○"}
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all pr-10 ${
                    passwordError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-300 focus:ring-sky-500"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-500 transition-all">
                  {passwordError}
                </p>
              )}
              {errorMessage && (
                <p className="mt-1 text-xs text-red-500 transition-all">
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`mt-4 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition-all ${
                isFormValid && !isSubmitting
                  ? "bg-sky-500 hover:bg-sky-600 cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
