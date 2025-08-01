import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AnonymousWarningDialog, LinkingOptionsDialog } from "../UserMenu";

const AccountSettings = ({
  user,
  signOut,
  linkWithEmailPassword,
  linkWithGoogle,
  linkWithFacebook,
  isProcessing,
}) => {
  const [showAnonymousWarning, setShowAnonymousWarning] = useState(false);
  const [showLinkingOptions, setShowLinkingOptions] = useState(false);

  const isAnonymous = user?.is_anonymous || false;

  const handleLogout = () => {
    if (isAnonymous) {
      resetAllDialogs();
      setShowAnonymousWarning(true);
    } else {
      signOut();
      toast.success("You have been logged out successfully.", {
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleDeleteAccount = () => {};

  const resetAllDialogs = () => {
    setShowAnonymousWarning(false);
    setShowLinkingOptions(false);
    setShowLinkingOptions(null);
  };

  const handleLinkAccount = () => {
    resetAllDialogs();
    setShowLinkingOptions(true);
  };

  const handleConfirmLogout = () => {
    resetAllDialogs();
    signOutLocal();
  };

  const handleAnonymousWarningClose = (open) => {
    if (!open) {
      resetAllDialogs();
    }
  };

  const handleLinkingOptionsClose = (open) => {
    if (!open) {
      resetAllDialogs();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account and session.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Session</h3>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              You will be logged out of all devices and need to sign in again.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-3 text-destructive">
              Danger Zone
            </h3>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting your account is permanent and cannot be undone. All
                your data, tasks, and connections will be lost forever.
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>

      <AnonymousWarningDialog
        open={showAnonymousWarning}
        onOpenChange={handleAnonymousWarningClose}
        onLinkAccount={handleLinkAccount}
        onConfirmLogout={handleConfirmLogout}
      />

      <LinkingOptionsDialog
        open={showLinkingOptions}
        onOpenChange={handleLinkingOptionsClose}
        linkWithEmailPassword={linkWithEmailPassword}
        linkWithGoogle={linkWithGoogle}
        linkWithFacebook={linkWithFacebook}
        isProcessing={isProcessing}
      />
    </Card>
  );
};

export default AccountSettings;
