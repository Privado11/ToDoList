import React, { useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CommentList({ comments = [], onEditComment, onDeleteComment }) {
  const formatRelativeTime = useCallback((dateString) => {
    if (!dateString) return "Invalid date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} s`;
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} h`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} d`;
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
      }

      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
    } catch {
      return "Invalid date";
    }
  }, []);

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div
            key={comment.id || `${comment.author_name}-${index}`}
            id={comment.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-grow overflow-hidden">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={comment?.profiles?.Avatar || "/api/placeholder/32/32"}
                />
                <AvatarFallback>{comment?.author_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden w-full flex flex-col">
                <div className="flex justify-between">
                  <p className="font-medium text-base sm:text-lg">
                    {comment?.author_name}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEditComment && (
                        <DropdownMenuItem
                          onClick={() => onEditComment(comment.id)}
                          className="cursor-pointer"
                          disabled={!comment?.is_author}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                          {!comment?.is_author && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Author only)
                            </span>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onDeleteComment && (
                        <DropdownMenuItem
                          onClick={() => onDeleteComment(comment)}
                          className="cursor-pointer"
                          disabled={!comment?.is_author}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                          {!comment?.is_author && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Author only)
                            </span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-gray-600 text-base break-words">
                  {comment.content}
                </p>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No comments yet.</p>
      )}
    </div>
  );
}

export default CommentList;
