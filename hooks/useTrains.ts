import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";
import { useMapStore } from "../stores/MapStore";

export default function useTrains() {
  const shouldRefresh = useMapStore((s) => s.autoRefresh);

  return useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<TreinWithInfo[]>("/api/trains");
      return data;
    },
    { refetchInterval: shouldRefresh ? 4000 : false }
  );
}
