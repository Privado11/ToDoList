import BaseService from "../base/baseService";
import { supabase } from "../base/supabase";

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

  static MAX_FILE_SIZE = 10 * 1024 * 1024;

  static validateFile(file) {
    if (!file) {
      throw new Error("File is required");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          this.MAX_FILE_SIZE / 1024 / 1024
        }MB`
      );
    }
  }

  static async uploadAttachment(file, taskId, temp = false) {
    try {
      this.validateFile(file);
      this.validateRequiredId(taskId, "Task ID");

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `${taskId}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      this.handleError(error, "Error uploading attachment");

      

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(data.path);

     
      const currentTaskId = temp ? null : taskId;

      const attachmentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        task_id: currentTaskId,
        is_temp: temp,
        created_at: new Date().toISOString(),
      };

    

      const attachment = await this.createAttachment(attachmentData);
      return attachment;
    } catch (error) {
     
      throw this.formatError(error);
    }
  }

  static async createAttachment(attachmentData) {
    try {
      const { data, error } = await supabase
        .from("attachments")
        .insert(attachmentData)
        .select();

      if (error) {
        throw new Error(`Error creating attachment: ${error.message}`);
      }

      return data[0];
    } catch (error) {
      console.error("Error in createAttachment:", error);
      throw this.formatError(error);
    }
  }

  static async reassignAttachmentsToTask(realTaskId, attachment) {
    try {
      const { data, error } = await supabase
        .from("attachments")
        .update({ task_id: realTaskId, is_temp: false })
        .eq("id", attachment.id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Error reassigning attachments:", err);
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
      const attachment = await this.getAttachmentById(id);
      if (!attachment) {
        throw new Error(`Attachment with ID ${id} not found`);
      }

      const fileUrl = new URL(attachment.file_url);
      const encodedFileName = fileUrl.pathname.split("/").pop();
      const fileName = decodeURIComponent(encodedFileName);

      const filePath = `${attachment.task_id}/${fileName}`;
      console.log(`Attempting to delete file: ${filePath}`);

      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([filePath]);

      if (storageError) {
        console.error(
          `Error deleting file from storage: ${storageError.message}`
        );
        throw new Error(
          `Error deleting file from storage: ${storageError.message}`
        );
      }

      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", id);

      if (dbError) {
        throw new Error(`Error deleting attachment record: ${dbError.message}`);
      }

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
}

export default AttachmentService;
