import { createStyles } from "@mantine/core";

export const useStyles = createStyles((theme) => ({
  container: {
    paddingBottom: "2rem",
  },
  main: { minHeight: "100vh" },
  description: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
  },
  header: {
    marginBottom: "2rem",
  },
  box: {
    borderRadius: "10px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: "1rem",
    marginTop: "1rem",
  },

  boxTitle: {
    marginBottom: "1rem",
  },

  trackIcon: {
    textAlign: "center",
    width: "50px",

    // borderColor: theme.colors.cyan,
  },

  tabsList: {
    maxWidth: 1082,
    marginLeft: "auto",
    marginRight: "auto",
    borderBottom: 0,

    [`@media (max-width: ${1080}px)`]: {
      maxWidth: "100%",
      paddingRight: 0,
    },
  },

  tab: {
    fontSize: 16,
    fontWeight: 500,
    height: 46,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    marginBottom: -1,
    borderColor:
      theme.colorScheme === "dark"
        ? `${theme.colors.dark[8]} !important`
        : undefined,
    backgroundColor: "transparent",

    [`@media (max-width: ${1080}px)`]: {
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.lg,
      fontSize: theme.fontSizes.sm,
      height: 38,
    },

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
}));
