import { useQuery } from "@tanstack/react-query";
import { fetchRules } from "../api/rules";

export function useRules() {
  return useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
    staleTime: 1000 * 60 * 60, // rules rarely change within a session
  });
}
