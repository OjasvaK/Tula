import { useQuery } from "@tanstack/react-query";
import { fetchTrends } from "../api/stats";

export function useTrends() {
  return useQuery({
    queryKey: ["trends"],
    queryFn: fetchTrends,
  });
}
