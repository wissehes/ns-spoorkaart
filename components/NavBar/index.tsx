import {
  ActionIcon,
  Burger,
  Container,
  createStyles,
  Group,
  Header,
  Menu,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NextLink } from "@mantine/next";
import { IconMoonStars, IconSun } from "@tabler/icons";

import Link from "next/link";
import { useRouter } from "next/router";

import { useMemo } from "react";

import { trpc } from "../../helpers/trpc";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  headerComp: {
    marginBottom: "unset !important",
  },
  links: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    cursor: "pointer",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface Link {
  link: string;
  label: string;
  items?: Link[];
}

const links: Link[] = [
  { link: "/trains", label: "Kaart" },
  {
    link: "/trains/list",
    label: "Treinen",
    items: [
      { link: "/trains/list", label: "Alle treinen" },
      { link: "/trains/nearby", label: "In de buurt" },
    ],
  },
  { link: "/stations", label: "Stations" },
  { link: "/planner", label: "Reisinformatie" },
  { link: "/about", label: "Over" },
  { link: "https://github.com/wissehes/ns-spoorkaart", label: "GitHub" },
];

export default function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes, cx } = useStyles();

  const items = links.map((l) => <LinkItem l={l} key={l.link} />);

  return (
    <Header height={60} mb={120} className={classes.headerComp}>
      <Container className={classes.header}>
        <Title order={2}>Treinen</Title>

        <Group spacing={5} className={classes.links}>
          {items}
          <ToggleDarkmode />
        </Group>

        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
        />
      </Container>
    </Header>
  );
}

function LinkItem({ l }: { l: Link }) {
  const { classes, cx } = useStyles();
  const router = useRouter();

  if (l.label == "Stations") {
    return <StationsMenu />;
  }

  if (!l.items) {
    return (
      <Link href={l.link}>
        <a
          className={cx(classes.link, {
            [classes.linkActive]: l.link == router.pathname,
          })}
          target={l.link.startsWith("http") ? "_blank" : "_self"}
        >
          {l.label}
        </a>
      </Link>
    );
  } else {
    return (
      <Menu shadow="md">
        <Menu.Target>
          <a
            className={cx(classes.link, {
              [classes.linkActive]: l.link == router.pathname,
            })}
            onClick={(event) => event.preventDefault()}
          >
            <span>{l.label}</span>
          </a>
        </Menu.Target>

        <Menu.Dropdown>
          {l.items.map((i) => (
            <Menu.Item key={i.link} component={NextLink} href={i.link}>
              {i.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }
}

function StationsMenu() {
  const { classes, cx } = useStyles();
  const router = useRouter();

  const stationQ = trpc.station.all.useQuery(undefined, {
    refetchOnMount: false,
  });
  const stations = useMemo(
    () =>
      stationQ.data?.filter(
        (s) =>
          (s.stationType == "MEGA_STATION" || s.sporen.length > 7) &&
          s.land == "NL"
      ),
    [stationQ]
  );

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <a
          className={cx(classes.link, {
            [classes.linkActive]: "/stations" == router.pathname,
          })}
          onClick={(event) => event.preventDefault()}
        >
          <span>Stations</span>
        </a>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component={NextLink} href="/stations">
          <b>Alle stations</b>
        </Menu.Item>

        <Menu.Divider />

        {stations?.map((s) => (
          <Menu.Item
            key={s.code}
            component={NextLink}
            href={`/stations/${s.code}`}
          >
            {s.namen.lang}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

function ToggleDarkmode() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <ActionIcon
      variant="outline"
      color={dark ? "yellow" : "blue"}
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
    >
      {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
    </ActionIcon>
  );
}
