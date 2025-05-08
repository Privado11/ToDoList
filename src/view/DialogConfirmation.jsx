import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DialogConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Confirm",
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xs sm:max-w-md w-full p-4 rounded-lg text-center max-h-[400px]">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-lg font-semibold ">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row justify-center space-x-3 mt-4 gap-2">
          <AlertDialogCancel className="flex-1 m-0">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="flex-1 m-0 bg-red-500">
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
