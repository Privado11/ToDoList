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

  // Define allowed file types and max file size (e.g., 10MB)
  static ALLOWED_FILE_TYPES = [
    // 🖼️ Imágenes
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/bmp",
    "image/tiff",

    // 📄 Documentos
    "application/pdf",
    "text/plain",

    // 📝 Archivos de Word
    "application/msword", // .doc (Word antiguo)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx (Word moderno)

    // 📊 Archivos de Excel
    "application/vnd.ms-excel", // .xls (Excel antiguo)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx (Excel moderno)

    // 📽️ Archivos de PowerPoint
    "application/vnd.ms-powerpoint", // .ppt (PowerPoint antiguo)
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx (PowerPoint moderno)

    // 🗜️ Archivos Comprimidos
    "application/zip", // .zip
    "application/x-rar-compressed", // .rar
    "application/x-7z-compressed", // .7z
    "application/gzip", // .gz
    "application/x-tar", // .tar
    "application/x-bzip", // .bz
    "application/x-bzip2", // .bz2
    "application/vnd.rar", // .rar (alternativo)
    "application/x-zip-compressed", // .zip (alternativo)
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
      // Obtener información del adjunto
      const attachment = await this.getAttachmentById(id);
      if (!attachment) {
        throw new Error(`Attachment with ID ${id} not found`);
      }

      // Extraer y decodificar la ruta del archivo
      const fileUrl = new URL(attachment.file_url);
      const encodedFileName = fileUrl.pathname.split("/").pop();
      const fileName = decodeURIComponent(encodedFileName); // Decodifica %20 y otros caracteres URL

      const filePath = `${attachment.task_id}/${fileName}`;
      console.log(`Attempting to delete file: ${filePath}`);

      // Eliminar el archivo del bucket
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

      // Eliminar el registro de la base de datos
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

  static async bulkDeleteAttachments(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Must provide an array of attachment IDs");
    }

    try {
      // Obtener información de todos los adjuntos
      const { data: attachments, error: fetchError } = await supabase
        .from("attachments")
        .select("id, file_url, task_id")
        .in("id", ids);

      if (fetchError) {
        throw new Error(
          `Error fetching attachments for bulk delete: ${fetchError.message}`
        );
      }

      if (!attachments || attachments.length === 0) {
        return true; // Nada que eliminar
      }

      // Construir rutas de archivo para eliminación
      const filePaths = attachments.map((attachment) => {
        try {
          const fileUrl = new URL(attachment.file_url);
          const encodedFileName = fileUrl.pathname.split("/").pop();
          const fileName = decodeURIComponent(encodedFileName); // Decodifica %20 y otros caracteres URL
          return `${attachment.task_id}/${fileName}`;
        } catch (error) {
          console.error(
            `Error parsing URL for attachment ${attachment.id}:`,
            error
          );
          // Si hay error al parsear la URL, intentamos con el método básico
          const parts = attachment.file_url.split("/");
          const encodedFileName = parts[parts.length - 1];
          const fileName = decodeURIComponent(encodedFileName);
          return `${attachment.task_id}/${fileName}`;
        }
      });

      console.log("File paths to delete:", filePaths);

      // Eliminar archivos del almacenamiento
      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove(filePaths);

      if (storageError) {
        throw new Error(
          `Error deleting files from storage: ${storageError.message}`
        );
      }

      // Eliminar registros de la base de datos
      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .in("id", ids);

      if (dbError) {
        throw new Error(
          `Error deleting attachment records: ${dbError.message}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error bulk deleting attachments:", error);
      throw this.formatError(error);
    }
  }
}

export default AttachmentService;
