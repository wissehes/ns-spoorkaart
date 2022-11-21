import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Container,
  Group,
  Loader,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import { IconInfoCircle, IconSearch } from "@tabler/icons";

import Head from "next/head";
import { useMemo, useState } from "react";

import Navbar from "../../components/NavBar";
import {
  countries,
  formatCountry,
  formatStationType,
  stationTypes,
} from "../../helpers/StationPage";
import { trpc } from "../../helpers/trpc";
import { useStyles } from "../../styles/important";
import { SmallStation } from "../../types/getStationsResponse";

type SelectData = { value: string; label: string }[];

export default function StationsPage() {
  const { classes } = useStyles();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCountry, setCountry] = useState<string | null>("NL");
  const [selectedType, setType] = useState<string | null>();

  const mappedCountries: SelectData = Object.entries(countries).map(
    ([id, c]) => ({ value: id, label: `${c.emoji} ${c.name}` })
  );
  const mappedTypes: SelectData = Object.entries(stationTypes).map(
    ([id, s]) => ({ value: id, label: s })
  );

  const stations = trpc.station.all.useQuery();

  const filtered = useMemo(() => {
    let filtered: SmallStation[] = stations.data || [];

    if (selectedCountry) {
      filtered = filtered.filter(({ land }) => land == selectedCountry);
    }

    if (selectedType) {
      filtered = filtered.filter(
        ({ stationType }) => stationType == selectedType
      );
    }

    if (searchValue.length > 0) {
      return filtered?.filter(
        (s) =>
          s.code.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.namen.lang.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      return filtered;
    }
  }, [stations, selectedCountry, selectedType, searchValue]);
  return (
    <>
      <Head>
        <title>Stations | NS Spoorkaart</title>
      </Head>

      <main className={classes.main}>
        <Navbar />
        <Container>
          <Box className={classes.header}>
            <Title>Stations</Title>
            <Text>Alle stations op een rijtje</Text>
          </Box>

          <Group>
            <TextInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              label="Zoeken"
              placeholder="Zoeken..."
              icon={<IconSearch size={14} />}
            />

            <Select
              value={selectedCountry}
              onChange={setCountry}
              data={mappedCountries}
              clearable
              label="Land"
              placeholder="Kies land..."
            />
            <Select
              value={selectedType}
              onChange={setType}
              data={mappedTypes}
              clearable
              label="Soort"
              placeholder="Kies soort..."
            />
          </Group>

          {stations.isLoading && (
            <Center style={{ marginTop: "5rem" }}>
              <Loader />
            </Center>
          )}

          {stations.data && (
            <Table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Soort</th>
                  <th>Code</th>
                  <th style={{ textAlign: "center" }}>Land</th>
                  <th style={{ textAlign: "center" }}>Info</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.code}>
                    <td>
                      <b>{s.namen.lang}</b>
                    </td>
                    <td>{formatStationType(s.stationType)}</td>
                    <td>
                      <Badge>{s.code}</Badge>
                    </td>
                    <td
                      style={{ textAlign: "center" }}
                      title={formatCountry(s.land).name}
                    >
                      {formatCountry(s.land).emoji}
                    </td>
                    <td title={`Info over ${s.namen.kort}`}>
                      <Center>
                        <ActionIcon
                          component={NextLink}
                          href={`/stations/${s.code}`}
                        >
                          <IconInfoCircle />
                        </ActionIcon>
                      </Center>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </main>
    </>
  );
}
