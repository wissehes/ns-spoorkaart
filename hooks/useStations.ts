import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SmallStation } from "../types/getStationsResponse";

export default function useStations() {
  return useQuery(
    ["stations"],
    async () => {
      const { data } = await axios.get<SmallStation[]>("/api/stations");
      return data;
    },
    { refetchOnWindowFocus: false }
  );
}
