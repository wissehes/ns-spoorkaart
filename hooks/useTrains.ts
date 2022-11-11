import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trein } from "../types/getTrainsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

export default function useTrains(refresh: Boolean = true) {
  return useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<TreinWithInfo[]>("/api/trains");
      return data;
    },
    { refetchInterval: refresh ? 4000 : false }
  );
}
