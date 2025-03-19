import { useEffect, useState } from "react";
import { getCategories } from "../../../service/category/categoryService";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      if (categoriesData) setCategories(categoriesData);
    };
    fetchCategories();
  }, []);

  return {
    categories,
  };
};
