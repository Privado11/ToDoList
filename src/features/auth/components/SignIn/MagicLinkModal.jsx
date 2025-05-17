import { useEffect, useState } from "react";
import { ArrowLeft, Mail, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MagicLinkModal({
  email,
  onClose,
  onResend,
  isResending,
  mode = "login",
  open,
  message,
}) {
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (!open) return;

    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, open]);

  const handleResend = () => {
    onResend();
    setResendTimer(30);
  };

  const content = {
    register: {
      icon: <UserCheck className="h-8 w-8 text-blue-600" />,
      iconBgColor: "bg-blue-50",
      title: "Registration Started!",
      description: `We've sent an email to ${email}. Please check your inbox and click the confirmation link to complete your registration.`,
      backButtonText: "Back to Sign Up",
      accentColor: "blue",
    },
    login: {
      icon: <Mail className="h-8 w-8 text-blue-600" />,
      iconBgColor: "bg-blue-50",
      title: "Magic Link Sent!",
      description: `We've sent an email to ${email} with a magic link that will allow you to log in to the application.`,
      backButtonText: "Back to Login",
      accentColor: "blue",
    },
    reset: {
      icon: <Mail className="h-8 w-8 text-blue-600" />,
      iconBgColor: "bg-blue-50",
      title: "Password reset link sent!",
      description: `We've sent an email to ${email} with a link to reset your password.`,
      backButtonText: "Back to Login",
      accentColor: "blue",
    },
  };

  const currentContent = content[mode] || content.login;
  const accentColor = currentContent.accentColor;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
       
        <DialogTitle className="sr-only">{currentContent.title}</DialogTitle>

     
        <DialogDescription className="sr-only">
          {currentContent.description}
        </DialogDescription>

        <div className="p-6 pb-0">
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                currentContent.iconBgColor
              )}
            >
              {currentContent.icon}
            </div>

            <div className="space-y-2">
             
              <h2 className="text-2xl font-bold tracking-tight">
                {currentContent.title}
              </h2>
              <p className="text-muted-foreground">
                {currentContent.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4">
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Don't forget to check your spam folder if you can't find the
              email.
            </p>

           
            {message && (
              <div className="py-2 px-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-center text-sm">
                {message}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className={cn(
                  "w-full",
                  accentColor === "blue"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isResending
                  ? "Resending..."
                  : resendTimer > 0
                  ? `Resend link (${resendTimer}s)`
                  : "Resend link"}
              </Button>

              <Button onClick={onClose} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentContent.backButtonText}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MagicLinkModal;
