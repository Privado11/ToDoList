import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const PasswordSettings = ({ updatePassword, userLoading }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    symbol: false,
  });

  useEffect(() => {
    const { newPassword, confirmPassword } = passwordForm;

    setPasswordRequirements({
      length: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      digit: /\d/.test(newPassword),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });

    if (confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  }, [passwordForm.newPassword, passwordForm.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIsPasswordChanged(null);
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const isFormValid =
    passwordForm.currentPassword &&
    allRequirementsMet &&
    !passwordError &&
    passwordForm.confirmPassword;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = async () => {
    if (!isFormValid) return;

    setIsPasswordChanged(null);

    try {
      const result = await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setIsPasswordChanged(result);

      resetPasswordForm();
    } catch (error) {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
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

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handleInputChange}
                className={`pr-10 ${
                  passwordError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300 focus:ring-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-500 transition-all">
                {passwordError}
              </p>
            )}
            {isPasswordChanged?.success === true && (
              <p className="mt-1 text-xs text-green-500 transition-all">
                {isPasswordChanged.message}
              </p>
            )}
            {isPasswordChanged?.success === false && (
              <p className="mt-1 text-xs text-red-500 transition-all">
                {isPasswordChanged.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handlePasswordChange}
            disabled={!isFormValid || userLoading.updatePassword}
            className={`${
              isFormValid && !userLoading.updatePassword
                ? "bg-sky-500 hover:bg-sky-600 cursor-pointer"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {userLoading.updatePassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordSettings;
