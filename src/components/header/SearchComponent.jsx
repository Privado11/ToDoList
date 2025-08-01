import React, { useState, useRef, useEffect } from "react";
import { Search, X, CheckCircle, Clock, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserActionButtons from "./UserActionButtons";
import { useNavigate } from "react-router-dom";
import { usePopover, useProfileContext, useTaskContext } from "@/context";

const STATUS_CONFIG = {
  Completed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  Progress: {
    icon: RotateCw,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
};

function SearchComponent({ user }) {
  const {
    query,
    setQuery,
    users,
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelledFriendRequest,
    loading,
    error,
  } = useProfileContext();
  const { tasks } = useTaskContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const { closePopover } = usePopover();
  const placeholderText =
    user && user.is_anonymous ? "Search tasks..." : "Search tasks and users...";

  const getFilteredResults = () => {
    const filteredTasks = query
      ? tasks.filter((task) =>
          task.title.toLowerCase().includes(query.toLowerCase())
        )
      : [];

    const filteredUsers = query
      ? users.filter(
          (user) =>
            user.full_name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
        )
      : [];

    switch (activeTab) {
      case "tasks":
        return { tasks: filteredTasks, users: [] };
      case "users":
        return { tasks: [], users: filteredUsers };
      default:
        return { tasks: filteredTasks, users: filteredUsers };
    }
  };

  const { tasks: filteredTasks, users: filteredUsers } = getFilteredResults();
  const hasResults = filteredTasks.length > 0 || filteredUsers.length > 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
        setShowResults(false);
        setActiveTab("all");
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setShowResults(query.length > 0);
  }, [query]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const handleActionUser = async (user, action) => {
    try {
      const actionHandlers = {
        addFriend: () => addFriend(user.user_id),
        message: () => navigateToChat(user.user_id),
        cancelFriendRequest: () =>
          cancelledFriendRequest(user.friend_request_id),
        acceptFriendRequest: () => acceptFriendRequest(user.friend_request_id),
        rejectFriendRequest: () => rejectFriendRequest(user.friend_request_id),
      };

      if (actionHandlers[action]) {
        await actionHandlers[action]();

        return { success: true, user, action };
      } else {
        return { success: false, error: `Unknown action: ${action}` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleOpenDetail = (id) => {
    setIsSearchOpen(false);
    setShowResults(false);
    setActiveTab("all");
    setQuery("");
    closePopover();
    navigate(`/task-detail/${id}`);
  };

  const scrollbarStyle =
    "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full";

  return (
    <div className="w-full h-full" ref={searchInputRef}>
      <div className="relative hidden md:flex md:flex-col w-full h-full">
        <div className="flex items-center w-full h-full">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder={placeholderText}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 bg-background"
            aria-label={placeholderText}
          />
        </div>

        {showResults && (
          <div
            ref={resultsRef}
            className={`absolute top-full z-[9999] w-full mt-1 bg-white rounded-md border shadow-lg max-h-96 overflow-y-auto ${scrollbarStyle}`}
          >
            <div className="flex border-b sticky top-0 bg-white z-30 shadow-sm">
              <button
                className={`flex-1 py-2 text-basefont-medium ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`flex-1 py-2 text-base font-medium ${
                  activeTab === "tasks"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks ({filteredTasks.length})
              </button>
              <button
                className={`flex-1 py-2 text-base font-medium ${
                  activeTab === "users"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users ({filteredUsers.length})
              </button>
            </div>

            <div className="relative">
              {hasResults ? (
                <div>
                  {filteredTasks.length > 0 &&
                    (activeTab === "all" || activeTab === "tasks") && (
                      <div>
                        {activeTab === "all" && (
                          <div className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-50 sticky top-[38px] z-20 border-b">
                            TASKS
                          </div>
                        )}
                        <ul>
                          {filteredTasks.map((task) => {
                            const statusConfig =
                              STATUS_CONFIG[task.statuses.name];
                            const Icon = statusConfig?.icon;

                            return (
                              <li
                                key={task.id}
                                className="border-b last:border-b-0"
                              >
                                <button
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 relative group"
                                  onClick={() => handleOpenDetail(task.id)}
                                >
                                  <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-2">
                                      {Icon && (
                                        <Icon
                                          className={`w-3 h-3 ${statusConfig.color}`}
                                        />
                                      )}
                                      <div className="font-medium text-base truncate max-w-[200px]">
                                        {task.title}
                                      </div>
                                    </div>
                                    {task.description && (
                                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                        {task.description}
                                      </div>
                                    )}
                                    <div className="flex justify-between mt-1">
                                      <span
                                        className={`text-xs ${getPriorityColor(
                                          task.priorities.level
                                        )}`}
                                      >
                                        {task.priorities.level}
                                      </span>
                                      {task.due_date && (
                                        <span className="text-xs text-gray-500">
                                          Due {formatDate(task.due_date)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                  {filteredUsers.length > 0 &&
                    (activeTab === "all" || activeTab === "users") && (
                      <div>
                        {activeTab === "all" && (
                          <div className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-50 sticky top-[38px] z-20 border-b">
                            USERS
                          </div>
                        )}
                        <ul>
                          {filteredUsers.map((user) => (
                            <li
                              key={user.user_id}
                              className="border-b last:border-b-0"
                            >
                              <div className="w-full text-left  py-2">
                                <div className="relative z-10">
                                  <div className="flex flex-col">
                                    <div className="w-full px-3 relative group hover:bg-gray-100 transition-colors duration-150 py-2 cursor-pointer">
                                      <div className="flex items-center gap-3 relative z-10">
                                        <Avatar className="h-12 w-12">
                                          <AvatarImage
                                            src={user.avatar_url}
                                            alt={user.full_name}
                                          />
                                          <AvatarFallback>
                                            {user.full_name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>

                                        <div>
                                          <div className="font-medium text-base ">
                                            {user.full_name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {user.username}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <UserActionButtons
                                      user={user}
                                      handleAction={handleActionUser}
                                    />
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden h-full">
        {isSearchOpen ? (
          <div className="fixed inset-0 z-[9999] bg-white md:hidden flex flex-col">
            <div className="flex h-16 w-13 items-center gap-2 border-b px-10 sticky top-0 bg-white z-50 shadow-sm">
              <Input
                type="search"
                placeholder={placeholderText}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowResults(false);
                  setActiveTab("all");
                  setQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {showResults && (
              <div className="absolute top-14 flex flex-col w-full overflow-y-auto h-screen">
                <div className="flex border-b sticky  bg-white z-40 shadow-sm">
                  <button
                    className={`flex-1 py-2 text-base font-medium ${
                      activeTab === "all"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    All
                  </button>
                  <button
                    className={`flex-1 py-2 text-base font-medium ${
                      activeTab === "filteredTasks"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("tasks")}
                  >
                    Tasks ({filteredTasks.length})
                  </button>
                  <button
                    className={`flex-1 py-2 text-base font-medium ${
                      activeTab === "users"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("users")}
                  >
                    Users ({filteredUsers.length})
                  </button>
                </div>

                <div
                  className={`relative overflow-y-auto flex-1 ${scrollbarStyle} bg-white rounded-b-xl shadow-md`}
                >
                  {hasResults ? (
                    <div className="relative">
                      {filteredTasks.length > 0 &&
                        (activeTab === "all" || activeTab === "tasks") && (
                          <div>
                            {activeTab === "all" && (
                              <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50 sticky z-30 border-b">
                                TASKS
                              </div>
                            )}
                            <ul className="divide-y">
                              {filteredTasks.map((task) => {
                                const statusConfig =
                                  STATUS_CONFIG[task.statuses.name];
                                const Icon = statusConfig?.icon;

                                return (
                                  <li key={task.id}>
                                    <button
                                      className="w-full text-left p-2 hover:bg-gray-100 transition-colors duration-150 relative group"
                                      onClick={() => handleOpenDetail(task.id)}
                                    >
                                      <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                                      <div className="relative z-10">
                                        <div className="flex items-center gap-2">
                                          {Icon && (
                                            <Icon
                                              className={`w-3 h-3 ${statusConfig.color}`}
                                            />
                                          )}
                                          <div className="font-medium text-lg truncate">
                                            {task.title}
                                          </div>
                                        </div>
                                        {task.description && (
                                          <div className="text-base text-gray-500 mt-2 ml-7 line-clamp-3">
                                            {task.description}
                                          </div>
                                        )}
                                        <div className="flex justify-between mt-2 ml-7">
                                          <span
                                            className={`text-sm ${getPriorityColor(
                                              task.priorities.level
                                            )}`}
                                          >
                                            {task.priorities.level}
                                          </span>
                                          {task.due_date && (
                                            <span className="text-sm text-gray-500">
                                              Due {formatDate(task.due_date)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                      {filteredUsers.length > 0 &&
                        (activeTab === "all" || activeTab === "users") && (
                          <div>
                            {activeTab === "all" && (
                              <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50 sticky top-0 z-30 border-b">
                                USERS
                              </div>
                            )}
                            <ul className="divide-y">
                              {filteredUsers.map((user) => (
                                <li key={user.user_id}>
                                  <button className="w-full text-left p-2 hover:bg-gray-100 transition-colors duration-150 relative group">
                                    <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                                    <div className="relative z-10">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-12 w-12">
                                            <AvatarImage
                                              src={user.avatar_url}
                                              alt={user.full_name}
                                            />
                                            <AvatarFallback>
                                              {user.full_name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-medium text-lg">
                                              {user.full_name}
                                            </div>
                                            <div className="text-base text-gray-500">
                                              {user.username}
                                            </div>
                                          </div>
                                        </div>

                                        <UserActionButtons
                                          user={user}
                                          handleAction={handleActionUser}
                                        />
                                      </div>
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-base">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="flex md:hidden h-full"
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="!w-5 !h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SearchComponent;
