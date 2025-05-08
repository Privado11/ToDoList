import React, { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import logoImg from "../../../../assets/logo-piranha.webp";
import { useAuth } from "@/context/AuthContext";

function PasswordReset() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 

  useEffect(() => {
    setEmail(location.state?.email || "");
  }, [location]);

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email.");
      return;
    } else {
      setEmailError("");
    }

    try {
      await resetPassword(email);
      setSuccessMessage("A reset link has been sent to your email!"); 
      setTimeout(() => {
        navigate("/");
      }, 3000); 
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const handleBackClick = () => {
    navigate("/login");
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
          >
            <IoIosArrowRoundBack className="back-icon" />
            Back
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
          {emailError && (
            <div className="mb-4 text-sm text-red-500">{emailError}</div>
          )}
          {successMessage && (
            <div className="mb-4 text-sm text-green-500">{successMessage}</div>
          )}
          <button
            type="submit"
            className="mt-2 w-full rounded-md border border-[#3FA6F0] bg-[#3FA6F0] px-4 py-2.5 text-sm font-medium text-white"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset;
