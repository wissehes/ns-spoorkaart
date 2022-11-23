import {
  ActionIcon,
  Box,
  Center,
  Container,
  Loader,
  Pagination,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { NextLink } from "@mantine/next";
import { IconInfoCircle, IconSearch } from "@tabler/icons";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import { trpc } from "../../helpers/trpc";
import { useStyles } from "../../styles/important";

export default function ListTrainsPage() {
  const { classes } = useStyles();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const trains = trpc.trains.paginated.useQuery({
    itemsPerPage: 30,
    page,
    search: debouncedSearch,
  });
  const stations = trpc.station.all.useQuery();

  const getStation = useCallback(
    (id?: string) => {
      const station = stations.data?.find(
        ({ code }) => code == id?.replace("_0", "")
      );

      return station?.namen.kort || id || "?";
    },
    [stations]
  );

  useEffect(() => {
    if (trains.data?.pages) {
      setPages(trains.data.pages);
    }
  }, [trains]);

  return (
    <>
      <Head>
        <title>Treinen | NS Spoorkaart</title>
      </Head>
      <main className={classes.main}>
        <Navbar />

        <Container className={classes.container}>
          <Box style={{ marginBottom: "2rem" }}>
            <Title>Treinen</Title>
            <Text className={classes.description}>
              Alle treinen op een rijtje
            </Text>
          </Box>

          {trains.isLoading && (
            <Center>
              <Loader />
            </Center>
          )}

          <TextInput
            label="Zoeken"
            value={search}
            style={{ flex: 1, maxWidth: "25rem" }}
            onChange={(event) => setSearch(event.currentTarget.value)}
            size="md"
            icon={<IconSearch size={16} />}
          />

          {trains.data && (
            <>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Vervoerder</th>
                    <th>Type</th>
                    <th>Materieel</th>
                    <th>Nummers</th>
                    <th>Snelheid</th>
                    <th>Station</th>
                    <th>Info</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.data?.items.map((t) => (
                    <tr key={t.treinNummer}>
                      <td>{t.info?.vervoerder || t.info?.vervoerder}</td>
                      <td>{t.type}</td>
                      <td>
                        {t.info?.materieeldelen.map((t) => t.type).join(", ")}
                      </td>
                      <td>
                        {t.info?.materieeldelen
                          .filter((t) => t.materieelnummer)
                          .map((t) => t.materieelnummer)
                          .join(", ")}
                      </td>
                      <td>{Math.round(t.snelheid)} km/u</td>
                      <td>{getStation(t.info?.station)}</td>
                      <td>
                        <ActionIcon
                          variant="subtle"
                          color={"blue"}
                          component={NextLink}
                          href={`/journey/${t.treinNummer}`}
                        >
                          <IconInfoCircle size={20} />
                        </ActionIcon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
          <Center>
            <Pagination
              total={pages}
              page={page}
              onChange={setPage}
              style={{ marginTop: "1rem" }}
            />
          </Center>
        </Container>
      </main>
    </>
  );
}
