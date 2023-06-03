import {
  Group,
  Paper,
  SimpleGrid,
  Text,
  createStyles,
  rem,
} from "@mantine/core";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import {
  IconCircleArrowUpFilled,
  IconGauge,
  IconMapPins,
  IconCompass,
} from "@tabler/icons-react";
import { TrainInfo, TrainPosition } from "@prisma/client";
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

  directionIcon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[8],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  speed: IconGauge,
  distance: IconMapPins,
  direction: IconCompass,
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
      title: "Richting",
      value: train.richting,
      icon: "direction",
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
      cols={4}
      breakpoints={[
        { maxWidth: "sm", cols: 2 },
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

  const isDirection = stat.title == "Richting";
  const rotation = isDirection ? Number(stat.value) : 0;

  return (
    <Paper withBorder p="md" radius="md">
      <Group position="apart">
        <Text size="xs" color="dimmed" className={classes.title}>
          {stat.title}
        </Text>
        {Icon && (
          <Icon
            className={classes.icon}
            size="1.4rem"
            stroke={1.5}
            style={{ rotate: `deg(${rotation})` }}
          />
        )}
      </Group>

      <Group align="flex-end" spacing="xs" mt="xs">
        {!isDirection && <Text className={classes.value}>{stat.value}</Text>}
        {stat.metric && !isDirection && (
          <Text color="dimmed" fz="sm" fw={500} className={classes.metric}>
            <span>{stat.metric}</span>
          </Text>
        )}
        {isDirection && (
          <div
            style={{
              display: "inline-block",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <IconCircleArrowUpFilled
              className={classes.directionIcon}
              size="3rem"
            />
          </div>
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
