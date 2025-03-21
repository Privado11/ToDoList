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
import { useTaskContext } from "@/context/TaskContext";

const TaskForm = ({ task, setTask }) => {
  const { categories, priorities, statuses } = useTaskContext();

  const onInputChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  return (
    <>
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
          className="w-full text-lg py-4"
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
            e.target.style.height = `${Math.min(e.target.scrollHeight, 320)}px`;
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
    </>
  );
};

export default TaskForm;
