import React, { useEffect, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

function MagicLinkModal({ email, onClose, onResend, isResending }) {
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResend = () => {
    onResend();
    setResendTimer(30);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">An email is on its way!</h2>
          <p className="text-gray-600">
            We have sent an email to{" "}
            <span className="font-semibold">{email}</span> with a magic link
            that will allow you to log in to the application.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500 mb-6 text-center">
            Don't forget to check your spam folder if you can't find the email.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className={`w-full py-2 px-4 rounded-md text-center transition-colors ${
                resendTimer > 0 || isResending
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isResending
                ? "Resending..."
                : resendTimer > 0
                ? `Resend link (${resendTimer}s)`
                : "Resend link"}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MagicLinkModal;
