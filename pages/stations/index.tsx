import {
  faInfoCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import {
  countries,
  formatCountry,
  formatStationType,
  stationTypes,
} from "../../helpers/StationPage";
import useStations from "../../hooks/useStations";
import { SmallStation } from "../../types/getStationsResponse";

export default function StationsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCountry, setCountry] = useState("NL");
  const [selectedType, setType] = useState("");
  const stations = useStations();

  const searched = useMemo(() => {
    let filtered: SmallStation[] = stations.data || [];

    if (selectedCountry.length) {
      filtered = filtered.filter(({ land }) => land == selectedCountry);
    }
    if (selectedType.length) {
      filtered = filtered.filter(
        ({ stationType }) => stationType == selectedType
      );
    }

    if (searchValue.length > 0) {
      return filtered?.filter(
        (s) =>
          s.code.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.namen.lang.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      return filtered;
    }
  }, [searchValue, selectedCountry, selectedType, stations]);

  return (
    <div>
      <Head>
        <title>Stations | NS Spoorkaart</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ minHeight: "100vh" }}>
        <NavBar />

        <section className="hero is-info" style={{ marginBottom: "2rem" }}>
          <div className="hero-body">
            <p className="title">Stations</p>
            <p className="subtitle">Alle stations op een rijtje.</p>
          </div>
        </section>

        <div className="container">
          <div className="box">
            <div className="is-flex" style={{ gap: "1rem" }}>
              <div className="field">
                <p className="control has-icons-left has-icons-right">
                  <input
                    className="input"
                    type="search"
                    placeholder="Zoek..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <span className="icon is-small is-left">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                </p>
              </div>

              <div className="select">
                <select
                  onChange={(e) => setCountry(e.target.value)}
                  value={selectedCountry}
                >
                  <option defaultChecked value="">
                    Alle landen
                  </option>
                  {Object.entries(countries).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select">
                <select
                  onChange={(e) => setType(e.target.value)}
                  value={selectedType}
                >
                  <option defaultChecked value="">
                    Alle types
                  </option>
                  {Object.entries(stationTypes).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="table is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Soort</th>
                  <th>Code</th>
                  <th style={{ textAlign: "center" }}>Land</th>
                  <th style={{ textAlign: "center" }}>Info</th>
                </tr>
              </thead>
              <tbody>
                {searched?.map((s) => (
                  <tr key={s.code}>
                    <td>
                      <b>{s.namen.lang}</b>
                    </td>
                    <td>{formatStationType(s.stationType)}</td>
                    <td>
                      <span className="tag"> {s.code}</span>
                    </td>
                    <td
                      style={{ textAlign: "center" }}
                      title={formatCountry(s.land).name}
                    >
                      {formatCountry(s.land).emoji}
                    </td>
                    <td
                      style={{ textAlign: "center" }}
                      title={`Info over ${s.namen.kort}`}
                    >
                      <Link href={`/stations/${s.code}`}>
                        <a>
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stations.isLoading && (
              <progress className="progress is-large is-info" max="100">
                50%
              </progress>
            )}
          </div>
        </div>

        <div style={{ padding: "2.5rem" }} />
      </main>
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   const stations = await getStations();

//   return {
//     props: {
//       stations: stations.payload,
//     },
//   };
// };
