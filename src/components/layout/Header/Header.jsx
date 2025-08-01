import React from "react";

import { CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AppNotifications,
  ChatNotifications,
  SearchComponent,
} from "@/components/header";
import { useAuth, useProfileContext } from "@/context";
import UserMenu from "@/features/users/components/UserMenu";

function Header() {
  const {
    signOutLocal,
    linkWithEmail,
    linkWithGoogle,
    linkWithFacebook,
    isProcessing,
  } = useAuth();
  const { profile, profileLoading, updateFullName } = useProfileContext();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center gap-4 w-full">
        <Link
          to="/dashboard"
          className="hidden lg:flex items-center gap-2 font-semibold"
        >
          <CheckSquare className="h-6 w-6" />
          <span>Piranha Planner</span>
        </Link>

        <div className="flex items-center text-base h-full w-full md:max-w-[400px]">
          <div className="w-10 lg:hidden"></div>
          <SearchComponent
            user={profile}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ChatNotifications />
        <AppNotifications />
        <UserMenu
          user={profile}
          signOutLocal={signOutLocal}
          userLoading={profileLoading}
          linkWithEmail={linkWithEmail}
          linkWithGoogle={linkWithGoogle}
          linkWithFacebook={linkWithFacebook}
          isProcessing={isProcessing}
          updateFullName={updateFullName}
        />
      </div>
    </header>
  );
}

export default Header;
