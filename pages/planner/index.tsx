import {
  faArrowCircleRight,
  faArrowRight,
  faArrowsTurnToDots,
  faCheck,
  faClock,
  faMagnifyingGlass,
  faTrain,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import {
  Dispatch,
  HTMLInputTypeAttribute,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import NavBar from "../../components/NavBar";
import Hero, { HeroSubtitle, HeroTitle } from "../../components/Bulma/Hero";
import formatTime from "../../helpers/formatTime";
import { trpc } from "../../helpers/trpc";
import { SmallStation, Station } from "../../types/getStationsResponse";
import { Trip } from "../../types/NS/journey/getTripPlannerResponse";
import { formatDuration } from "../../helpers/PlannerPage";
import RushIcon from "../../components/TrainPage/RushIcon";
import Link from "next/link";

export default function PlannerPage() {
  const [from, setFrom] = useState<SmallStation | null>();
  const [to, setTo] = useState<SmallStation | null>();

  const [modalTrip, setModalTrip] = useState<Trip | null>();

  const data = trpc.journey.plan.useQuery(
    {
      fromStation: from?.code || "",
      toStation: to?.code || "",
    },
    { enabled: false }
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <Head>
        <title>Reisplanner | NS Spoorkaart</title>
      </Head>

      <main>
        <NavBar />
        <Hero size="small" color="info">
          <HeroTitle>Reisplanner</HeroTitle>
          {/* <HeroSubtitle></HeroSubtitle> */}

          <div
            className="is-flex container"
            style={{ justifyContent: "space-around" }}
          >
            <BulmaTextInput
              type="search"
              placeholder="Van station"
              id="fromstation"
              icon={faTrain}
              value={from}
              setValue={setFrom}
            />

            <div
              className="is-flex"
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <FontAwesomeIcon icon={faArrowCircleRight} size="2x" />
            </div>

            <BulmaTextInput
              type="search"
              id="tostation"
              placeholder="Naar station"
              icon={faTrain}
              value={to}
              setValue={setTo}
            />

            <button
              className={`button is-primary ${
                data.isFetching ? "is-loading" : ""
              }`}
              onClick={() => data.refetch()}
              disabled={!to || !from}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <span>Plannen</span>
            </button>
          </div>
        </Hero>

        <div className="container" style={{ marginTop: "1rem" }}>
          {(!data.isSuccess || data.isFetching) && (
            <div className="box">
              <p>Begin met zoeken! {":)"}</p>
            </div>
          )}
          <div
            className="is-flex"
            style={{ gap: "3rem", flexDirection: "column" }}
          >
            {data.data?.trips.map((trip) => (
              <div key={trip.idx}>
                <TripBox trip={trip} setModal={setModalTrip} />
              </div>
            ))}
          </div>
        </div>
      </main>
      {modalTrip && (
        <div className="modal is-active" onClick={() => setModalTrip(null)}>
          <div className="modal-background"></div>

          <div className="modal-content">
            <div className="box">
              <p>Modal JS example</p>
            </div>
          </div>

          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={() => setModalTrip(null)}
          ></button>
        </div>
      )}
    </div>
  );
}

function TripBox({
  trip,
  setModal,
}: {
  trip: Trip;
  setModal: Dispatch<SetStateAction<Trip | null | undefined>>;
}) {
  const legs = useMemo(() => trip.legs, [trip]);
  const lastLeg = useMemo(() => legs[legs.length - 1], [legs]);

  const startTime = useMemo(
    () => legs[0]?.stops[0]?.plannedDepartureDateTime,
    [legs]
  );
  const endTime = useMemo(
    () => lastLeg.stops[lastLeg.stops.length - 1]?.plannedArrivalDateTime,
    [lastLeg]
  );

  return (
    <div
      key={trip.idx}
      className="box"
      style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
    >
      <div
        className="is-flex"
        style={{
          justifyContent: "space-between",
          marginBottom: "1rem",
          height: "2rem",
        }}
      >
        <div
          className="is-flex"
          style={{ gap: "0.5rem", alignItems: "center" }}
        >
          <p className="is-size-5">{formatTime(startTime)}</p>
          <FontAwesomeIcon icon={faArrowRight} />
          <p className="is-size-5">{formatTime(endTime)}</p>
        </div>

        <div className="is-flex" style={{ gap: "1rem" }}>
          <div
            className="is-flex"
            style={{ gap: "0.5rem", alignItems: "center" }}
          >
            <FontAwesomeIcon icon={faArrowsTurnToDots} />
            {trip.transfers}x
          </div>
          <div
            className="is-flex"
            style={{ gap: "0.5rem", alignItems: "center" }}
          >
            <FontAwesomeIcon icon={faClock} />
            {formatDuration(trip.plannedDurationInMinutes)}
          </div>
          <div className="is-flex" style={{ alignItems: "center" }}>
            <RushIcon
              busyness={trip.crowdForecast}
              style={{ display: "flex", alignItems: "center" }}
            />
          </div>
        </div>
      </div>

      <div
        className="is-flex"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <nav
          className="breadcrumb has-arrow-separator"
          aria-label="breadcrumbs"
          style={{ marginBottom: "unset" }}
        >
          <ul>
            {trip.legs.map((l) => (
              <li key={l.idx}>
                <Link href={`/journey/${l.product.number}`}>
                  <a target="_blank">
                    {l.product.operatorName} {l.product.longCategoryName}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button className="button is-info" onClick={() => setModal(trip)}>
          Info
        </button>
      </div>
    </div>
  );
}

function BulmaTextInput({
  type,
  id,
  placeholder,
  icon,
  value,
  setValue,
}: {
  type: HTMLInputTypeAttribute;
  id: string;
  placeholder: string;
  icon: IconDefinition;
  value: SmallStation | null | undefined;
  setValue: Dispatch<SetStateAction<SmallStation | null | undefined>>;
}) {
  const [search, setSearch] = useState("");

  const items = trpc.station.search.useQuery(search, {
    enabled: search.length > 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const foundStation = items.data?.find((s) => s.namen.lang == search);
    if (value?.code !== foundStation?.code && foundStation) {
      setValue(foundStation);
    } else if (search == "") {
      setValue(null);
    }
  }, [search, items, value, setValue]);

  return (
    <>
      <p className="control has-icons-left has-icons-right">
        <input
          className="input"
          type={type}
          placeholder={placeholder}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          list={id}
        />
        <span className="icon is-small is-left">
          <FontAwesomeIcon icon={icon} />
        </span>
        {value && (
          <span className="icon is-small is-right">
            <FontAwesomeIcon icon={faCheck} />
          </span>
        )}
      </p>
      <datalist id={id}>
        {items.data?.map((s) => (
          <option key={s.code} value={s.namen.lang}>
            <div>{s.namen.lang}</div>
          </option>
        ))}
      </datalist>
    </>
  );
}
