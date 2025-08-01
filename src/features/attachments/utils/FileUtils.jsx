import {
  BsFiletypeXlsx,
  BsFiletypePdf,
  BsFiletypePptx,
  BsFiletypePng,
  BsFiletypeJpg,
  BsFiletypeSvg,
  BsFileImage,
  BsFileEarmarkText,
  BsFileEarmarkCode,
  BsFileEarmarkZip,
  BsFileEarmark,
  BsFiletypeDocx,
  BsFiletypeJson,
} from "react-icons/bs";

export const fileUtils = {
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
      sizes[i]
    }`;
  },

  getFileIcon: (fileType) => {
    // Image types
    if (fileType.includes("image/jpeg") || fileType.includes("image/jpg"))
      return BsFiletypeJpg;
    if (fileType.includes("image/png")) return BsFiletypePng;
    if (fileType.includes("image/svg")) return BsFiletypeSvg;
    if (fileType.startsWith("image/")) return BsFileImage;

    // Document types
    if (fileType.includes("application/pdf") || fileType.includes("pdf"))
      return BsFiletypePdf;
    if (
      fileType.includes("application/msword") ||
      fileType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    )
      return BsFiletypeDocx;

    // Spreadsheet types
    if (
      fileType.includes("application/vnd.ms-excel") ||
      fileType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) ||
      fileType.includes("xlsx") ||
      fileType.includes("xls")
    )
      return BsFiletypeXlsx;

    // Presentation types
    if (
      fileType.includes("application/vnd.ms-powerpoint") ||
      fileType.includes(
        "application/vnd.openxmlformats-officedocument.presentationml"
      ) ||
      fileType.includes("pptx") ||
      fileType.includes("ppt")
    )
      return BsFiletypePptx;

    // Text and code types
    if (fileType.includes("text/plain") || fileType.includes("txt"))
      return BsFileEarmarkText;
    if (
      fileType.includes("text/html") ||
      fileType.includes("text/css") ||
      fileType.includes("text/javascript") ||
      fileType.includes("application/javascript") ||
      fileType.includes("html") ||
      fileType.includes("css") ||
      fileType.includes("js")
    )
      return BsFileEarmarkCode;
    if (fileType.includes("application/json") || fileType.includes("json"))
      return BsFiletypeJson;

    // Archive types
    if (
      fileType.includes("application/zip") ||
      fileType.includes("application/x-rar-compressed") ||
      fileType.includes("application/x-7z-compressed") ||
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("7z")
    )
      return BsFileEarmarkZip;

    // Generic document fallback
    if (fileType.includes("document")) return BsFileEarmarkText;

    return BsFileEarmark;
  },

  renderFileIcon: (fileType, className = "h-5 w-5") => {
    const IconComponent = fileUtils.getFileIcon(fileType);
    return <IconComponent className={className} />;
  },
};
