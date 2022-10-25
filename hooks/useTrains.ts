import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trein } from "../types/getTrainsResponse";

export default function useTrains() {
  return useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<Trein[]>("/api/trains");
      return data;
    },
    { refetchInterval: 4000 }
  );
}
