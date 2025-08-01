import React from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TaskForm from "../TaskForm";

function EditTask({
  editDialogOpen,
  setEditDialogOpen,
  taskData,
  setTaskData,
  isUpdating,
  handleSubmitEdit,
}) {
  return (
    <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <AlertDialogContent className="sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Edit Task</span>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <form className="space-y-6" onSubmit={handleSubmitEdit}>
          <TaskForm task={taskData} setTask={setTaskData} />

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="text-base font-medium py-2"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-base font-medium py-2"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Task"
              )}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditTask;
