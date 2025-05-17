import React, { useState } from "react";
import { UserMenu } from "@/features";
import { CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AppNotifications,
  ChatNotifications,
  SearchComponent,
} from "@/components/header";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center gap-4 w-full">
        <Link
          to="/"
          className="hidden lg:flex items-center gap-2 font-semibold"
        >
          <CheckSquare className="h-6 w-6" />
          <span>Piranha Planner</span>
        </Link>

        <div className="flex items-center text-base h-full w-full md:max-w-[400px]">
          <div className="w-10 lg:hidden"></div>
          <SearchComponent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
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
