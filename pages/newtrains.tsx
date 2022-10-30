import Head from "next/head";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";
import NavBar from "../components/NavBar";
import NewMap from "../components/NewMap";

const Home = () => {
  //   const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  //     ssr: false,
  //   });

  return (
    <div>
      <Head>
        <title>NS Spoorkaart</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.leaflet}>
        <NavBar />
        <NewMap />
      </main>
    </div>
  );
};

export default Home;
