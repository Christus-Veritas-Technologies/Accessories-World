import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get<Category[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
