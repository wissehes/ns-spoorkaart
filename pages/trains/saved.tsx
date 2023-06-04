/**
 * Shows all saved trains
 */

import { NextPage } from "next";
import StandardLayout from "../../layouts/StandardLayout";
import {
  ActionIcon,
  Center,
  Group,
  Loader,
  Select,
  Table,
  Tooltip,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { timeUntil } from "../../helpers/StationPage";
import { Header } from "../../components/Layout/Header";
import useTrainSelectItems from "../../hooks/useTrainsSelectItems";
import { IconExternalLink, IconSearch, IconSortAZ } from "@tabler/icons-react";
import Link from "next/link";
import { trpc } from "../../helpers/trpc";
import { RouterOutput } from "../../server/client";

// Infer types from TRPC
type TRPCData = RouterOutput["saved"]["all"];
type TrainItem = TRPCData[number];

const SavedTrainsPage: NextPage = () => {
  const trains = trpc.saved.all.useQuery();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<
    "type" | "material" | "date" | string | null
  >("type");

  const selectItems = useTrainSelectItems(trains.data ?? []);

  const filteredTrains = useMemo(() => {
    const data = trains.data;
    let items: TrainItem[] = [];

    if (!data) return [];

    if (selectedType) {
      items = data.filter((t) => t.info && t.info.type == selectedType);
    } else items = [...data];

    switch (selectedSort) {
      case "date":
        return items.sort(
          (a, b) =>
            new Date(b.positions[0]?.date ?? 0).getTime() -
            new Date(a.positions[0]?.date ?? 0).getTime()
        );

      case "material":
        return items.sort((a, b) => a.materialId - b.materialId);

      default:
        if (!selectedType) return data;
        else return items;
    }

    // return items;
  }, [trains.data, selectedType, selectedSort]);

  return (
    <StandardLayout title="Opgeslagen treinen">
      <Header title="Opgeslagen treinen" />

      <Group>
        <Select
          label="Filter type"
          searchable
          clearable
          size="md"
          icon={<IconSearch size={16} />}
          value={selectedType}
          onChange={setSelectedType}
          data={selectItems}
          disabled={!trains.isSuccess}
        />

        <Select
          label="Sorteer"
          size="md"
          icon={<IconSortAZ size={16} />}
          value={selectedSort}
          onChange={setSelectedSort}
          data={[
            { label: "Type", value: "type" },
            { label: "Materieelnummer", value: "material" },
            { label: "Laatst gezien", value: "date" },
          ]}
          disabled={!trains.isSuccess}
        />
      </Group>

      {trains.isSuccess && (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Materieelnr.</th>
              <th>Voor het laatst gezien</th>
              <th style={{ textAlign: "right" }}>Afbeelding</th>
            </tr>
          </thead>

          <tbody>
            {filteredTrains.map((t) => (
              <TableItem train={t} key={t.materialId} />
            ))}
          </tbody>
        </Table>
      )}

      {trains.isLoading && (
        <Center mt="xl">
          <Loader variant="dots" />
        </Center>
      )}
    </StandardLayout>
  );
};

export default SavedTrainsPage;

function TableItem({ train: t }: { train: TrainItem }) {
  const date = t.positions[0]?.date;
  const time = useMemo(
    () => (date ? timeUntil(new Date(date).toISOString()) : ""),
    [date]
  );

  return (
    <tr key={t.materialId}>
      <td>
        <Tooltip label="Laat meer zien">
          <ActionIcon
            color="cyan"
            component={Link}
            href={`/train/${t.materialId}/data`}
            target="_blank"
          >
            <IconExternalLink size="1rem" />
          </ActionIcon>
        </Tooltip>
      </td>
      <td>{t.info?.type}</td>
      <td>{t.materialId}</td>
      <td>{time}</td>
      {t.info !== null && (
        <td>
          <DisplayTrain train={t} />
        </td>
      )}
    </tr>
  );
}

function DisplayTrain({ train }: { train: TrainItem }) {
  const afbeelding = train.info?.afbeelding;
  const bakken = train.info?.bakkenImg ?? [];

  return (
    <div
      style={{
        height: "3.25rem",
        overflowX: "auto",
        justifyContent: "end",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "3rem",
          width: "60vh",
        }}
      >
        {bakken.length > 0 &&
          train.info?.bakkenImg.map((m) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={m || ""} alt={train.info?.type} key={m} height="100%" />
          ))}

        {!bakken?.length && afbeelding && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={afbeelding} alt={train.info?.type} height="100%" />
        )}
      </div>
    </div>
  );
}
