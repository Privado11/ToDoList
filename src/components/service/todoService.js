import { supabase } from "./supabase";

export const getTodos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select(
        `
          *,
          priorities(*),
          categories(*)
        `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    return null;
  }
};

export const getTodoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select(
        `
          *,
          priorities(*),
          categories(*)
        `
      )
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error al obtener el todo:", error.message);
    return null;
  }
};

export const saveTodo = async (data, userId) => {
  try {
    const { user_id, ...todoData } = data; 
    const { data: insertedData, error } = await supabase
      .from("todos")
      .insert([{ ...todoData, user_id: userId }]) 
      .select();

    if (error) {
      throw error;
    }
    return insertedData;
  } catch (error) {
    console.error("Error inserting data:", error.message);
    return null;
  }
};

export const putTodo = async (id, data) => {
  try {
    const { user_id, categories, priorities, ...updatedData } = data;

    const { data: updatedTodo, error } = await supabase
      .from("todos")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return updatedTodo;
  } catch (error) {
    console.error("Error updating todo:", error.message);
    return null;
  }
};

export const deleteTodo = async (id) => {
  try {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting todo:", error.message);
    return false;
  }
};
