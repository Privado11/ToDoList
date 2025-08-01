import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { X, ChevronsUpDown, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function AddInterestsDialog({
  open,
  setOpen,
  availableInterests = [],
  userInterests = [],
  onAddInterests,
  onDeleteInterest,
  interestLoading = {},
}) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [currentInterests, setCurrentInterests] = useState([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentInterests([...userInterests]);
      setSelectedInterests([]);
    }
  }, [open, userInterests]);

  const handleAddInterest = (interest) => {
    if (!selectedInterests.find((selected) => selected.id === interest.id)) {
      setSelectedInterests([...selectedInterests, interest]);
    }
    setComboboxOpen(false);
  };

  const handleRemoveFromSelected = (interestId) => {
    setSelectedInterests(
      selectedInterests.filter((interest) => interest.id !== interestId)
    );
  };

  const handleRemoveFromCurrent = (interestId) => {
    setCurrentInterests(
      currentInterests.filter((interest) => interest.id !== interestId)
    );
  };

  const hasChanges = () => {
    const hasNewInterests = selectedInterests.length > 0;
    const hasRemovedInterests =
      currentInterests.length !== userInterests.length;
    return hasNewInterests || hasRemovedInterests;
  };

  const getRemovedInterests = () => {
    return userInterests.filter(
      (userInterest) =>
        !currentInterests.find((current) => current.id === userInterest.id)
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setOpen(false);
      return;
    }

    try {
      if (selectedInterests.length > 0) {
        await onAddInterests(selectedInterests);
      }

      const removedInterests = getRemovedInterests();
      for (const interest of removedInterests) {
        await onDeleteInterest(interest.id);
      }

      setSelectedInterests([]);
      setOpen(false);
    } catch (error) {
      console.error("Error updating interests:", error);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) return;
    }

    setSelectedInterests([]);
    setCurrentInterests([...userInterests]);
    setOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const SVGIcon = ({ svgString }) => {
    if (!svgString) return null;
    const cleanedSvg = svgString
      .replace(/width=".*?"/g, "")
      .replace(/height=".*?"/g, "")
      .replace(
        /<svg([^>]*)>/,
        `<svg$1 style="width:1rem; height:1rem; margin-right:0.25rem;">`
      );
    return <div dangerouslySetInnerHTML={{ __html: cleanedSvg }} />;
  };

  const isLoading =
    interestLoading.addInterests || interestLoading.removeInterest;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Update interests</h2>
            {hasChanges() && (
              <div
                className="w-2 h-2 bg-orange-500 rounded-full"
                title="Unsaved changes"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 p-6">
          {hasChanges() && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You have unsaved changes. Click "Update" to save them.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="interest-search">Search new interests to add</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  Select interest...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <Command>
                  <CommandInput placeholder="Search for interest..." />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>No interests were found.</CommandEmpty>
                    <CommandGroup>
                      {availableInterests
                        .filter((interest) => {
                          const isSelected = selectedInterests.find(
                            (selected) => selected.id === interest.id
                          );
                          const isCurrentUser = currentInterests.find(
                            (current) => current.id === interest.id
                          );
                          return !isSelected && !isCurrentUser;
                        })
                        .map((interest) => (
                          <CommandItem
                            key={interest.id}
                            value={interest.name}
                            onSelect={() => {
                              handleAddInterest(interest);
                            }}
                            className="cursor-pointer"
                          >
                            <SVGIcon svgString={interest.icon_svg} />
                            {interest.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedInterests.length > 0 && (
            <div className="space-y-2">
              <Label>New interests to add ({selectedInterests.length})</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-green-50 min-h-[60px]">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 bg-green-100 hover:bg-green-200"
                  >
                    <SVGIcon svgString={interest.icon_svg} />
                    {interest.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleRemoveFromSelected(interest.id)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentInterests.length > 0 && (
            <div className="space-y-2">
              <Label>Your current interests ({currentInterests.length})</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-blue-50 min-h-[60px]">
                {currentInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="outline"
                    className="flex items-center gap-1 bg-blue-100 border-blue-300"
                  >
                    <SVGIcon svgString={interest.icon_svg} />
                    {interest.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleRemoveFromCurrent(interest.id)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {getRemovedInterests().length > 0 && (
            <div className="space-y-2">
              <Label className="text-red-600">
                Interests to be removed ({getRemovedInterests().length})
              </Label>
              <div className="flex flex-wrap gap-2 p-3 border border-red-200 rounded-md bg-red-50 min-h-[60px]">
                {getRemovedInterests().map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="outline"
                    className="flex items-center gap-1 bg-red-100 border-red-300 text-red-700"
                  >
                    <SVGIcon svgString={interest.icon_svg} />
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentInterests.length === 0 && selectedInterests.length === 0 && (
            <div className="space-y-2">
              <Label>Your interests</Label>
              <div className="p-3 border rounded-md bg-gray-50 min-h-[60px] flex items-center justify-center text-gray-500 text-sm">
                You don't have any interests. Add some above!
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges() || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                Update
                {hasChanges() && (
                  <span className="ml-1">
                    (
                    {selectedInterests.length > 0 &&
                      `+${selectedInterests.length}`}
                    {getRemovedInterests().length > 0 &&
                      ` -${getRemovedInterests().length}`}
                    )
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddInterestsDialog;
