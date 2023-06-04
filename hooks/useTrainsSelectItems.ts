import { SelectItem } from "@mantine/core";
import { useMemo } from "react";

// Basically everything this hook needs
type TrainAndInfo = {
  info: {
    type: string;
  } | null;
};

/**
 * Converts an array of trains to an array of `SelectItem` to be used by `<Select ...>`
 * @param trains The array of trains
 */
export default function useTrainSelectItems(trains: TrainAndInfo[]) {
  return useMemo(() => {
    const items: SelectItem[] = [];

    for (const train of trains) {
      if (train.info === null) continue;
      if (items.find((a) => a.value == train.info?.type)) continue;

      items.push({ value: train.info.type, label: train.info.type });
    }

    return items;
  }, [trains]);
}
