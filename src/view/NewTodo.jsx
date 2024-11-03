import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Upload } from "lucide-react";
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
import { useTodo } from "../components/context/TodoContext";

function NewTodo() {
  const {
    createTodo: addTask,
    todos,
    updateTodo,
    categories,
    priorities,
    statuses,
  } = useTodo();
  let navigate = useNavigate();
  const { id } = useParams();
  const [customCategory, setCustomCategory] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category_id: null,
    due_date: null,
    status_id: 1,
    priority_id: 1,
  });

  useEffect(() => {
    console.log("NewTask", newTask);
  }, [newTask]);

  useEffect(() => {
    if (id) {
      setNewTask(todos.find((todo) => todo.id === parseInt(id)));
    }
  }, [id, todos]);

  const onInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (newTask.title.trim() === "") {
      alert("Task title is required!");
      return;
    }

    if (customCategory) {
      newTask.category_id = customCategory;
    }

    if (id) {
      updateTodo(newTask);
       navigate("/");
    } else {
      addTask(newTask);
       navigate("/");
    }
   
  };

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
              value={newTask.title}
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
              value={newTask.description}
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
                  value={newTask.due_date}
                  onChange={onInputChange}
                  className="w-full text-lg py-4 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label className="text-xl font-bold">Category</Label>
              <Select
                onValueChange={(value) =>
                  setNewTask({ ...newTask, category_id: parseInt(value) })
                }
              >
                <SelectTrigger className="text-lg py-4 font-normal">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
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
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority_id: parseInt(value) })
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
                      value={priority.id.toString()}
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
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status_id: parseInt(value) })
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
                      value={status.id.toString()}
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
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 flex justify-center items-center gap-1">
                <p className="text-lg text-gray-600">Drag files here or</p>
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-600 font-medium text-lg"
                >
                  select files
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="text-xl font-bold py-4"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button className="text-xl font-bold py-4">Save Task</Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}

export { NewTodo };
