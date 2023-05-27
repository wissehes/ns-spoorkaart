/* eslint-disable @next/next/no-img-element */

import { JourneyDetails } from "../types/getJourneyDetailsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

import { useMemo } from "react";
import { Anchor, Box, Button, Group, List, Text, Title } from "@mantine/core";
import Link from "next/link";
import { trpc } from "../helpers/trpc";

function TrainPartsVisualized({ train }: { train: TreinWithInfo }) {
  return (
    <div style={{ height: "4rem", overflowX: "auto" }}>
      <div style={{ display: "flex", height: "3rem" }}>
        {train.info?.materieeldelen.map((m) =>
          m.bakken
            .filter((p) => p.afbeelding)
            .map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.afbeelding?.url || ""}
                alt={p.afbeelding.url}
                key={p.afbeelding.url}
                height="100%"
              />
            ))
        )}
      </div>
    </div>
  );
}

const TrainPopupHeader = ({
  train,
  journey,
}: {
  train: TreinWithInfo;
  journey?: JourneyDetails;
}) => {
  const product = journey?.stops[0]?.departures[0]?.product;

  const destination =
    journey?.stops[0].destination ||
    journey?.stops[journey.stops.length - 1].stop.name ||
    "?";
  const destinationCode = journey?.stops[journey.stops.length - 1]?.id.replace(
    "_0",
    ""
  );

  return (
    <Title order={4}>
      🚂 {product?.operatorName} {product?.longCategoryName || train.type} naar{" "}
      <TrainStationLink text={destination} id={destinationCode} />
    </Title>
  );
};

const TrainStationLink = ({ text, id }: { text: string; id?: string }) => (
  <Anchor component={Link} href={id ? `/trains?station=${id}` : ``}>
    {text}
  </Anchor>
);

const calcSeats = (t: TreinWithInfo) => {
  if (!t.info?.materieeldelen[0]) return "?";

  const seats = t.info?.materieeldelen
    ?.map((m) => {
      if (!m.zitplaatsen) return 0;
      const z = m.zitplaatsen;

      return (
        z.zitplaatsEersteKlas +
        z.zitplaatsTweedeKlas +
        // z.klapstoelEersteKlas +
        z.klapstoelTweedeKlas
        // z.staanplaatsTweedeKlas +
        // z.staanplaatsEersteKlas
      );
    })
    .reduce((prev, cur) => prev + cur);

  return seats > 0 ? seats : "?";
};

export default function TrainPopup({ train }: { train: TreinWithInfo }) {
  const { data } = trpc.journey.journey.useQuery(
    { id: train.ritId },
    { refetchOnWindowFocus: false }
  );

  const stations = trpc.station.all.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const foundStation = useMemo(() => {
    if (!stations.data) return null;
    const found = stations.data.find((s) => s.code == train.info?.station);
    return found;
  }, [stations, train]);

  return (
    <Box
      style={{
        width: "22rem",
      }}
    >
      <TrainPopupHeader train={train} journey={data} />

      <TrainPartsVisualized train={train} />

      <List size="sm">
        {foundStation && (
          <List.Item>
            <Text>
              Volgend station:{" "}
              <Anchor
                component={Link}
                href={`/trains?station=${foundStation.code}`}
              >
                {foundStation.namen.lang}
              </Anchor>
            </Text>
          </List.Item>
        )}

        <List.Item>
          Type <b>{train.info?.type}</b> @ <b>{Math.round(train.snelheid)}</b>{" "}
          km/u
        </List.Item>
        <List.Item>Zitplaatsen: {calcSeats(train)}</List.Item>
        <List.Item>
          Richting:{" "}
          <div
            style={{
              display: "inline-block",
              transform: `rotate(${train.richting}deg)`,
              width: "15px",
              fontSize: "15px",
            }}
          >
            ⬆️
          </div>
        </List.Item>
        {data?.notes[0] && (
          <List.Item>{data?.notes.map((a) => a.text).join(", ")}</List.Item>
        )}
      </List>

      <Group>
        {train?.materieel && (
          <Button component={Link} href={`/train/${train.materieel[0]}`}>
            Meer info
          </Button>
        )}
        <Button component={Link} href={`/journey/${train.treinNummer}`}>
          Rit
        </Button>
      </Group>
    </Box>
  );
}
