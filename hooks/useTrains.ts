import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trein } from "../types/getTrainsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

export default function useTrains() {
  return useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<TreinWithInfo[]>("/api/trains");
      return data;
    },
    { refetchInterval: 4000 }
  );
}
