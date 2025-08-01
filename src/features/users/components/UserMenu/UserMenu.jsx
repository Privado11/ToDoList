import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, Loader2, Link } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AnonymousWarningDialog,
  LinkingOptionsDialog,
  NameEditDialog,
} from ".";
import { usePopover } from "@/context";

function UserMenu({
  user,
  signOutLocal,
  userLoading,
  linkWithEmail,
  linkWithGoogle,
  linkWithFacebook,
  isProcessing,
  updateFullName,
}) {
  const navigate = useNavigate();
  const { closePopover } = usePopover();
  const [showAnonymousWarning, setShowAnonymousWarning] = useState(false);
  const [showLinkingOptions, setShowLinkingOptions] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const location = useLocation();

  const nameRequried = user?.full_name === "[NAME_REQUIRED]";

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get("error");
    const errorCode = urlParams.get("error_code");
    const errorDescription = urlParams.get("error_description");

    if (error || errorCode || errorDescription) {
      let message = "An unknown error occurred.";

      if (errorDescription) {
        message = decodeURIComponent(errorDescription.replace(/\+/g, " "));
      } else if (error) {
        message = decodeURIComponent(error.replace(/\+/g, " "));
      }

      if (errorCode === "identity_already_exists") {
        message =
          "This social account is already linked to another user.\nPlease try logging in with it directly or link a different account.";
      }

      setErrorMessage(message);
      setShowLinkingOptions(true);

      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete("error");
      newSearchParams.delete("error_code");
      newSearchParams.delete("error_description");

      navigate(
        {
          pathname: location.pathname,
          search: newSearchParams.toString(),
        },
        { replace: true }
      );
    }
  }, [location.search, location.pathname, navigate]);

  useEffect(() => {
    if (nameRequried) {
      setNameDialogOpen(true);
    }
  }, [nameRequried]);

  const resetAllDialogs = () => {
    setShowAnonymousWarning(false);
    setShowLinkingOptions(false);
    setShowLinkingOptions(null);
  };

  const handleLogout = () => {
    if (isAnonymous) {
      resetAllDialogs();
      setShowAnonymousWarning(true);
    } else {
      signOutLocal();
      closePopover();
    }
  };

  const handleLinkAccount = () => {
    resetAllDialogs();
    setShowLinkingOptions(true);
  };

  const handleConfirmLogout = () => {
    resetAllDialogs();
    signOutLocal();
    closePopover();
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

  const username = user?.username?.replace("@", "");
  const isAnonymous = user?.is_anonymous === true;

  const handleProfileClick = () => {
    closePopover();
    navigate(`${username}`);
  };

  const handleSettingsClick = () => {
    closePopover();
    navigate("/settings");
  };

  const getUserInitials = () => {
    if (!user || !user.full_name) return isAnonymous ? "G" : "US";
    return user.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarBackgroundColor = React.useMemo(() => {
    if (isAnonymous) return "#9CA3AF";
    if (!user?.full_name) return "#6E56CF";

    let hash = 0;
    for (let i = 0; i < user.full_name.length; i++) {
      hash = user.full_name.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }, [user?.full_name, isAnonymous]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 rounded-full p-0"
          >
            <Avatar className="!h-12 !w-12">
              <AvatarImage
                src={user?.avatar_url}
                alt={user?.full_name}
                className={`transition-all duration-200 ${
                  userLoading.updateProfilePicture ||
                  userLoading.deleteOldAvatar
                    ? "opacity-50"
                    : "opacity-100"
                }`}
              />
              <AvatarFallback
                style={{
                  backgroundColor: avatarBackgroundColor,
                  color: "white",
                }}
              >
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {(userLoading.updateProfilePicture ||
              userLoading.deleteOldAvatar) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                <div className="bg-white/90 rounded-full p-2 shadow-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.full_name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAnonymous && (
            <>
              <DropdownMenuItem
                onClick={handleLinkAccount}
                className="cursor-pointer text-blue-600"
              >
                <Link className="mr-2 h-4 w-4" />
                Link Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSettingsClick}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AnonymousWarningDialog
        open={showAnonymousWarning}
        onOpenChange={handleAnonymousWarningClose}
        onLinkAccount={handleLinkAccount}
        onConfirmLogout={handleConfirmLogout}
      />

      <LinkingOptionsDialog
        open={showLinkingOptions}
        onOpenChange={handleLinkingOptionsClose}
        linkWithEmail={linkWithEmail}
        linkWithGoogle={linkWithGoogle}
        linkWithFacebook={linkWithFacebook}
        isProcessing={isProcessing}
        urlError={errorMessage}
      />

      <NameEditDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        onSaveName={updateFullName}
        isProcessing={isProcessing}
      />
    </>
  );
}

export default UserMenu;
