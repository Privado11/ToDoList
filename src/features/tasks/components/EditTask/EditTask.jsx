import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from '../TaskForm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function EditTask({
  editDialogOpen,
  setEditDialogOpen,
  taskData,
  setTaskData,
  isUpdating,
  handleSubmitEdit,
}) {
  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Edit Task</span>
          </DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}

export default EditTask