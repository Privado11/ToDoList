import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../../assets/logo-piranha.webp";
import { useAuth } from "@/context/AuthContext";

function CompleteProfilePage() {
  const { completeProfile } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const isFormValid =
    fullName && allRequirementsMet && !passwordError && confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await completeProfile(fullName, password);
      console.log("Profile completed");
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
    } finally {
      setIsSubmitting(false);
    }
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

          <h1 className="text-2xl font-semibold text-slate-700">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Please provide your full name and create a secure password
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              required
            />

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
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-300 focus:ring-sky-500"
              }`}
              required
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500 transition-all">
                {passwordError}
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
            {isSubmitting ? "Processing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfilePage;
