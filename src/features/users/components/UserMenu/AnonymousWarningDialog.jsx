import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function AnonymousWarningDialog({
  open,
  onOpenChange,
  onLinkAccount,
  onConfirmLogout,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="flex justify-end">
          <AlertDialogCancel variant="outline" className="w-auto">
            <X className="h-4 w-4" />
          </AlertDialogCancel>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Warning!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-2">
            You are using a guest account. If you log out without linking your
            account,
            <strong className="text-red-600">
              {" "}
              you will lose all registered data
            </strong>
            .
            <br /> <br />
            To keep your data, please link your account with a permanent
            authentication method.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onLinkAccount}
            className="w-full bg-blue-600 hover:bg-blue-700 "
          >
            Link Account
          </Button>
          <AlertDialogAction
            onClick={onConfirmLogout}
            className="w-full bg-red-600 hover:bg-red-700 "
          >
            Log Out (Lose Data)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AnonymousWarningDialog;
