import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
;
import { UserMenu } from "@/features";
import { AppNotifications, ChatNotifications } from "@/components/header";


function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-[300px]">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search tasks..."
            className="w-full pl-8 bg-background hidden lg:block"
          />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
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
