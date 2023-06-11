import Head from "next/head";
import Navbar from "../components/NavBar";
import { Container } from "@mantine/core";

export default function StandardLayout({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  // children?: JSX.Element | JSX.Element[] | string | undefined;
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <main style={{ minHeight: "100vh", paddingBottom: "2rem" }}>
        <Navbar />
        <Container>{children}</Container>
      </main>
    </>
  );
}
