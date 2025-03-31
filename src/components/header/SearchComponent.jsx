import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function SearchComponent({ searchTerm, setSearchTerm }) {
  return (
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4 text-muted-foreground lg:hidden" />

      <Input
        type="search"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-[300px] bg-background hidden lg:block pl-8"
        aria-label="Search tasks"
      />
    </div>
  );
}

export default SearchComponent;
