import BaseService from "../base/baseService";

class FriendShipService extends BaseService {
  static PENDING_FRIEND_REQUEST_SELECT = `
    id,
    status, 
    create_at,
    update_at,
    sender:profiles!sender_id (
        id,
        full_name,
        username,
        avatar_url
    ),
    recipient:profiles!!recipient_id (
        id,
        full_name,
        username,
        avatar_url
    )
  `;

  static FRIEND_LIST_SELECT = `
    id,
    status, 
    create_at,
    update_at,
    user1:profiles!user_id1 (
        id,
        full_name,
        username,
        avatar_url
    ),
     user2:profiles!user_id2 (
        id,
        full_name,
        username,
        avatar_url
    )
  `;

  static DEFAULT_FRIENDSHIP_RELATIONS = {
    profiles: [],
  };

  static formatTaskResponse(data) {
    if (!data) return null;
    return {
      ...data,
      ...this.DEFAULT_FRIENDSHIP_RELATIONS,
      profiles: data.profiles || [],
    };
  }

  static async getPendingFriendRequestsByUserId(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("friend_requests")
        .select(this.PENDING_FRIEND_REQUEST_SELECT)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      this.handleError(error, "Error fetching pending friend requests");
      return this.formatTaskResponse(data);
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

  static async requestFriendship(friendId, userId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(friendId, "Friend ID");

    try {
      const { data, error } = await this.supabase.rcp("send_friend_request", {
        sender_id: userId,
        receiver_id: friendId,
      });
      this.handleError(error, "Error request friendship");
      return data?.[0];
    } catch (error) {
      console.error("Error request friendship:", error);
      throw error;
    }
  }

  static async deleteFriendship(friendshipId) {
    this.validateRequiredId(friendshipId, "Friendship ID");

    try {
      const { data, error } = await this.supabase.rpc("delete_friendship", {
        friendship_id: friendshipId,
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
        friend_request_id: friendRequestId,
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
        friend_request_id: friendRequestId,
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
        friend_request_id: friendRequestId,
      });

      this.handleError(error, "Error canceling friend request");
      return data?.[0];
    } catch (error) {
      console.error("Error canceling friend request:", error);
      throw error;
    }
  }
}

export default FriendShipService;
