import BaseService from "../BaseService";
import SubscriptionService from "./SubscriptionService";

class CommentService extends BaseService {
  static COMMENTS_SELECT = `
    *,
    profiles:user_id (
      full_name
    )
  `;

  static async getComments(taskId) {
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase
        .from("comments")
        .select(this.COMMENTS_SELECT)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

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
      profiles: {
        full_name: user?.user_metadata?.full_name,
      },
      created_at: new Date().toISOString(),
    };
  }

  static async saveComment(content, taskId, userId) {
    this.validateRequiredId(userId, "User ID");

    const optimisticComment = this.createOptimisticComment(
      content,
      taskId,
      userId
    );

    try {
      await SubscriptionService.handleOptimisticUpdate(
        "comments",
        taskId,
        optimisticComment
      );

      const { data: insertedData, error } = await this.supabase.rpc(
        "create_task_comment",
        { p_user_id: userId, p_task_id: taskId, p_content: content }
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

  static async updateComment(commentId, newContent) {
    this.validateRequiredId(commentId, "Comment ID");

    try {
      const { data, error } = await this.supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .select();

      this.handleError(error, "Error updating comment");
      return data[0];
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
