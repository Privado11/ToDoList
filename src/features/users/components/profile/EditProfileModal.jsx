import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationSearchComponent from "./LocationSearchComponent";
import { useLocationSearch } from "../../hooks";

const EditProfileModal = ({
  open,
  setOpen,
  user,
  setUser,
  onEditUser,
  timeMsgFullName,
  timeMsgUsername,
  isUsernameAvailable,
  errors = {},
  userLoading,
}) => {
  const { query, setQuery, locations, loading, error } = useLocationSearch();
  const [userAux] = useState(() => (user ? { ...user } : {}));

  const isProfileUnchanged = JSON.stringify(user) === JSON.stringify(userAux);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setQuery("");
    setUser("fullName", userAux.fullName || "");
    setUser("username", userAux.username || "");
    setUser("description", userAux.description || "");
    setUser("location", userAux.location || "");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Edit profile</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your profile information here.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onEditUser} className="p-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={user?.fullName}
                  disabled={timeMsgFullName}
                  onChange={(e) => setUser("fullName", e.target.value)}
                />
                <div className="h-5">
                  {errors.fullName && (
                    <p className="text-xs text-destructive">
                      {errors.fullName}
                    </p>
                  )}

                  {timeMsgFullName && (
                    <p className="text-xs text-amber-600">{timeMsgFullName}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-30 select-none">
                    @
                  </span>
                  <Input
                    id="username"
                    value={user?.username}
                    onChange={(e) => setUser("username", e.target.value)}
                    disabled={timeMsgUsername}
                    className={`${
                      timeMsgUsername ? "bg-muted" : ""
                    } !pl-7 pr-10`}
                  />

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {userLoading.checkUsernameAvailability ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isUsernameAvailable?.success === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isUsernameAvailable?.success === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null}
                  </div>
                </div>

                <div className="h-5">
                  {timeMsgUsername && (
                    <p className="text-xs text-amber-600">{timeMsgUsername}</p>
                  )}

                  {isUsernameAvailable ? (
                    <p
                      className={`text-xs ${
                        isUsernameAvailable?.success
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {isUsernameAvailable?.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={user?.description}
                onChange={(e) => setUser("description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <LocationSearchComponent
                location={user?.location}
                onSelect={(location) => setUser("location", location)}
                query={query}
                setQuery={setQuery}
                loading={loading}
                locations={locations}
                error={error}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isProfileUnchanged ||
                userLoading.updateProfile ||
                userLoading.checkUsernameAvailability
              }
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
