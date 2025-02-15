import BaseService from "../BaseService";
import { supabase } from "../supabase";

class AttachmentService extends BaseService {
  static ATTACHMENT_LIST_SELECT = `
    id,
    file_name,
    file_type,
    file_size,
    file_url,
    task_id,
    created_at
  `;

  // Define allowed file types and max file size (e.g., 10MB)
  static ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain",
  ];
  static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  static validateFile(file) {
    if (!file) {
      throw new Error("File is required");
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_FILE_TYPES.join(
          ", "
        )}`
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          this.MAX_FILE_SIZE / 1024 / 1024
        }MB`
      );
    }
  }

  static async uploadAttachment(file, taskId) {
    try {
      this.validateFile(file);
      this.validateRequiredId(taskId, "Task ID");

      // Generate a unique file name to prevent collisions
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `${taskId}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      this.handleError(error, "Error uploading attachment");

      console.log("Uploaded attachment data:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(data.path);

      console.log("Public URL:", data.path);

      const attachmentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        task_id: taskId,
        created_at: new Date().toISOString(),
      };

      console.log("Create attachment data:", attachmentData);

      const attachment = await this.createAttachment(attachmentData);
      return attachment;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw this.formatError(error);
    }
  }

  static async createAttachment(attachmentData) {
    try {
      

      // Insert the attachment data into the database
      const { data, error } = await supabase
        .from("attachments")
        .insert(attachmentData)
        .select();

      // Handle any errors during insertion
      if (error) {
        throw new Error(`Error creating attachment: ${error.message}`);
      }

      // Return the created attachment
      return data[0]; // Assuming the first record is the one inserted
    } catch (error) {
      console.error("Error in createAttachment:", error);
      throw this.formatError(error); // Format the error if you have a custom error handler
    }
  }

  static async getAttachmentsByTaskId(taskId, options = {}) {
    this.validateRequiredId(taskId, "Task ID");

    try {
      const {
        limit = 50,
        offset = 0,
        orderBy = "created_at",
        ascending = false,
      } = options;

      const query = this.supabase
        .from("attachments")
        .select(this.ATTACHMENT_LIST_SELECT)
        .eq("task_id", taskId)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      this.handleError(error, "Error fetching attachments");
      return data || [];
    } catch (error) {
      console.error("Error fetching attachments:", error);
      throw this.formatError(error);
    }
  }

  static async getAttachmentById(id) {
    this.validateRequiredId(id, "Attachment ID");

    try {
      const { data, error } = await this.supabase
        .from("attachments")
        .select(this.ATTACHMENT_LIST_SELECT)
        .eq("id", id)
        .single();

      this.handleError(error, "Error fetching attachment");

      if (!data) {
        throw new Error(`Attachment with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching attachment:", error);
      throw this.formatError(error);
    }
  }

  static async deleteAttachment(id) {
    this.validateRequiredId(id, "Attachment ID");

    try {
      // First get the attachment to get the file path
      const attachment = await this.getAttachmentById(id);
      if (!attachment) {
        throw new Error(`Attachment with ID ${id} not found`);
      }

      // Delete from storage first
      const fileName = attachment.file_url.split("/").pop();
      const filePath = `${attachment.task_id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([filePath]);

      if (storageError) {
        throw new Error(
          `Error deleting file from storage: ${storageError.message}`
        );
      }

      // Then delete from database
      const { error: dbError } = await this.supabase
        .from("attachments")
        .delete()
        .eq("id", id);

      this.handleError(dbError, "Error deleting attachment");
      return true;
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw this.formatError(error);
    }
  }

  static formatError(error) {
    return {
      message: error.message || "An unknown error occurred",
      code: error.code || "UNKNOWN_ERROR",
      details: error.details || null,
    };
  }

  static async bulkDeleteAttachments(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Must provide an array of attachment IDs");
    }

    try {
      // Get all attachments first
      const { data: attachments, error: fetchError } = await this.supabase
        .from("attachments")
        .select(this.ATTACHMENT_LIST_SELECT)
        .in("id", ids);

      this.handleError(
        fetchError,
        "Error fetching attachments for bulk delete"
      );

      // Delete files from storage
      const filePaths = attachments.map((attachment) => {
        const fileName = attachment.file_url.split("/").pop();
        return `${attachment.task_id}/${fileName}`;
      });

      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove(filePaths);

      if (storageError) {
        throw new Error(
          `Error deleting files from storage: ${storageError.message}`
        );
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from("attachments")
        .delete()
        .in("id", ids);

      this.handleError(dbError, "Error deleting attachments");
      return true;
    } catch (error) {
      console.error("Error bulk deleting attachments:", error);
      throw this.formatError(error);
    }
  }
}

export default AttachmentService;
