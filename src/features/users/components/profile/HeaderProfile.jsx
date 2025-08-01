import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Eye,
  MapPin,
  Trash2,
  ImageUp,
  X,
  Loader2,
  MessageSquare,
  UserCheck,
  UserPlus,
  UserMinus,
  UserRoundX,
} from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { useProfileContext } from "@/context";
import { DialogConfirmation } from "@/view/DialogConfirmation";

const HeaderProfile = ({ user, openChat }) => {
  const {
    checkFullNameUpdateTime,
    checkUsernameUpdateTime,
    checkUsernameAvailability,
    updateProfile,
    profileLoading: userLoading,
    updateProfilePicture,
    deleteOldAvatar,
    timeMsgFullName,
    timeMsgUsername,
    addFriend,
    removeFriend,
    cancelledFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useProfileContext();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    username: user?.username?.replace("@", "") || "",
    profilePicture: user?.avatar_url,
    description: user?.description || "",
    location: {
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const hasAvatar = Boolean(user?.avatar_url);

  const formatLocationName = useCallback((location) => {
    const city = location?.city || "";
    const country = location?.country || "";

    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return "Location not specified";
  }, []);

  const checkUpdateTimes = useCallback(async () => {
    if (!user?.id) return;

    try {
      await Promise.all([
        checkFullNameUpdateTime(user.id),
        checkUsernameUpdateTime(user.id),
      ]);
    } catch (error) {}
  }, [user?.id, checkFullNameUpdateTime, checkUsernameUpdateTime]);

  const checkUsername = useCallback(
    async (username) => {
      if (!username.trim()) {
        setIsUsernameAvailable(null);
        return;
      }

      setIsUsernameAvailable(null);

      try {
        const response = await checkUsernameAvailability(username);
        setIsUsernameAvailable(response);
      } catch (error) {
        console.error("Error checking username availability:", error);
      }
    },
    [checkUsernameAvailability]
  );

  useEffect(() => {
    if (user?.id) {
      checkUpdateTimes();
    }
  }, [user?.id, checkUpdateTimes]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));

      if (field === "fullName") {
        if (!value.trim()) {
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
    },
    [user?.username, checkUsername]
  );

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await updateProfile(formData);
        setIsEditing(false);
        setErrors({});
        setIsUsernameAvailable(null);
        await checkUpdateTimes();
      } catch (error) {
        console.error("Error updating profile:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error updating profile",
        }));
      }
    },
    [formData, updateProfile, checkUpdateTimes]
  );

  const handleFileInputClick = useCallback(() => {
    document.getElementById("profile-picture")?.click();
  }, []);

  const handleUploadClick = async (event) => {
    const file = event.target.files?.[0];
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
      console.error("Error uploading image:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Error uploading image",
      }));
    } finally {
      URL.revokeObjectURL(newImageUrl);
      event.target.value = "";
    }
  };

  const handleViewImage = useCallback(() => {
    setShowImagePreview(true);
  }, []);

  const handleDeleteImage = useCallback((e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (e) => {
      e.stopPropagation();

      try {
        setErrors((prev) => ({ ...prev, profilePicture: "" }));
        setFormData((prev) => ({
          ...prev,
          profilePicture: "",
        }));
        await deleteOldAvatar();

        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting image:", error);
        setErrors((prev) => ({
          ...prev,
          profilePicture: error.message || "Error deleting image",
        }));
      }
    },
    [deleteOldAvatar]
  );

  const handleAddFriend = useCallback(async () => {
    try {
      await addFriend(user?.id);
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error adding friend",
      }));
    }
  }, [addFriend, user?.id]);

  const handleAcceptFriend = useCallback(async () => {
    try {
      await acceptFriendRequest(user?.friend_request_id);
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error accepting friend request",
      }));
    }
  }, [acceptFriendRequest, user?.friend_request_id]);

  const handleRejectFriend = useCallback(async () => {
    try {
      await rejectFriendRequest(user?.friend_request_id);
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error rejecting friend request",
      }));
    }
  }, [rejectFriendRequest, user?.friend_request_id]);

  const handleCancelFriendRequest = useCallback(async () => {
    try {
      await cancelledFriendRequest(user?.friend_request_id);
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error cancelling friend request",
      }));
    }
  }, [cancelledFriendRequest, user?.friend_request_id]);

  const handleUnfriend = useCallback(() => {
    setUnfriendDialogOpen(true);
  }, []);

  const handleConfirmUnfriend = async (user) => {
    try {
      await removeFriend(user?.id);
      setUnfriendDialogOpen(false);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error removing friend",
      }));
    }
  };

  const closeImagePreview = useCallback(() => {
    setShowImagePreview(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const closeUnfriendDialog = useCallback(() => {
    setUnfriendDialogOpen(false);
  }, []);

  const getInitials = useCallback((name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0].charAt(0)}${names[1].charAt(0)}`
      : names[0].charAt(0);
  }, []);

  const handleAvatarClick = useCallback(() => {
    if (!user?.is_me_profile && hasAvatar) {
      handleViewImage();
    }
  }, [user?.is_me_profile, hasAvatar, handleViewImage]);

  return (
    <>
      <CardHeader className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
       
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative">
            {user?.is_me_profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-14 w-14 sm:h-24 sm:w-24 ring-2 sm:ring-4 ring-primary/10 cursor-pointer hover:ring-primary/20 transition-all">
                    <AvatarImage
                      src={formData?.profilePicture}
                      alt={user?.full_name}
                    />
                    <AvatarFallback className="text-sm sm:text-lg">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-48">
                  {hasAvatar && (
                    <DropdownMenuItem
                      onClick={handleViewImage}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View image
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleFileInputClick}
                    className="cursor-pointer"
                  >
                    <ImageUp className="h-4 w-4 mr-2" />
                    {hasAvatar ? "Change image" : "Upload image"}
                  </DropdownMenuItem>
                  {hasAvatar && (
                    <DropdownMenuItem
                      onClick={handleDeleteImage}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete image
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Avatar
                className={`h-14 w-14 sm:h-24 sm:w-24 ring-2 sm:ring-4 ring-primary/10 transition-all ${
                  hasAvatar
                    ? "cursor-pointer hover:ring-primary/20"
                    : "cursor-default"
                }`}
                onClick={handleAvatarClick}
              >
                <AvatarImage
                  src={formData?.profilePicture}
                  alt={user?.full_name}
                />
                <AvatarFallback className="text-sm sm:text-lg">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
            )}

            {userLoading?.updateProfilePicture ||
              (userLoading.deleteOldAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                  <div className="bg-white/90 rounded-full p-1 sm:p-2 shadow-lg">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              ))}

            {user?.is_me_profile && (
              <input
                id="profile-picture"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleUploadClick}
                className="hidden"
              />
            )}
          </div>

         
          <div className="flex-1 space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-2xl">
                {user?.full_name}
              </CardTitle>
              {user?.availability && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm"
                >
                  {user.availability}
                </Badge>
              )}
            </div>
            {user?.username && (
              <CardDescription className="text-sm sm:text-base">
                {user.username}
              </CardDescription>
            )}
            {formData?.location &&
              (formData.location.city ||
                formData.location.state ||
                formData.location.country) && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {formatLocationName(formData.location)}
                </div>
              )}
          </div>

         
          <div className="hidden sm:flex flex-wrap gap-2">
            {user?.is_me_profile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit profile
              </Button>
            ) : user?.is_friend ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Friends
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleUnfriend}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove friend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" onClick={() => openChat(user)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </>
            ) : user?.has_pending_request ? (
              user?.i_sent_request ? (
                <Button
                  size="sm"
                  onClick={() => handleCancelFriendRequest(user)}
                >
                  <UserRoundX className="h-4 w-4 mr-2" />
                  Cancel friend request
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Pending request
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAcceptFriend(user)}
                      className="text-blue-600 focus:text-blue-600 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept request
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRejectFriend(user)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <UserRoundX className="h-4 w-4 mr-2" />
                      Reject request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Button size="sm" onClick={() => handleAddFriend(user)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            )}
          </div>
        </div>

      
        <div className="flex gap-2 sm:hidden">
          {user?.is_me_profile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit profile
            </Button>
          ) : user?.is_friend ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Friends
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleUnfriend}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                onClick={() => openChat(user)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </>
          ) : user?.has_pending_request ? (
            user?.i_sent_request ? (
              <Button
                size="sm"
                onClick={() => handleCancelFriendRequest(user)}
                className="w-full"
              >
                <UserRoundX className="h-4 w-4 mr-2" />
                Cancel friend request
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Pending request
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleAcceptFriend(user)}
                    className="text-blue-600 focus:text-blue-600 cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Accept request
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRejectFriend(user)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <UserRoundX className="h-4 w-4 mr-2" />
                    Reject request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <Button
              size="sm"
              onClick={() => handleAddFriend(user)}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          )}
        </div>

        {errors.profilePicture && (
          <div className="text-sm text-destructive mt-2">
            {errors.profilePicture}
          </div>
        )}
      </CardHeader>

      <EditProfileModal
        open={isEditing}
        setOpen={setIsEditing}
        user={formData}
        setUser={handleInputChange}
        timeMsgFullName={timeMsgFullName}
        timeMsgUsername={timeMsgUsername}
        isUsernameAvailable={isUsernameAvailable}
        onEditUser={handleSave}
        errors={errors}
        userLoading={userLoading}
      />

      <DialogConfirmation
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Profile Picture"
        description="Are you sure you want to delete your profile picture?"
        cancelText="Cancel"
        confirmText="Yes, delete picture"
      />

      <DialogConfirmation
        isOpen={unfriendDialogOpen}
        onClose={closeUnfriendDialog}
        onConfirm={handleConfirmUnfriend}
        title="Remove Friend"
        description={`Are you sure you want to remove ${user?.full_name} from your friends list?`}
        cancelText="Cancel"
        confirmText="Yes, remove friend"
      />

      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={user?.avatar_url}
              alt={user?.full_name || "Profile picture"}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={closeImagePreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderProfile;
