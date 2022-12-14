import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import NavBar from "../components/NavBar";
import styles from "../styles/Home.module.css";

const AboutPage: NextPage = () => {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Head>
        <title>Over | NS Spoorkaart</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <main className="content">
        <div className="container" style={{ marginTop: "1rem" }}>
          <h1 className="has-text-primary">🗺️ NS-Spoorkaart</h1>
          <p>
            NS-Spoorkaart is een webapp waar je alle treinen kan zien die op dit
            moment over het spoor rijden in Nederland. Je ziet de treinen van
            NS, Arriva, R-net en Blauwnet.
          </p>
          <h2 className="has-text-secondary">⚙️ Technisch</h2>
          <p>
            Voor de actuele reisinformatie gebruik ik de{" "}
            <a href="https://apiportal.ns.nl/">NS API</a>. Ik heb vooral{" "}
            <a>Bulma</a> gebruikt voor de styling. Voor de kaarten gebruik ik{" "}
            <a href="https://visgl.github.io/react-map-gl/">react-map-gl</a> met
            tiles van <a href="https://www.maptiler.com/">MapTiler</a>.
          </p>

          <h2 className="has-text-secondary">🖥️ Source-code</h2>
          <p>
            De broncode van NS-Spoorkaart is open source op{" "}
            <a href="https://github.com/wissehes/ns-spoorkaart">GitHub</a> :)
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
