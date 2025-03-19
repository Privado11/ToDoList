import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FileUploadProgress } from "./FileUploadProgress";
import { AttachmentList } from "./AttachmentList";
import { DialogConfirmation } from "./DialogConfirmation";
import { useTaskContext } from "@/context/TaskContext";


function NewTask() {
  const {
    createTask,
    updateTask,
    selectedTask,
    getTaskById,
    loading,
    clearSelectedTask,
    categories,
    priorities,
    statuses,
    uploadAttachment,
    deleteAttachment,
    attachments,
  } = useTaskContext();

  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    console.log(attachments);
  }, [attachments]);

  const initialTaskState = {
    title: "",
    description: "",
    category_id: null,
    due_date: null,
    status_id: 1,
    priority_id: 1,
    completed: false,
  };

  const [task, setTask] = useState(initialTaskState);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState([]);

  useEffect(() => {
    console.log(task);
  }, [task]);

  useEffect(() => {
    const loadTask = async () => {
      if (id && isInitialLoad) {
        console.log("Loading task details...");
        try {
          await getTaskById(id);
          setIsInitialLoad(false);
        } catch (error) {
          console.error("Error loading task:", error);
          navigate("/");
        }
      } else if (!id) {
        setTask(initialTaskState);
        clearSelectedTask();
      }
    };

    loadTask();

    return () => {
      clearSelectedTask();
    };
  }, [id]);

  useEffect(() => {
    if (selectedTask && id) {
      setTask(selectedTask.task || selectedTask);
    }
  }, [selectedTask, id]);

  const onInputChange = (e) => {
    console.log("Entra");
    console.log(e.target.name, e.target.value);
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);

      for (const file of files) {
        const uploadId =
          Date.now() + "-" + Math.random().toString(36).substring(2, 15);

        setUploading((prev) => [
          ...prev,
          {
            id: uploadId,
            file,
            progress: 0,
            isComplete: false,
          },
        ]);

        try {
          const progressInterval = setInterval(() => {
            setUploading((prev) =>
              prev.map((item) =>
                item.id === uploadId && item.progress < 100
                  ? { ...item, progress: Math.min(item.progress + 10, 100) }
                  : item
              )
            );
          }, 300);

          await uploadAttachment(file);

          clearInterval(progressInterval);

          setUploading((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, progress: 100, isComplete: true }
                : item
            )
          );

          setTimeout(() => {
            setUploading((prev) => prev.filter((item) => item.id !== uploadId));
          }, 2000);
        } catch (error) {
          console.error("Error uploading file:", error);
          setUploading((prev) => prev.filter((item) => item.id !== uploadId));
        }
      }
    },
    [uploadAttachment]
  );

  const handleCancelUpload = (uploadId) => {
    setUploading((prev) => prev.filter((item) => item.id !== uploadId));
  };

  const handleFileSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);

      for (const file of files) {
        const uploadId =
          Date.now() + "-" + Math.random().toString(36).substring(2, 15);

        setUploading((prev) => [
          ...prev,
          {
            id: uploadId,
            file,
            progress: 0,
            isComplete: false,
          },
        ]);

        try {
          const progressInterval = setInterval(() => {
            setUploading((prev) =>
              prev.map((item) =>
                item.id === uploadId && item.progress < 100
                  ? { ...item, progress: Math.min(item.progress + 10, 100) }
                  : item
              )
            );
          }, 300);

          await uploadAttachment(file);

          clearInterval(progressInterval);

          setUploading((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, progress: 100, isComplete: true }
                : item
            )
          );

          setTimeout(() => {
            setUploading((prev) => prev.filter((item) => item.id !== uploadId));
          }, 2000);
        } catch (error) {
          console.error("Error uploading file:", error);

          setUploading((prev) => prev.filter((item) => item.id !== uploadId));
        }
      }
    },
    [uploadAttachment]
  );

  const handleDeleteAttachment = async (attachmentIds) => {
    try {
      // Si es un array, eliminar todos los IDs
      if (Array.isArray(attachmentIds)) {
        for (const id of attachmentIds) {
          await deleteAttachment(id);
        }
      } else {
        // Si es un solo ID
        await deleteAttachment(attachmentIds);
      }
      setSelectedAttachments([]);
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const handleSubmitForm = async () => {
    if (task?.title.trim() === "") {
      alert("Task title is required!");
      return;
    }

    try {
      // Si hay archivos seleccionados, eliminarlos primero
      if (selectedAttachments.length > 0) {
        await handleDeleteAttachment(selectedAttachments);
      }

      if (id) {
        await updateTask(id, task);
        navigate(`/task-detail/${id}`);
      } else {
        await createTask(task);
        navigate("/");
      }
    } catch (error) {
      alert("Error saving task: " + error.message);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Si hay archivos seleccionados y estamos editando, mostrar confirmación
    if (selectedAttachments.length > 0 && id) {
      setShowDeleteConfirmation(true);
    } else {
      // Si no hay archivos seleccionados o es una nueva tarea, proceder normalmente
      handleSubmitForm();
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading task details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Card className="max-w-2xl mx-auto" />
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          {id ? "Edit Task" : "New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="title" className="text-xl font-bold">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              required={true}
              value={task?.title || ""}
              onChange={onInputChange}
              placeholder="Enter the title of the task"
              className="w-full text-lg py-4 "
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xl font-bold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={task?.description || ""}
              onChange={onInputChange}
              placeholder="Describe the task in detail"
              className="w-full min-h-[8rem] max-h-[15rem] text-lg resize-none overflow-auto"
              style={{ height: "auto" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  320
                )}px`;
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xl font-bold">Due Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={
                    task?.due_date
                      ? new Date(task.due_date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={onInputChange}
                  className="w-full text-lg py-4 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label className="text-xl font-bold">Category</Label>
              <Select
                value={task?.category_id?.toString()}
                onValueChange={(value) =>
                  setTask({ ...task, category_id: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="text-lg py-4 font-normal">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id?.toString()}
                      className="text-lg"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xl font-bold">Priority</Label>
              <Select
                value={task?.priority_id?.toString()}
                onValueChange={(value) =>
                  setTask({ ...task, priority_id: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="text-lg py-4 font-normal">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem
                      className="text-lg"
                      key={priority.id}
                      value={priority.id?.toString()}
                    >
                      {priority.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xl font-bold">Status</Label>
              <Select
                value={task?.status_id?.toString()}
                onValueChange={(value) =>
                  setTask({ ...task, status_id: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="text-lg py-4 font-normal">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem
                      className="text-lg"
                      key={status.id}
                      value={status.id?.toString()}
                    >
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xl font-bold">Attachments</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 flex justify-center items-center gap-1">
                <p className="text-lg text-gray-600">
                  {isDragging ? "Drop files here" : "Drag files here or"}
                </p>
                <label className="cursor-pointer">
                  <span className="text-blue-500 hover:text-blue-600 font-medium text-lg">
                    select files
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
            {uploading.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Subiendo archivos</h3>
                {uploading.map((item) => (
                  <FileUploadProgress
                    key={item.id}
                    file={item.file}
                    progress={item.progress}
                    isComplete={item.isComplete}
                    onCancel={() => handleCancelUpload(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Lista de archivos adjuntos */}
            <AttachmentList
              attachments={attachments}
              onDelete={handleDeleteAttachment}
              selectedAttachments={selectedAttachments}
              setSelectedAttachments={setSelectedAttachments}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="text-xl font-bold py-4"
              onClick={() => navigate(`/task-detail/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xl font-bold py-4">
              {id ? "Update Task" : "Save Task"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Diálogo de confirmación para eliminar archivos */}
      <DialogConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleSubmitForm}
        title="Confirm file deletion"
        description={`You have selected  ${selectedAttachments.length} file(s). When you update this task, these files will be permanently deleted. Do you want to continue?`}
        cancelText="Cancel"
        confirmText="Yes, delete and update"
      />
    </div>
  );
}

export { NewTask };
