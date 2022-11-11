import {
  faWifi,
  faToilet,
  faBicycle,
  faPlug,
  faWheelchair,
  faFaceMehBlank,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SquareDisplay from "../SquareDisplay";

export default function FacilityIcons({
  facilities,
}: {
  facilities: string[];
}) {
  const icons: { [key: string]: IconDefinition } = {
    WIFI: faWifi,
    TOILET: faToilet,
    STILTE: faFaceMehBlank,
    FIETS: faBicycle,
    STROOM: faPlug,
    TOEGANKELIJK: faWheelchair,
  };

  return (
    <>
      {facilities.map((facility) => (
        <SquareDisplay key={facility}>
          <FontAwesomeIcon icon={icons[facility]} size="2x" />
        </SquareDisplay>
      ))}
    </>
  );
}
