import React from "react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Mail, Loader2, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function LinkingOptionsDialog({
  open,
  onOpenChange,
  linkWithEmail,
  linkWithGoogle,
  linkWithFacebook,
  isProcessing,
  urlError,
}) {
  const [linkingMethod, setLinkingMethod] = useState(null);
  const [linkingEmail, setLinkingEmail] = useState("");
  const [linkingError, setLinkingError] = useState(null);

  useEffect(() => {
    if (open && urlError) {
      setLinkingError(urlError);
    }
  }, [open, urlError]);

  const handleLinkingSubmit = async () => {
    setLinkingError(null);
    try {
      switch (linkingMethod) {
        case "email":
          await linkWithEmail(linkingEmail);
          break;
        case "google":
          await linkWithGoogle();
          break;
        case "facebook":
          await linkWithFacebook();
          break;
      }
      onOpenChange(false);
      setLinkingMethod(null);
      setLinkingEmail("");
    } catch (error) {
      setLinkingError(
        error.message || "An unexpected error occurred during linking."
      );
    }
  };

  const resetForm = () => {
    setLinkingMethod(null);
    setLinkingEmail("");
    setLinkingError(null);
  };

  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open) {
      resetForm();
    }
  };

  const handleLinkingMethodChange = (method) => {
    setLinkingMethod(method);
    setLinkingError(null);
    setLinkingEmail("");
  };

  const providers = [
    { id: 1, name: "Google", icon: <FcGoogle />, method: "google" },
    {
      id: 2,
      name: "Facebook",
      icon: <FaFacebook color="#4267B2" />,
      method: "facebook",
    },
    {
      id: 3,
      name: "Email",
      icon: <Mail className="mr-2 h-4 w-4" />,
      method: "email",
    },
  ];

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose how you want to link your account to keep your data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {linkingError && (
            <div className="text-red-500 text-sm p-3 border border-red-300 rounded-md bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="whitespace-pre-line">{linkingError}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkingError(null)}
                  className="text-red-500 hover:text-red-700 ml-2 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {!linkingMethod && (
            <div className="grid gap-3">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  onClick={() => handleLinkingMethodChange(provider.method)}
                  className="w-full justify-start"
                >
                  <span className="mr-2 text-xl">{provider.icon}</span>
                  Link with {provider.name}
                </Button>
              ))}
            </div>
          )}

          {linkingMethod === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={linkingEmail.email}
                  onChange={(e) => setLinkingEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLinkingMethod(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleLinkingSubmit}
                  disabled={!linkingEmail || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Link"
                  )}
                </Button>
              </div>
            </div>
          )}

          {(linkingMethod === "google" || linkingMethod === "facebook") && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You will be redirected to complete the linking with{" "}
                {linkingMethod === "google" ? "Google" : "Facebook"}.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLinkingMethod(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleLinkingSubmit}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LinkingOptionsDialog;
