import { Card, Flex, Progress, Text } from "@mantine/core";
import { JourneyDetails } from "../../types/getJourneyDetailsResponse";
import { useMemo } from "react";
import { IconArrowRight } from "@tabler/icons";
import Link from "next/link";

export default function CurrentJourney({
  journey,
}: {
  journey: JourneyDetails;
}) {
  // Filter out skipped stops.
  const stops = useMemo(
    () => journey.stops.filter((s) => s.status != "PASSING"),
    [journey.stops]
  );
  const origin = stops.find((s) => s.status == "ORIGIN");
  const destination = stops.find((s) => s.status == "DESTINATION");

  const progress = useMemo(() => {
    const now = new Date();
    const originDepTxt = origin?.departures[0].actualTime;
    const destinationArrTxt = destination?.arrivals[0].actualTime;
    if (!originDepTxt || !destinationArrTxt) return 100;

    const originDep = new Date(originDepTxt);
    const destinationArr = new Date(destinationArrTxt);

    if (now.getTime() > destinationArr.getTime()) return 100;

    // In ms
    const length = destinationArr.getTime() - originDep.getTime();
    const timeSinceDeparture = now.getTime() - originDep.getTime();

    const progress =
      100 - Math.floor(((length - timeSinceDeparture) / length) * 100);
    return progress;
  }, [origin, destination]);

  return (
    <Card
      withBorder
      radius="md"
      padding="xl"
      my="md"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,

        "&:hover": {},
      })}
      component={Link}
      href={`/journey/${journey.productNumbers[0]}`}
    >
      <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
        Huidige rit
      </Text>
      <Flex gap="md" align="center">
        <Text fz="lg" fw={500}>
          {origin?.stop.name}
        </Text>
        <IconArrowRight size="1.5rem" />
        <Text fz="lg" fw={500}>
          {destination?.stop.name}
        </Text>
      </Flex>
      <Progress value={progress} mt="md" size="lg" radius="xl" />
    </Card>
  );
}
