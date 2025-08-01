import { act, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Lock,
  User,
  Palette,
  LogOut,
  ArrowLeft,
  Shield,
  Smartphone,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  AccountSettings,
  AnonymousWarningDialog,
  AppareanceSettings,
  AppSettings,
  LinkingOptionsDialog,
  NotificationSettings,
  PasswordSettings,
  PrivacySetting,
  ProfileSettings,
} from "../components";
import {
  useAuth,
  useNotification,
  useProfileContext,
  useTaskContext,
} from "@/context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "@/features/chats";

function SettingsPage() {
  const {
    updatePassword,
    signOutLocal,
    signOut,
    linkWithEmailPassword,
    linkWithGoogle,
    linkWithFacebook,
    isProcessing,
  } = useAuth();
  const {
    profile: user,
    checkFullNameUpdateTime,
    checkUsernameUpdateTime,
    checkUsernameAvailability,
    updateProfile,
    updateProfilePicture,
    deleteOldAvatar,
    profileLoading: userLoading,
    saveUserLanguage,
    privacy,
    getPrivacy,
    updatePrivacy,
    timeMsgFullName,
    timeMsgUsername,
  } = useProfileContext();
  const { tasks } = useTaskContext();
  const {
    preferences,
    getUserNotificationsPreferences,
    updateUserNotificationsPreferences,
    loading,
  } = useNotification();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [language, setLanguage] = useState(user?.language || "en");
  const [showAnonymousWarning, setShowAnonymousWarning] = useState(false);
  const [showLinkingOptions, setShowLinkingOptions] = useState(false);

  const isAnonymous = user?.is_anonymous || false;

  const getAvailableTabs = () => {
    const baseTabs = [
      "profile",
      "notifications",
      "appearance",
      "app",
      "account",
    ];
    if (!isAnonymous) {
      return ["profile", "password", "privacy", ...baseTabs.slice(1)];
    }
    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  const getDefaultTab = () => {
    if (isMobile) {
      return "settings";
    }
    return availableTabs[0];
  };

  const currentTab = searchParams.get("tab") || getDefaultTab();

  const handleTabChange = (tabValue) => {
    if (tabValue === getDefaultTab()) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("tab");
      setSearchParams(newSearchParams);
    } else {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", tabValue);
      setSearchParams(newSearchParams);
    }
  };

  useEffect(() => {
    const validTabs = [...availableTabs, "settings"];

    if (!validTabs.includes(currentTab)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", getDefaultTab());
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [currentTab, availableTabs, isMobile, searchParams, setSearchParams]);

  useEffect(() => {
    setLanguage(user?.language || "en");
  }, [user?.language]);

  useEffect(() => {
    if (!isAnonymous) {
      getPrivacy();
    }
  }, [getPrivacy, isAnonymous]);

  useEffect(() => {
    getUserNotificationsPreferences();
  }, [getUserNotificationsPreferences]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    if (isAnonymous) {
      resetAllDialogs();
      setShowAnonymousWarning(true);
    } else {
      signOutLocal();
    }
  };

  const handleLanguageChange = async (lang) => {
    try {
      await saveUserLanguage(lang);
      setLanguage(lang);
    } catch (error) {
      throw error;
    }
  };

  const handleTabClick = (value) => {
    if (isAnonymous && (value === "privacy" || value === "password")) {
      return;
    }
    handleTabChange(value);
  };

  const resetAllDialogs = () => {
    setShowAnonymousWarning(false);
    setShowLinkingOptions(false);
  };

  const handleLinkAccount = () => {
    resetAllDialogs();
    setShowLinkingOptions(true);
  };

  const handleConfirmLogout = () => {
    resetAllDialogs();
    signOutLocal();
  };

  const handleAnonymousWarningClose = (open) => {
    if (!open) {
      resetAllDialogs();
    }
  };

  const handleLinkingOptionsClose = (open) => {
    if (!open) {
      resetAllDialogs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm z-10">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="flex-1 p-4">
            <Tabs
              value={currentTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto bg-transparent space-y-2 p-0 w-full">
                {availableTabs.includes("profile") && (
                  <TabsTrigger
                    value="profile"
                    className="justify-start w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50 transition-colors"
                    onClick={() => handleTabClick("profile")}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </TabsTrigger>
                )}

                {availableTabs.includes("password") && (
                  <TabsTrigger
                    value="password"
                    className={`justify-start w-full transition-colors ${
                      isAnonymous
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTabClick("password")}
                    disabled={isAnonymous}
                  >
                    <Lock className="h-4 w-4 mr-3" />
                    Password
                  </TabsTrigger>
                )}

                {availableTabs.includes("privacy") && (
                  <TabsTrigger
                    value="privacy"
                    className={`justify-start w-full transition-colors ${
                      isAnonymous
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTabClick("privacy")}
                    disabled={isAnonymous}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Privacy
                  </TabsTrigger>
                )}

                {availableTabs.includes("notifications") && (
                  <TabsTrigger
                    value="notifications"
                    className="justify-start w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50 transition-colors"
                    onClick={() => handleTabClick("notifications")}
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Notifications
                  </TabsTrigger>
                )}

                {availableTabs.includes("appearance") && (
                  <TabsTrigger
                    value="appearance"
                    className="justify-start w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50 transition-colors"
                    onClick={() => handleTabClick("appearance")}
                  >
                    <Palette className="h-4 w-4 mr-3" />
                    Appearance
                  </TabsTrigger>
                )}

                {availableTabs.includes("app") && (
                  <TabsTrigger
                    value="app"
                    className="justify-start w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50 transition-colors"
                    onClick={() => handleTabClick("app")}
                  >
                    <Smartphone className="h-4 w-4 mr-3" />
                    App
                  </TabsTrigger>
                )}

                {availableTabs.includes("account") && (
                  <TabsTrigger
                    value="account"
                    className="justify-start w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-gray-50 transition-colors"
                    onClick={() => handleTabClick("account")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-3" />
                    Account
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            {isAnonymous && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Limited Access</p>
                    <p className="text-xs">
                      Password and Privacy settings are not available for
                      anonymous users. Please create an account or link your
                      account to access these features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 mt-auto">
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        {currentTab === "settings" && (
          <>
            <div className="bg-white border-b border-gray-200 px-4 py-4">
              <div className="flex items-center mb-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="px-4 py-6">
              <div className="flex flex-col space-y-3">
                {availableTabs.includes("profile") && (
                  <button
                    className="flex items-center justify-start w-full h-14 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">Profile</span>
                    <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                  </button>
                )}

                {availableTabs.includes("password") && (
                  <button
                    className={`flex items-center justify-start w-full h-14 px-4 border border-gray-200 rounded-lg shadow-sm transition-colors ${
                      isAnonymous
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => !isAnonymous && handleTabChange("password")}
                    disabled={isAnonymous}
                  >
                    <Lock className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">Password</span>
                    {!isAnonymous && (
                      <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                    )}
                  </button>
                )}

                {availableTabs.includes("privacy") && (
                  <button
                    className={`flex items-center justify-start w-full h-14 px-4 border border-gray-200 rounded-lg shadow-sm transition-colors ${
                      isAnonymous
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => !isAnonymous && handleTabChange("privacy")}
                    disabled={isAnonymous}
                  >
                    <Shield className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">Privacy</span>
                    {!isAnonymous && (
                      <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                    )}
                  </button>
                )}

                {availableTabs.includes("notifications") && (
                  <button
                    className="flex items-center justify-start w-full h-14 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => handleTabChange("notifications")}
                  >
                    <Bell className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Notifications
                    </span>
                    <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                  </button>
                )}

                {availableTabs.includes("appearance") && (
                  <button
                    className="flex items-center justify-start w-full h-14 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => handleTabChange("appearance")}
                  >
                    <Palette className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Appearance
                    </span>
                    <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                  </button>
                )}

                {availableTabs.includes("app") && (
                  <button
                    className="flex items-center justify-start w-full h-14 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => handleTabChange("app")}
                  >
                    <Smartphone className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">App</span>
                    <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                  </button>
                )}

                {availableTabs.includes("account") && (
                  <button
                    className="flex items-center justify-start w-full h-14 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => handleTabChange("account")}
                  >
                    <AlertTriangle className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-900">Account</span>
                    <ArrowLeft className="h-4 w-4 ml-auto text-gray-400 rotate-180" />
                  </button>
                )}

                {isAnonymous && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-2">Limited Access</p>
                        <p>
                          Password and Privacy settings are not available for
                          anonymous users. Please create an account or link your
                          account to access these features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    className="flex items-center justify-center w-full px-4 py-4 text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 font-medium shadow-sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentTab !== "settings" && (
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => handleTabChange("settings")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {currentTab}
            </h1>
          </div>
        )}
      </div>

      <div className="hidden md:block md:ml-64 pt-8 pb-8">
        <div className="px-8">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full max-w-4xl"
          >
            {availableTabs.includes("profile") && (
              <TabsContent value="profile" className="mt-0">
                <ProfileSettings
                  user={user}
                  updateProfile={updateProfile}
                  updateProfilePicture={updateProfilePicture}
                  checkFullNameUpdateTime={checkFullNameUpdateTime}
                  checkUsernameUpdateTime={checkUsernameUpdateTime}
                  checkUsernameAvailability={checkUsernameAvailability}
                  deleteOldAvatar={deleteOldAvatar}
                  userLoading={userLoading}
                  timeMsgFullName={timeMsgFullName}
                  timeMsgUsername={timeMsgUsername}
                />
              </TabsContent>
            )}

            {availableTabs.includes("password") && (
              <TabsContent value="password" className="mt-0">
                {isAnonymous ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Password Settings Unavailable
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Password management is not available for anonymous
                        users. Please create an account or link your account to
                        manage your password settings.
                      </p>
                    </div>
                  </div>
                ) : (
                  <PasswordSettings
                    updatePassword={updatePassword}
                    userLoading={userLoading}
                  />
                )}
              </TabsContent>
            )}

            {availableTabs.includes("privacy") && (
              <TabsContent value="privacy" className="mt-0">
                {isAnonymous ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Privacy Settings Unavailable
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Privacy settings are not available for anonymous users.
                        Please create an account or link your account to manage
                        your privacy preferences.
                      </p>
                    </div>
                  </div>
                ) : (
                  <PrivacySetting
                    privacy={privacy}
                    updatePrivacy={updatePrivacy}
                    userLoading={userLoading}
                  />
                )}
              </TabsContent>
            )}

            {availableTabs.includes("notifications") && (
              <TabsContent value="notifications" className="mt-0">
                <NotificationSettings
                  preferences={preferences}
                  onUpdatePreferences={updateUserNotificationsPreferences}
                  loading={loading}
                />
              </TabsContent>
            )}

            {availableTabs.includes("appearance") && (
              <TabsContent value="appearance" className="mt-0">
                <AppareanceSettings />
              </TabsContent>
            )}

            {availableTabs.includes("app") && (
              <TabsContent value="app" className="mt-0">
                <AppSettings
                  language={language}
                  handleLanguageChange={handleLanguageChange}
                  tasks={tasks}
                  userLoading={userLoading}
                />
              </TabsContent>
            )}

            {availableTabs.includes("account") && (
              <TabsContent value="account" className="mt-0">
                <AccountSettings
                  user={user}
                  signOut={signOut}
                  linkWithEmailPassword={linkWithEmailPassword}
                  linkWithFacebook={linkWithFacebook}
                  linkWithGoogle={linkWithGoogle}
                  isProcessing={isProcessing}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <div className="md:hidden">
        {currentTab !== "settings" && (
          <div>
            <div className="bg-white rounded-lg">
              {currentTab === "profile" && (
                <ProfileSettings
                  user={user}
                  updateProfile={updateProfile}
                  updateProfilePicture={updateProfilePicture}
                  checkFullNameUpdateTime={checkFullNameUpdateTime}
                  checkUsernameUpdateTime={checkUsernameUpdateTime}
                  checkUsernameAvailability={checkUsernameAvailability}
                  deleteOldAvatar={deleteOldAvatar}
                  userLoading={userLoading}
                  timeMsgFullName={timeMsgFullName}
                  timeMsgUsername={timeMsgUsername}
                />
              )}

              {currentTab === "password" && (
                <>
                  {isAnonymous ? (
                    <div className="text-center">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Password Settings Unavailable
                      </h3>
                      <p className="text-gray-600">
                        Password management is not available for anonymous
                        users. Please create an account or link your account to
                        manage your password settings.
                      </p>
                    </div>
                  ) : (
                    <PasswordSettings
                      updatePassword={updatePassword}
                      userLoading={userLoading}
                    />
                  )}
                </>
              )}

              {currentTab === "privacy" && (
                <>
                  {isAnonymous ? (
                    <div className="text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Privacy Settings Unavailable
                      </h3>
                      <p className="text-gray-600">
                        Privacy settings are not available for anonymous users.
                        Please create an account or link your account to manage
                        your privacy preferences.
                      </p>
                    </div>
                  ) : (
                    <PrivacySetting
                      privacy={privacy}
                      updatePrivacy={updatePrivacy}
                      userLoading={userLoading}
                    />
                  )}
                </>
              )}

              {currentTab === "notifications" && (
                <NotificationSettings
                  preferences={preferences}
                  onUpdatePreferences={updateUserNotificationsPreferences}
                  loading={loading}
                />
              )}

              {currentTab === "appearance" && <AppareanceSettings />}

              {currentTab === "app" && (
                <AppSettings
                  language={language}
                  handleLanguageChange={handleLanguageChange}
                  tasks={tasks}
                  userLoading={userLoading}
                />
              )}

              {currentTab === "account" && (
                <AccountSettings
                  user={user}
                  signOut={signOut}
                  linkWithEmailPassword={linkWithEmailPassword}
                  linkWithFacebook={linkWithFacebook}
                  linkWithGoogle={linkWithGoogle}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <AnonymousWarningDialog
        open={showAnonymousWarning}
        onOpenChange={handleAnonymousWarningClose}
        onLinkAccount={handleLinkAccount}
        onConfirmLogout={handleConfirmLogout}
      />

      <LinkingOptionsDialog
        open={showLinkingOptions}
        onOpenChange={handleLinkingOptionsClose}
        linkWithEmailPassword={linkWithEmailPassword}
        linkWithGoogle={linkWithGoogle}
        linkWithFacebook={linkWithFacebook}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default SettingsPage;
