import {
  Group,
  Paper,
  SimpleGrid,
  Text,
  createStyles,
  rem,
} from "@mantine/core";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import { IconGauge, IconMapPins } from "@tabler/icons";
import { TrainInfo, TrainPosition } from "@prisma/client";
import { trpc } from "../../helpers/trpc";
import { useMemo } from "react";
import getDistanceFromGPS from "../../helpers/getDistanceFromGPS";

const useStyles = createStyles((theme) => ({
  value: {
    fontSize: rem(24),
    fontWeight: 700,
    lineHeight: 1,
  },

  metric: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  speed: IconGauge,
  distance: IconMapPins,
};

interface TrainStatsProps {
  train: TreinWithInfo;
  info: TrainInfo;
  positions: TrainPosition[];
}

interface Stat {
  title: string;
  subtitle?: string;
  value: string | number;
  metric?: string;
  icon?: keyof typeof icons;
}

export default function TrainStats({
  train,
  info,
  positions,
}: TrainStatsProps) {
  const totalKM = useMemo(() => {
    /**
     * distance in KM
     */
    let distance = 0;

    for (let i = 0; i < positions.length - 1; i++) {
      const curPos = positions[i];
      const nextPos = positions[i + 1];
      distance += getDistanceFromGPS({
        location1: { lat: curPos.lat, lon: curPos.lng },
        location2: { lat: nextPos.lat, lon: nextPos.lng },
      });
    }

    return Math.floor(distance);
  }, [positions]);

  const stats: Stat[] = [
    {
      title: "Snelheid",
      value: Math.floor(train.snelheid),
      metric: "km/h",
      icon: "speed",
    },
    {
      title: "Zitplaatsen",
      value:
        (info.zitplaatsEersteKlas ?? 0) +
        (info.zitplaatsTweedeKlas ?? 0) +
        (info.klapstoelTweedeKlas ?? 0) +
        (info.klapstoelEersteKlas ?? 0),
    },
    {
      title: "Afstand",
      subtitle: "Afgelegd in de laatste 24 uur",
      value: totalKM,
      metric: "km",
      icon: "distance",
    },
  ];

  return (
    <SimpleGrid
      my="md"
      cols={3}
      breakpoints={[
        { maxWidth: "md", cols: 2 },
        { maxWidth: "xs", cols: 1 },
      ]}
    >
      {stats.map((s) => (
        <StatDisplay stat={s} key={s.title} />
      ))}
    </SimpleGrid>
  );
}

function StatDisplay({ stat }: { stat: Stat }) {
  const { classes } = useStyles();
  const Icon = stat.icon ? icons[stat.icon] : undefined;

  return (
    <Paper withBorder p="md" radius="md">
      <Group position="apart">
        <Text size="xs" color="dimmed" className={classes.title}>
          {stat.title}
        </Text>
        {Icon && <Icon className={classes.icon} size="1.4rem" stroke={1.5} />}
      </Group>

      <Group align="flex-end" spacing="xs" mt="xs">
        <Text className={classes.value}>{stat.value}</Text>
        {stat.metric && (
          <Text color="dimmed" fz="sm" fw={500} className={classes.metric}>
            <span>{stat.metric}</span>
          </Text>
        )}
      </Group>
      {stat.subtitle && (
        <Text fz="xs" c="dimmed" mt={7}>
          {stat.subtitle}
        </Text>
      )}
    </Paper>
  );
}
