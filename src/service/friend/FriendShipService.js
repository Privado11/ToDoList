import BaseService from "../base/baseService";

class FriendShipService extends BaseService {
  static async getPendingFriendRequests(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_pending_friend_requests",
        {
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching pending friend requests");
      return data || [];
    } catch (error) {
      console.error("Error fetching pending friend requests:", error);
      throw error;
    }
  }

  static async getFriendshipsByUserId(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_friendships_by_user_id",
        {
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching friendships");
      return data || [];
    } catch (error) {
      console.error("Error fetching friendships:", error);
      throw error;
    }
  }

  static async getUserFriendsWithPrivacy(userId, requestingUserId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(requestingUserId, "Requesting User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_user_friends_with_privacy",
        {
          user_id: userId,
          requesting_user_id: requestingUserId,
        }
      );

      this.handleError(error, "Error fetching friendships overview");
      return data || [];
    } catch (error) {
      console.error("Error fetching friendships overview:", error);
      throw error;
    }
  }

  static async requestFriendship(friendId, userId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(friendId, "Friend ID");

    try {
      const { data, error } = await this.supabase.rpc("send_friend_request", {
        sender_id: userId,
        receiver_id: friendId,
      });
      this.handleError(error, "Error request friendship");
      return data;
    } catch (error) {
      console.error("Error request friendship:", error);
      throw error;
    }
  }

  static async deleteFriendship(friendId) {
    this.validateRequiredId(friendId, "Friend ID");

    try {
      const { data, error } = await this.supabase.rpc("deleted_friendship", {
        friend_id: friendId,
      });

      this.handleError(error, "Error deleting friendship");
      return data?.[0];
    } catch (error) {
      console.error("Error deleting friendship:", error);
      throw error;
    }
  }

  static async acceptFriendRequest(friendRequestId) {
    this.validateRequiredId(friendRequestId, "Friend Request ID");

    try {
      const { data, error } = await this.supabase.rpc("accept_friend_request", {
        request_id: friendRequestId,
      });

      this.handleError(error, "Error accepting friend request");
      return data?.[0];
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  }

  static async rejectFriendRequest(friendRequestId) {
    this.validateRequiredId(friendRequestId, "Friend Request ID");

    try {
      const { data, error } = await this.supabase.rpc("reject_friend_request", {
        friendrequestid: friendRequestId,
      });

      this.handleError(error, "Error rejecting friend request");
      return data?.[0];
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw error;
    }
  }

  static async cancelFriendRequest(friendRequestId) {
    this.validateRequiredId(friendRequestId, "Friend Request ID");

    try {
      const { data, error } = await this.supabase.rpc("cancel_friend_request", {
        friendrequestid: friendRequestId,
      });

      this.handleError(error, "Error canceling friend request");
      return data?.[0];
    } catch (error) {
      console.error("Error canceling friend request:", error);
      throw error;
    }
  }

  static async searchUsers(query, currentUserId) {
    this.validateRequiredId(currentUserId, "Current User ID");

    try {
      const { data, error } = await this.supabase.rpc("search_users", {
        current_user_id: currentUserId,
        search_query: query,
      });

      this.handleError(error, "Error searching users");

      return data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error(error.message);
    }
  }

  static async getUserById(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .single();

      this.handleError(error, "Error fetching user");

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async blockUser(
    blockerId,
    blockedId,
    reason = "No specific reason provided"
  ) {
    this.validateRequiredId(blockerId, "Blocker ID");
    this.validateRequiredId(blockedId, "Blocked ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "block_user_cascade_delete",
        {
          blocker_user_id: blockerId,
          blocked_user_id: blockedId,
          block_reason: reason,
        }
      );

      this.handleError(error, "Error blocking user");

      return data?.[0];
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  }

  static async unblockUser(id) {
    this.validateRequiredId(id, "ID");

    try {
      const { data, error } = await this.supabase
        .from("blocked_users")
        .delete()
        .eq("id", id)
        .select();

      this.handleError(error, "Error unblocking user");

      return data?.[0];
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  }

  static async getBlockedUsers(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_blocked_users", {
        user_id: userId,
      });

      this.handleError(error, "Error fetching blocked users");

      return data || [];
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      throw error;
    }
  }
}

export default FriendShipService;
