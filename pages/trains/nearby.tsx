import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import { trpc } from "../../helpers/trpc";
import { useStyles } from "../../styles/important";
import Link from "next/link";

export default function NearbyPage() {
  const { classes } = useStyles();

  const geo = useGeolocation();

  const query = trpc.trains.nearbyTrains.useQuery(
    {
      latitude: geo.location?.latitude || 0,
      longitude: geo.location?.longitude || 0,
      radius: 500,
    },
    { enabled: !!geo.location }
  );

  return (
    <>
      <Head>
        <title>Treinen in de buurt | NS Spoorkaart</title>
      </Head>
      <main className={classes.main}>
        <Navbar />

        <Container className={classes.container}>
          <Box style={{ marginBottom: "2rem" }}>
            <Title>Treinen in de buurt</Title>
            {/* <Text className={classes.description}>
              Alle treinen op een rijtje
            </Text> */}
          </Box>
          <Group>
            <Button onClick={geo.getPosition}>Get location</Button>
            <Button disabled={!geo.location} onClick={() => query.refetch()}>
              Herladen
            </Button>
          </Group>

          <Box>
            <Table style={{ overflowX: "auto" }}>
              <thead>
                <tr>
                  <th>Type</th>
                  {/* <th>Station</th> */}
                  <th>Trein</th>
                  <th>Afstand</th>
                  <th>Info</th>
                  <th style={{ textAlign: "right" }}>Afbeelding</th>
                </tr>
              </thead>
              <tbody>
                {query.data?.map((train) => (
                  <tr key={train.ritId}>
                    <td>{train.type}</td>
                    <td>{train.ritId}</td>
                    <td>{train.distance} km</td>
                    <td>
                      <ActionIcon
                        variant="subtle"
                        color={"blue"}
                        component={Link}
                        href={`/journey/${train.treinNummer}`}
                      >
                        <IconInfoCircle size={50} />
                      </ActionIcon>
                    </td>
                    <td>
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
                    </td>
                  </tr>
                ))}

                {/* {!query.data && !geo.isLoading && <Text>Geen data</Text>} */}
                {!geo.isLoading && !geo.hasPermission && (
                  <Text>Geen toegang tot locatie</Text>
                )}
              </tbody>
            </Table>
          </Box>
        </Container>
      </main>
    </>
  );
}

function useGeolocation() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsAvailable(true);
      // setLoading(false);
    }
  }, []);

  const getPosition = () => {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (data) => {
        setHasPermission(true);
        setLocation(data.coords);
        setLoading(false);
      },
      (error) => {
        setHasPermission(false);
        console.error(error);
        setLoading(false);
      }
    );
  };

  return { isAvailable, hasPermission, location, isLoading, getPosition };
}
