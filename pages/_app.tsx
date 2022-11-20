import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Router from "next/router";
import ProgressBar from "@badrap/bar-of-progress";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { trpc } from "../helpers/trpc";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useState } from "react";

const progress = new ProgressBar({
  size: 5,
  color: "#38a169",
  className: "bar-of-progress",
  delay: 100,
});
const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  config.autoAddCss = false;

  Router.events.on("routeChangeStart", progress.start);
  Router.events.on("routeChangeError", progress.finish);
  Router.events.on("routeChangeComplete", progress.finish);

  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme }}
      >
        <QueryClientProvider client={client}>
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default trpc.withTRPC(MyApp);
