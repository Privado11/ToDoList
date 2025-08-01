import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin, ChevronsUpDown, Loader2 } from "lucide-react";

const LocationSearchComponent = ({
  location,
  query,
  setQuery,
  locations,
  loading,
  error,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (location) => {
    setOpen(false);
    setQuery("");
    onSelect?.(location);
  };

  const formatLocationName = (location) => {
    let city = location?.city || "";
    let country = location?.country || "";
    let addressType = location?.addresstype || "";

    if (addressType === "country") {
      return country;
    } else {
      return `${city}, ${country}`;
    }
  };

  return (
    <div className={`space-y-2 `}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              <span className={location ? "text-black" : "text-gray-500"}>
                {location
                  ? formatLocationName(location)
                  : "Search for a city or country..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={"Search for a city or country..."}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[200px]">
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Searching...</span>
                </div>
              )}

              {error && (
                <div className="p-4 text-sm text-red-500">Error: {error}</div>
              )}

              {!loading && !error && query.length > 0 && query.length < 2 && (
                <div className="p-4 text-sm text-gray-500">
                  Type at least 2 characters to search
                </div>
              )}

              {!loading &&
                !error &&
                query.length >= 3 &&
                locations.length === 0 && (
                  <CommandEmpty>No locations found.</CommandEmpty>
                )}

              {!loading && !error && locations.length > 0 && (
                <CommandGroup>
                  {locations.map((location) => (
                    <CommandItem
                      key={location.placeId}
                      value={location.displayName}
                      onSelect={() => handleSelect(location)}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatLocationName(location)}
                        </span>
                        {location.displayName && (
                          <span className="text-xs text-gray-500 truncate">
                            {location.displayName}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSearchComponent;
