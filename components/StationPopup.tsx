import { SmallStation } from "../types/getStationsResponse";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StationInfoResponse } from "../types/getStationInfoResponse";

import styles from "../styles/Map.module.css";
import formatTime from "../helpers/formatTime";

import { Box, Button, Center, Loader, Table, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function StationPopup({ station }: { station: SmallStation }) {
  const query = useQuery(
    ["station", station.code],
    async () => {
      const { data } = await axios.get<StationInfoResponse>(
        `/api/station/${station.code}`
      );
      return data;
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        colorScheme: "light",
      }}
    >
      <Title order={3}>🚉 Station {station.namen.lang}</Title>

      <Text>
        Sporen: <b>{station.sporen.map((s) => s.spoorNummer).join(", ")}</b>
      </Text>

      <div>
        <Table
          className={query.isLoading ? "table is-loading" : "table"}
          style={{ width: "100%" }}
        >
          <thead>
            <tr style={{ textAlign: "center", fontWeight: "bolder" }}>
              <th>Tijd</th>
              <th>Type</th>
              <th>Spoor</th>
              <th>Bestemming</th>
            </tr>
          </thead>

          <tbody>
            {query.data &&
              query.data.departures.map((a) => (
                <tr
                  key={a.product.number}
                  className={styles.stationtable_content}
                >
                  <td>{formatTime(a.actualDateTime)}</td>
                  <td>{a.product.longCategoryName}</td>
                  <td>{a.plannedTrack}</td>
                  <td>{a.direction}</td>
                </tr>
              ))}
          </tbody>
        </Table>
        {query.isLoading && (
          <Center>
            <Loader style={{ margin: "1rem" }} />
          </Center>
        )}
      </div>

      <Button component={Link} href={`/stations/${station.code}`}>
        Meer info
      </Button>
    </Box>
  );
}
