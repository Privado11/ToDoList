import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function SearchComponent({ searchTerm, setSearchTerm }) {
  return (
    <>
      <Search className="h-4 w-4 text-muted-foreground lg:hidden" />
      <Input
        type="search"
        placeholder="Search tasks..."
        className="w-full max-w-[300px] bg-background hidden lg:block"
      />
    </>
  );
}

export { SearchComponent };
