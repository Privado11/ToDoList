import React, { useEffect, useState } from "react";
import { useAuth, useProfileContext } from "@/context";

function CompleteProfilePage() {
  const { signOutLocal } = useAuth();
  const { completeProfile } = useProfileContext();


  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    photoPreview: null,
    showPassword: false,
    showConfirmPassword: false,
    isSubmitting: false,
    errorMessage: "",
    photoError: "",
    passwordError: "",
    passwordRequirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      digit: false,
      symbol: false,
    },
  });

  useEffect(() => {
    const { password, confirmPassword } = formData;

    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    let passwordError = "";
    if (confirmPassword && password !== confirmPassword) {
      passwordError = "Passwords do not match";
    }

    setFormData((prev) => ({
      ...prev,
      passwordRequirements: requirements,
      passwordError,
    }));
  }, [formData.password, formData.confirmPassword]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const allRequirementsMet = Object.values(formData.passwordRequirements).every(
    Boolean
  );
  const isFormValid =
    formData.fullName.trim() &&
    allRequirementsMet &&
    !formData.passwordError &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    setFormData((prev) => ({ ...prev, photoError: "" }));

    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setFormData((prev) => ({
          ...prev,
          photoError: "Please select a JPG, PNG, or WEBP image only",
          profilePhoto: null,
          photoPreview: null,
        }));
        e.target.value = null;
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setFormData((prev) => ({
          ...prev,
          photoError: "Image size should not exceed 5MB",
          profilePhoto: null,
          photoPreview: null,
        }));
        e.target.value = null;
        return;
      }

      setFormData((prev) => ({ ...prev, profilePhoto: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoPreview: reader.result }));
      };
      reader.onerror = () => {
        setFormData((prev) => ({
          ...prev,
          photoError: "Error reading file. Please try again.",
          profilePhoto: null,
          photoPreview: null,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setFormData((prev) => ({ ...prev, errorMessage: "", isSubmitting: true }));

    try {
      await completeProfile(
        formData.fullName.trim(),
        formData.password,
        formData.profilePhoto
      );
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        errorMessage: "Error completing profile, please try again.",
      }));
      console.error("Error completing profile:", error);
    } finally {
      setFormData((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleCancel = async () => {
    await signOutLocal();
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 md:p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 relative group">
            <label htmlFor="photo-upload" className="cursor-pointer block">
              {formData.photoPreview ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200">
                  <img
                    src={formData.photoPreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border-2 border-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                className="sr-only"
                accept="image/jpeg, image/png, image/webp"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          <h1 className="text-2xl font-semibold text-slate-700">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Please provide your full name and create a secure password
          </p>
          {formData.photoError ? (
            <p className="mt-2 text-xs text-red-500">{formData.photoError}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Click on the avatar to upload a photo
            </p>
          )}
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
              value={formData.fullName}
              onChange={(e) => updateFormData("fullName", e.target.value)}
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
            <div className="relative">
              <input
                type={formData.showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("showPassword")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
              >
                {formData.showPassword ? (
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
                  "At least 6 characters": formData.passwordRequirements.length,
                  "At least one uppercase letter":
                    formData.passwordRequirements.uppercase,
                  "At least one lowercase letter":
                    formData.passwordRequirements.lowercase,
                  "At least one digit": formData.passwordRequirements.digit,
                  "At least one symbol (e.g., !@#$%)":
                    formData.passwordRequirements.symbol,
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
                type={formData.showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  updateFormData("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all pr-10 ${
                  formData.passwordError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300 focus:ring-sky-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("showConfirmPassword")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
              >
                {formData.showConfirmPassword ? (
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
            {formData.passwordError && (
              <p className="mt-1 text-xs text-red-500 transition-all">
                {formData.passwordError}
              </p>
            )}
          </div>

          {formData.errorMessage && (
            <p className="mt-2 text-sm text-red-500">{formData.errorMessage}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-all"
            >
              Cancel registration
            </button>
            <button
              type="submit"
              disabled={!isFormValid || formData.isSubmitting}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-all ${
                isFormValid && !formData.isSubmitting
                  ? "bg-sky-500 hover:bg-sky-600 cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              {formData.isSubmitting ? "Processing..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfilePage;
