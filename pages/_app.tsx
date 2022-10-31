import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Router from "next/router";
import ProgressBar from "@badrap/bar-of-progress";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

const progress = new ProgressBar({
  size: 5,
  color: "#38a169",
  className: "bar-of-progress",
  delay: 100,
});

function MyApp({ Component, pageProps }: AppProps) {
  const client = new QueryClient();

  config.autoAddCss = false;

  Router.events.on("routeChangeStart", progress.start);
  Router.events.on("routeChangeError", progress.finish);
  Router.events.on("routeChangeComplete", progress.finish);

  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;
