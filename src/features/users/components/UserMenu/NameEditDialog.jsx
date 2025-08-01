import React from "react";
import { useState } from "react";
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
import { User, Loader2, X } from "lucide-react";

function NameEditDialog({
  open,
  onOpenChange,
  onSaveName,
  isProcessing = false,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      await onSaveName(name.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving name:", error);
      setError(
        error.message || "An unexpected error occurred while saving your name."
      );
    }
  };

  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open) {
      setName(currentName);
      setError(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isProcessing && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="flex justify-end"></div>

        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            What's your name?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please enter your name so we can personalize your experience.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-3 border border-red-300 rounded-md bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p>{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 ml-2 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="flex">
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NameEditDialog;
