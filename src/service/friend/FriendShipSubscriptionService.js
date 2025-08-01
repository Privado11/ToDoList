import BaseService from "../base/baseService";

class FriendShipSubscriptionService extends BaseService {
  static subscriptions = {
    friendships: new Map(),
    friendRequests: new Map(),
  };

  static subscribeToUserFriendships(
    userId,
    requestingUserId,
    {
      onFriendshipsChange,
      getFriendships,
      onFriendsListViewedProfile,
      getUserFriendsWithPrivacy,
    }
  ) {
    this.validateRequiredId(requestingUserId, "Requesting User ID");

    if (this.subscriptions.friendships.has(requestingUserId)) {
      this.unsubscribeFromFriendships(requestingUserId);
    }

    const subscription = this.supabase
      .channel(`user-friendships-${requestingUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user1_id=eq.${requestingUserId}`,
        },
        async (payload) => {
          try {
            const updatedFriendships = await getFriendships(requestingUserId);
            onFriendshipsChange?.(updatedFriendships);

            if (userId && requestingUserId) {
              const updatedFriendsList = await getUserFriendsWithPrivacy(
                userId,
                requestingUserId
              );

              onFriendsListViewedProfile(updatedFriendsList);
            }
          } catch (error) {
            console.error("Error updating friendships in real-time:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user2_id=eq.${requestingUserId}`,
        },
        async (payload) => {
          try {
            const updatedFriendships = await getFriendships(requestingUserId);
            onFriendshipsChange?.(updatedFriendships);

            if (userId && requestingUserId) {
              const updatedFriendsList = await getUserFriendsWithPrivacy(
                userId,
                requestingUserId
              );
              onFriendsListViewedProfile(updatedFriendsList);
            }
          } catch (error) {
            console.error("Error updating friendships in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to friendships updates for user ${requestingUserId}`
          );
        }
      });

    this.subscriptions.friendships.set(requestingUserId, {
      subscription,
      handlers: {
        onChange: onFriendshipsChange,
        onFriendsListViewedProfile: onFriendsListViewedProfile,
        getUserFriendsWithPrivacy: getUserFriendsWithPrivacy,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
      userId: userId,
    });

    return subscription;
  }

  static subscribeToUserFriendRequests(
    userId,
    {
      onFriendRequestsChange,
      getFriendRequests,
      onFriendsListViewedProfile,
      getUserFriendsWithPrivacy,
      requestingUserId,
    }
  ) {
    this.validateRequiredId(requestingUserId, "Requesting User ID");

    if (this.subscriptions.friendRequests.has(requestingUserId)) {
      this.unsubscribeFromFriendRequests(requestingUserId);
    }

    const subscription = this.supabase
      .channel(`user-friend-requests-${requestingUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${requestingUserId}`,
        },
        async (payload) => {
          try {
            const updatedFriendRequests = await getFriendRequests(
              requestingUserId
            );
            onFriendRequestsChange?.(updatedFriendRequests);

            if (userId && requestingUserId) {
              const updatedFriendsList = await getUserFriendsWithPrivacy(
                userId,
                requestingUserId
              );
              onFriendsListViewedProfile(updatedFriendsList);
            }
          } catch (error) {
            console.error(
              "Error updating friend requests in real-time:",
              error
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `sender_id=eq.${requestingUserId}`,
        },
        async (payload) => {
          try {
            const updatedFriendRequests = await getFriendRequests(
              requestingUserId
            );
            onFriendRequestsChange?.(updatedFriendRequests);

            if (userId && requestingUserId) {
              const updatedFriendsList = await getUserFriendsWithPrivacy(
                userId,
                requestingUserId
              );
              onFriendsListViewedProfile(updatedFriendsList);
            }
          } catch (error) {
            console.error(
              "Error updating friend requests in real-time:",
              error
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to friend requests updates for user ${requestingUserId}`
          );
        }
      });

    this.subscriptions.friendRequests.set(requestingUserId, {
      subscription,
      handlers: {
        onChange: onFriendRequestsChange,
        onFriendsListViewedProfile: onFriendsListViewedProfile,
        getUserFriendsWithPrivacy: getUserFriendsWithPrivacy,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
      userId: userId,
    });

    return subscription;
  }

  static registerOptimisticHandlers(
    type,
    requestingUserId,
    { onOptimisticUpdate, onOptimisticError }
  ) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(requestingUserId);

    if (subscriptionData) {
      subscriptionData.handlers = {
        ...subscriptionData.handlers,
        onOptimisticUpdate,
        onOptimisticError,
      };
      subscriptionMap.set(requestingUserId, subscriptionData);
    }
  }

  static async handleOptimisticUpdate(type, requestingUserId, optimisticData) {
    const subscriptionData = this.subscriptions[type].get(requestingUserId);
    if (subscriptionData?.handlers.onOptimisticUpdate) {
      await subscriptionData.handlers.onOptimisticUpdate(optimisticData);
    }
  }

  static async handleOptimisticError(
    type,
    requestingUserId,
    optimisticData,
    error
  ) {
    const subscriptionData = this.subscriptions[type].get(requestingUserId);
    if (subscriptionData?.handlers.onOptimisticError) {
      await subscriptionData.handlers.onOptimisticError(optimisticData, error);
    }
  }

  static clearSubscription(type, id) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(id);

    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      subscriptionMap.delete(id);
      console.log(`Cleared ${type} subscription for ${id}`);
    }
  }

  static unsubscribeFromFriendships(requestingUserId) {
    this.clearSubscription("friendships", requestingUserId);
  }

  static unsubscribeFromFriendRequests(requestingUserId) {
    this.clearSubscription("friendRequests", requestingUserId);
  }

  static unsubscribeFromAll() {
    this.subscriptions.friendships.forEach(
      (subscriptionData, requestingUserId) => {
        subscriptionData.subscription.unsubscribe();
        console.log(
          `Unsubscribed from friendships updates for user ${requestingUserId}`
        );
      }
    );
    this.subscriptions.friendships.clear();

    this.subscriptions.friendRequests.forEach(
      (subscriptionData, requestingUserId) => {
        subscriptionData.subscription.unsubscribe();
        console.log(
          `Unsubscribed from friend requests updates for user ${requestingUserId}`
        );
      }
    );
    this.subscriptions.friendRequests.clear();
  }
}

export default FriendShipSubscriptionService;
