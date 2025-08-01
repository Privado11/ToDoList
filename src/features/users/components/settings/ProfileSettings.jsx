import React, { useCallback, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Check, X, Loader2 } from "lucide-react";

const ProfileSettings = ({
  user,
  checkFullNameUpdateTime,
  checkUsernameUpdateTime,
  checkUsernameAvailability,
  updateProfile,
  updateProfilePicture,
  deleteOldAvatar,
  userLoading,
  timeMsgFullName,
  timeMsgUsername,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    username: user?.username?.replace("@", "") || "",
    description: user?.description || "",
    profilePicture: user?.avatar_url || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const isProfileUnchanged =
    user?.full_name === formData.fullName &&
    user?.username?.replace("@", "") === formData.username &&
    (user?.description || "") === (formData.description || "");

  const checkUpdateTimes = useCallback(async () => {
    if (!user?.id) return;

    try {
      await Promise.all([
        checkFullNameUpdateTime(user.id),
        checkUsernameUpdateTime(user.id),
      ]);
    } catch (error) {}
  }, [user?.id, checkFullNameUpdateTime, checkUsernameUpdateTime]);

  useEffect(() => {
    if (user?.id) {
      checkUpdateTimes();
    }
  }, [user?.id, checkUpdateTimes]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setIsUsernameAvailable(null);

    if (field === "fullName") {
      if (value.trim() === "") {
        setErrors((prev) => ({ ...prev, fullName: "Full name is required" }));
      }
    }

    if (field === "username") {
      const currentUsername = user?.username?.replace("@", "") || "";
      if (value !== currentUsername) {
        checkUsername(value);
      } else {
        setIsUsernameAvailable(null);
      }
    }
  };

  const checkUsername = async (username) => {
    setIsUsernameAvailable(null);

    try {
      const response = await checkUsernameAvailability(username);

      setIsUsernameAvailable(response);
    } catch (error) {}
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);

      setIsEditing(false);
      setErrors({});
      setIsUsernameAvailable(null);
      checkUpdateTimes(user?.id);
    } catch (error) {}
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.full_name || "",
      username: user?.username?.replace("@", "") || "",
      description: user?.description || "",
      profilePicture: user?.avatar_url || "",
      email: user?.email || "",
    });
    setIsEditing(false);
    setErrors({});
    setIsUsernameAvailable(null);
  };

  const handleDeleteProfilePicture = async (e) => {
    e.stopPropagation();

    try {
      setErrors((prev) => ({ ...prev, profilePicture: "" }));

      setFormData((prev) => ({
        ...prev,
        profilePicture: "",
      }));

      if (user?.avatar_url) {
        await deleteOldAvatar();
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Error deleting image",
      }));
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const newImageUrl = URL.createObjectURL(file);

    try {
      setFormData((prev) => ({
        ...prev,
        profilePicture: newImageUrl,
      }));

      setErrors((prev) => ({ ...prev, profilePicture: "" }));

      await updateProfilePicture(file);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Error uploading image",
      }));
    } finally {
      URL.revokeObjectURL(newImageUrl);

      event.target.value = "";
    }
  };

  const getUserInitials = () => {
    if (!formData.fullName) return "U";
    const names = formData.fullName.trim().split(" ");
    return names.length > 1
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(
          0
        )}`.toUpperCase()
      : names[0].charAt(0).toUpperCase();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you.
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={
                    !formData.fullName ||
                    isProfileUnchanged ||
                    userLoading.checkUsernameAvailability ||
                    userLoading.updateProfilePicture ||
                    userLoading.updateProfile ||
                    isUsernameAvailable?.success === false
                  }
                  size="sm"
                >
                  {userLoading.updateProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={
                    userLoading.updateProfile ||
                    userLoading.updateProfilePicture
                  }
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <div
                  className="relative h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    formData.profilePicture && setShowImagePreview(true)
                  }
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={formData.profilePicture}
                      alt={formData.fullName}
                      className={`transition-all duration-200 ${
                        userLoading.updateProfilePicture
                          ? "opacity-50"
                          : "opacity-100"
                      }`}
                    />
                    <AvatarFallback className="text-lg font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {userLoading.updateProfilePicture && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <div className="bg-white/90 rounded-full p-2 shadow-lg">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                      </div>
                    </div>
                  )}

                  {formData.profilePicture &&
                    !userLoading.updateProfilePicture &&
                    isHoveringAvatar && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 z-10"
                        title="Eliminar foto de perfil"
                        onMouseEnter={() => setIsHoveringAvatar(true)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Label htmlFor="profile-picture">
                    <Button
                      variant="outline"
                      type="button"
                      asChild
                      disabled={userLoading.updateProfilePicture}
                    >
                      <span className="cursor-pointer">
                        {userLoading.updateProfilePicture ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Change Photo
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                </div>

                <input
                  id="profile-picture"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  JPG or PNG. Maximum 5MB.
                </p>
                {errors.profilePicture && (
                  <p className="text-xs text-destructive">
                    {errors.profilePicture}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    disabled={!isEditing || timeMsgFullName}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="full name"
                  />

                  <div className="h-5">
                    {isEditing && errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                    {isEditing && timeMsgFullName && (
                      <p className="text-xs text-amber-600">
                        {timeMsgFullName}
                      </p>
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
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!isEditing || timeMsgUsername}
                      className={`${!isEditing ? "bg-muted" : ""} !pl-7 pr-10`}
                      placeholder="username"
                    />
                    {isEditing && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {userLoading.checkUsernameAvailability ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isUsernameAvailable?.success === true ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isUsernameAvailable?.success === false ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="h-5">
                    {isEditing && timeMsgUsername && (
                      <p className="text-xs text-amber-600">
                        {timeMsgUsername}
                      </p>
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
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`min-h-[100px] ${!isEditing ? "bg-muted" : ""}`}
                  placeholder="Brief description for your profile..."
                  maxLength={160}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Brief description for your profile. Maximum 160 characters.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/160
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showImagePreview && formData.profilePicture && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={formData.profilePicture}
              alt={formData.fullName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setShowImagePreview(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettings;
