import BaseService from "../base/baseService";
import SubscriptionService from "./SubscriptionService";

class CommentService extends BaseService {
  static COMMENTS_SELECT = `
    *,
    profiles:user_id (
      full_name
    )
  `;

  static async getComments(taskId, userId) {
    this.validateRequiredId(taskId, "Task ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_task_comments", {
        task_id: taskId,
        current_user_id: userId,
      });

      this.handleError(error, "Error fetching comments");
      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  static createOptimisticComment(content, taskId, user) {
    return {
      id: `temp-${Date.now()}`,
      content,
      task_id: taskId,
      author_name: user?.full_name,
      created_at: new Date().toISOString(),
      is_author: true,
    };
  }

  static async saveComment(content, taskId, user) {
    this.validateRequiredId(user, "User");

    const optimisticComment = this.createOptimisticComment(
      content,
      taskId,
      user
    );

    try {
      await SubscriptionService.handleOptimisticUpdate(
        "comments",
        taskId,
        optimisticComment
      );

      const { data: insertedData, error } = await this.supabase.rpc(
        "create_task_comment",
        { p_user_id: user.id, p_task_id: taskId, p_content: content }
      );
      this.handleError(error, "Error creating comment");
      return insertedData;
    } catch (error) {
      await SubscriptionService.handleOptimisticError(
        "comments",
        taskId,
        optimisticComment,
        error
      );
      throw error;
    }
  }

  static async updateComment(commentId, newContent, userId) {
    this.validateRequiredId(commentId, "Comment ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("update_task_comment", {
        p_user_id: userId,
        p_comment_id: commentId,
        p_content: newContent,
      });

      this.handleError(error, "Error updating comment");
      return data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  static async deleteComment(commentId) {
    this.validateRequiredId(commentId, "Comment ID");

    try {
      const { data, error } = await this.supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      this.handleError(error, "Error deleting comment");
      return data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
}

export default CommentService;
