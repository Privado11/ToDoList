import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { UserMenu } from "../../header/UserMenu";
import { ChatNotifications } from "../../header/ChatNotifications";
import { AppNotifications } from "../../header/AppNotifications";

function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <Search className="h-4 w-4 text-muted-foreground lg:hidden" />
        <Input
          type="search"
          placeholder="Search tasks..."
          className="w-full max-w-[300px] bg-background hidden lg:block"
        />
      </div>
      <div className="flex items-center gap-4">
        <ChatNotifications />
        <AppNotifications />
        <UserMenu />
      </div>
    </header>
  );
}

export default Header;
