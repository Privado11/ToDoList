import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  BarChart3,
  PieChart,
  Shield,
  Plus,
  ArrowLeft,
  Users,
  MoreVertical,
  UserX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AchievementsProfile,
  AddInterestsDialog,
  BlockedProfile,
  FriendsProfile,
  HeaderProfile,
  InfoProfile,
  OverviewProfile,
  ProfileSkeleton,
  StatsProfile,
} from "../components";
import { useChat, useProfileContext, useTaskContext } from "@/context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function ProfilePage() {
  const {
    profile,
    availableInterests,
    userInterests,
    addInterests,
    removeInterest,
    interestLoading,
    badges,
    getAllBadgesUser,
    pendingBadges,
    earnedBadges,
    getUserByUsername,
    viewedProfile,
    profileLoading,
    getTasksChartData,
    getUserTasksWithPrivacy,
    friendsList,
    pendingRequests,
    cancelledFriendRequest,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    viewedProfileFriends,
    blockUser,
  } = useProfileContext();

  const { tasks, completedTasks, inProgressTasks, overdueTasks } =
    useTaskContext();

  const { openChat } = useChat();

  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const username = params.username;
  const [showAddInterests, setShowAddInterests] = useState(false);
  const [tasksUser, setTasksUser] = useState([]);
  const [CompletedTasksUser, setCompletedTasksUser] = useState(0);
  const [inProgressTasksUser, setInProgressTasksUser] = useState(0);
  const [overdueTasksUser, setOverdueTasksUser] = useState(0);
  const isOwnProfile = profile?.id === viewedProfile?.id;
  const isAnonymousProfile = viewedProfile?.is_anonymous === true;

  const [chartData, setChartData] = useState({
    weeklyChartData: [],
    monthlyChartData: [],
  });
  const [loading, setLoading] = useState(true);

  const notAvaliable =
    viewedProfile?.blocked === true ||
    viewedProfile?.user_not_found === true ||
    viewedProfile?.private_profile === true;

  const getAvailableTabs = () => {
    return ["info", "overview", "friends", "stats", "achievements"];
  };

  const availableTabs = getAvailableTabs();
  const currentTab = searchParams.get("tab") || availableTabs[0];

  const handleTabChange = (tabValue) => {
    if (tabValue === "info") {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("tab");
      setSearchParams(newSearchParams);
    } else {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", tabValue);
      setSearchParams(newSearchParams);
    }
  };

  const handleBlockUser = () => {
    if (viewedProfile?.id) {
      setTimeout(() => {
        blockUser(viewedProfile.id);
        navigate("/dashboard");
      }, 500);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        await getUserByUsername(username);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [username, getUserByUsername]);

  useEffect(() => {
    const fetchTasksWithPrivacy = async () => {
      if (profile && viewedProfile && profile.id !== viewedProfile.id) {
        try {
          const userTasks = await getUserTasksWithPrivacy();

          setTasksUser(userTasks.tasks || []);
          setCompletedTasksUser(
            userTasks?.access_denied !== true
              ? userTasks.stats.completed_tasks
              : -1
          );
          setInProgressTasksUser(userTasks.stats.in_progress_tasks || 0);
          setOverdueTasksUser(userTasks.stats.overdue_tasks || 0);
        } catch (error) {}
      } else {
        setTasksUser(tasks || []);
        setCompletedTasksUser(completedTasks || 0);
        setInProgressTasksUser(inProgressTasks || 0);
        setOverdueTasksUser(overdueTasks || 0);
      }
    };
    if (!notAvaliable) fetchTasksWithPrivacy();
  }, [
    profile,
    viewedProfile,
    tasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    getUserTasksWithPrivacy,
  ]);

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchTasksChartData = async () => {
      try {
        const chartData = await getTasksChartData();
        setChartData(chartData);
      } catch (error) {}
    };
    if (!notAvaliable) fetchTasksChartData();
  }, [getTasksChartData]);

  useEffect(() => {
    const fetchInfoBadges = async () => {
      await getAllBadgesUser();
    };
    if (!notAvaliable) fetchInfoBadges();
  }, [getAllBadgesUser]);

  useEffect(() => {
    if (!availableTabs.includes(currentTab)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", availableTabs[0]);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [currentTab, availableTabs, searchParams, setSearchParams]);

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

  const handleOpenChat = (user) => {
    openChat(null, user);
  };

  if (loading || profileLoading?.getUserByUsername) {
    return <ProfileSkeleton />;
  }

  if (notAvaliable) {
    return <BlockedProfile viewedProfile={viewedProfile} />;
  }

  return (
    <div className="mx-auto py-0 px-0 sm:px-6 lg:px-8 max-w-7xl">
      <div className="p-1 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 px-3 py-1 rounded-md border border-gray-300 hover:border-gray-400"
          >
            <span className="text-sm font-medium">Go to Dashboard</span>
          </button>
        </div>
      </div>
      <Card className="w-full mx-auto">
        <HeaderProfile user={viewedProfile} openChat={handleOpenChat} />
        <CardContent>
          <p className="text-sm sm:text-lg text-muted-foreground mb-6">
            {viewedProfile?.description}
          </p>
          <div className="mt-4 space-y-3 mb-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {viewedProfile?.interests?.length > 0 ? (
                  viewedProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <SVGIcon svgString={interest?.icon_svg} />
                      {interest?.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    No interests added
                  </Badge>
                )}
                {viewedProfile?.is_me_profile && (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="inline-flex items-center rounded-full border border-input bg-background px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-gray-100 cursor-pointer w-6 h-6 justify-center p-0"
                          onClick={() => setShowAddInterests(true)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white border-gray-900">
                        <p>Update interest</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <AddInterestsDialog
                open={showAddInterests}
                setOpen={setShowAddInterests}
                userInterests={userInterests}
                availableInterests={availableInterests}
                onAddInterests={addInterests}
                onDeleteInterest={removeInterest}
                interestLoading={interestLoading}
              />
            </div>
          </div>
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex items-center mb-6">
              <TabsList className="flex-1 justify-start overflow-x-auto whitespace-nowrap">
                {availableTabs.includes("info") && (
                  <TabsTrigger value="info">
                    <Shield className="h-4 w-4 mr-2" />
                    Information
                  </TabsTrigger>
                )}
                {availableTabs.includes("friends") && (
                  <TabsTrigger value="friends">
                    <Users className="h-4 w-4 mr-2" />
                    Friends
                  </TabsTrigger>
                )}
                {availableTabs.includes("overview") && (
                  <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                )}
                {availableTabs.includes("stats") && (
                  <TabsTrigger value="stats">
                    <PieChart className="h-4 w-4 mr-2" />
                    Stats
                  </TabsTrigger>
                )}
                {availableTabs.includes("achievements") && (
                  <TabsTrigger value="achievements">
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                )}
              </TabsList>
              {!isOwnProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleBlockUser}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Block user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {availableTabs.includes("info") && (
              <TabsContent value="info">
                <InfoProfile user={viewedProfile} />
              </TabsContent>
            )}
            {availableTabs.includes("friends") && (
              <TabsContent value="friends">
                <FriendsProfile
                  isOwnProfile={isOwnProfile}
                  friendsList={friendsList}
                  viewedProfileFriends={viewedProfileFriends}
                  pendingRequests={pendingRequests}
                  openChat={handleOpenChat}
                  onSendRequest={addFriend}
                  onCancelRequest={cancelledFriendRequest}
                  onRemove={removeFriend}
                  onAccept={acceptFriendRequest}
                  onReject={rejectFriendRequest}
                  tasks={tasks}
                  isAnonymous={isAnonymousProfile}
                />
              </TabsContent>
            )}
            {availableTabs.includes("overview") && (
              <TabsContent value="overview">
                <OverviewProfile
                  tasks={tasksUser}
                  completedTasks={CompletedTasksUser}
                  inProgressTasks={inProgressTasksUser}
                  overdueTasks={overdueTasksUser}
                />
              </TabsContent>
            )}
            {availableTabs.includes("stats") && (
              <TabsContent value="stats">
                <StatsProfile chartData={chartData} />
              </TabsContent>
            )}
            {availableTabs.includes("achievements") && (
              <TabsContent value="achievements">
                <AchievementsProfile
                  badges={badges}
                  pendingBadges={pendingBadges}
                  earnedBadges={earnedBadges}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
