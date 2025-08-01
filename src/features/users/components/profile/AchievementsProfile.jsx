import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Users,
  BarChart3,
  FilePlus,
  CheckCircle,
  PlusCircle,
  Edit3,
  Star,
  Target,
  Award,
  Zap,
  Crown,
  UserPlus,
  UserCheck,
  Trophy,
  Maximize2,
  Minimize2,
  CirclePlus,
  CircleCheck,
  Goal,
  Lock,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatRelativeDate } from "@/lib/formatConversationDate";

const AchievementsProfile = ({ badges, pendingBadges, earnedBadges }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);

  const recentBadges = [...earnedBadges]
    .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
    .slice(0, 3);

  const getBadgeIcon = (iconName) => {
    const icons = {
      FilePlus,
      PlusCircle,
      Edit3,
      Star,
      CheckCircle,
      Target,
      Zap,
      Trophy,
      Crown,
      Users,
      UserPlus,
      UserCheck,
      Award,
    };
    return icons[iconName] || Star;
  };

  const isBadgeEarned = (badge) => {
    return earnedBadges.some((earnedBadge) => earnedBadge.id === badge.id);
  };

  const getEarnedBadgeData = (badge) => {
    return earnedBadges.find((earnedBadge) => earnedBadge.id === badge.id);
  };


  const colorMap = {
    gray: "bg-gray-100 border-gray-300 text-gray-700",
    blue: "bg-blue-100 border-blue-300 text-blue-700",
    purple: "bg-purple-100 border-purple-300 text-purple-700",
    green: "bg-green-100 border-green-300 text-green-700",
    emerald: "bg-emerald-100 border-emerald-300 text-emerald-700",
    gold: "bg-yellow-100 border-yellow-400 text-yellow-800",
    cyan: "bg-cyan-100 border-cyan-300 text-cyan-700",
  };

  const lockedColorMap = {
    gray: "bg-gray-50 border-gray-200 text-gray-400",
    blue: "bg-blue-50 border-blue-200 text-blue-400",
    purple: "bg-purple-50 border-purple-200 text-purple-400",
    green: "bg-green-50 border-green-200 text-green-400",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-400",
    gold: "bg-yellow-50 border-yellow-200 text-yellow-400",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-400",
  };

  const badgesByCategory = badges.reduce((acc, badge) => {
    const categoryKey =
      badge.category.charAt(0).toUpperCase() + badge.category.slice(1);
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(badge);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleAllCategories = () => {
    if (showAllCategories) {
      setExpandedCategories({});
    } else {
      const allExpanded = {};
      Object.keys(badgesByCategory).forEach((category) => {
        allExpanded[category] = true;
      });
      setExpandedCategories(allExpanded);
    }
    setShowAllCategories(!showAllCategories);
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      Creation: CirclePlus,
      Completion: CircleCheck,
      Collaboration: Users,
    };
    return categoryIcons[category] || Award;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      Creation: "text-blue-600",
      Completion: "text-green-600",
      Collaboration: "text-cyan-600",
    };
    return categoryColors[category] || "text-gray-600";
  };

  const filteredBadgesByCategory = showOnlyEarned
    ? Object.entries(badgesByCategory).reduce(
        (acc, [category, categoryBadges]) => {
          const earnedCategoryBadges = categoryBadges.filter((badge) =>
            isBadgeEarned(badge)
          );
          if (earnedCategoryBadges.length > 0) {
            acc[category] = earnedCategoryBadges;
          }
          return acc;
        },
        {}
      )
    : badgesByCategory;


   if (badges && badges.length === 0) {
     return (
       <div className="text-center text-muted-foreground py-8">
         No achievements to show
       </div>
     );
   }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Badges by Category
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant={showOnlyEarned ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyEarned(!showOnlyEarned)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                {showOnlyEarned ? "Show All" : "Earned Only"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllCategories}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {showAllCategories ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Contract all</span>
                    <span className="sm:hidden">Contract</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Expand all</span>
                    <span className="sm:hidden">Expand</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(filteredBadgesByCategory).map(
              ([category, categoryBadges]) => {
                const isExpanded = expandedCategories[category];
                const displayedBadges = isExpanded
                  ? categoryBadges
                  : categoryBadges.slice(0, 2);
                const CategoryIcon = getCategoryIcon(category);
                const categoryColorClass = getCategoryColor(category);

                const earnedCount = categoryBadges.filter((badge) =>
                  isBadgeEarned(badge)
                ).length;
                const totalCount = categoryBadges.length;

                return (
                  <div
                    key={category}
                    className="border rounded-lg p-3 sm:p-4 bg-gray-50/50"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          className={`h-4 sm:h-5 w-4 sm:w-5 ${categoryColorClass}`}
                        />
                        <h3 className="font-semibold text-base sm:text-lg">
                          {category}
                        </h3>
                        <span className="text-xs sm:text-sm text-muted-foreground bg-white px-2 py-1 rounded-full">
                          {earnedCount}/{totalCount}
                        </span>
                      </div>
                      {categoryBadges.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category)}
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 sm:h-4 w-3 sm:w-4" />
                              <span className="hidden sm:inline">
                                Show less
                              </span>
                              <span className="sm:hidden">Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 sm:h-4 w-3 sm:w-4" />
                              <span className="hidden sm:inline">
                                See all ({categoryBadges.length - 2} more)
                              </span>
                              <span className="sm:hidden">
                                +{categoryBadges.length - 2}
                              </span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {displayedBadges.map((badge, index) => {
                        const IconComponent = getBadgeIcon(badge.icon);
                        const isEarned = isBadgeEarned(badge);
                        const earnedData = getEarnedBadgeData(badge);
                        const colorClass = isEarned
                          ? colorMap[badge.color]
                          : lockedColorMap[badge.color];

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.01] relative ${colorClass} ${
                              isEarned ? "shadow-sm" : "opacity-60"
                            }`}
                          >
                            {isEarned && (
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            )}

                            {!isEarned && (
                              <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
                                <Lock className="h-3 w-3" />
                              </div>
                            )}

                            <div
                              className={`p-2 rounded-full flex-shrink-0 ${
                                isEarned ? "bg-white shadow-sm" : "bg-gray-100"
                              }`}
                            >
                              <IconComponent
                                className={`h-4 sm:h-5 w-4 sm:w-5 ${
                                  isEarned
                                    ? `text-${badge.color}-600`
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-medium text-xs sm:text-sm truncate ${
                                  isEarned ? "" : "text-gray-500"
                                }`}
                              >
                                {badge.name}
                              </h4>
                              <p
                                className={`text-xs line-clamp-2 ${
                                  isEarned
                                    ? "text-muted-foreground"
                                    : "text-gray-400"
                                }`}
                              >
                                {badge.description}
                              </p>
                              {isEarned && earnedData?.earned_at && (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  Earned{" "}
                                  {formatRelativeDate(earnedData.earned_at)}
                                </p>
                              )}
                              {!isEarned && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Not earned yet
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBadges.length > 0 ? (
            <div className="space-y-4">
              {recentBadges.map((badge, index) => {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.01] relative ${
                      colorMap[badge.color]
                    } shadow-sm`}
                  >
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-pulse">
                      <Sparkles className="h-3 w-3" />
                    </div>

                    <div
                      className={`p-2 rounded-full bg-white shadow-sm flex-shrink-0`}
                    >
                      <IconComponent
                        className={`h-4 sm:h-5 w-4 sm:w-5 text-${badge.color}-600`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm truncate">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {badge.description}
                      </p>
                      {badge.earned_at && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          {formatRelativeDate(badge.earned_at)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm sm:text-base">
                No achievements yet. Start completing tasks to earn badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Goal className="h-4 w-4 mr-2" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBadges.length > 0 ? (
              <div className="space-y-4">
                {pendingBadges.map((badge, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium truncate pr-2">
                        {badge.name}
                      </span>
                      <span className="text-xs sm:text-sm flex-shrink-0">
                        {badge.current_count}/{badge.threshold}
                      </span>
                    </div>
                    <Progress value={badge.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {badge.threshold - badge.current_count} more to unlock
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Goal className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm sm:text-base">
                  All available badges earned! Great job!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Achievement Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {earnedBadges.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Badges Earned
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                {Object.entries(badgesByCategory).map(
                  ([category, categoryBadges]) => {
                    const earnedCount = categoryBadges.filter((badge) =>
                      isBadgeEarned(badge)
                    ).length;
                    const totalCount = categoryBadges.length;
                    return (
                      <div key={category} className="p-2 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-xs sm:text-sm">
                          {earnedCount}/{totalCount}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {category}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">Completion Rate</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {Math.round((earnedBadges.length / badges.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">Next Badge</span>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px]">
                    {pendingBadges.length > 0
                      ? pendingBadges[0]?.name
                      : "All earned!"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementsProfile;
