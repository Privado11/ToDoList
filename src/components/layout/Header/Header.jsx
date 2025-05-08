import React, { useState } from "react";
import { UserMenu } from "@/features";
import {
  AppNotifications,
  ChatNotifications,
  SearchComponent,
} from "@/components/header";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center text-base h-full">
        <div className="w-10 lg:hidden"></div>
        <SearchComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search tasks..."
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ChatNotifications />
        <AppNotifications />
        <UserMenu />
      </div>
    </header>
  );
}

export default Header;
