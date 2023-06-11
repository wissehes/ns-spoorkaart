import { useMemo, useState } from "react";
import StandardLayout from "../layouts/StandardLayout";
import { Center, Slider, TextInput } from "@mantine/core";

export default function TestMarkerPage() {
  const [rotation, setRotation] = useState(0);
  const [trainType, setTrainType] = useState("SLT 4");

  const actualRotation = useMemo(() => rotation + 90, [rotation]);
  const shouldMirror = useMemo(
    () => rotation >= 0 && rotation <= 180,
    [rotation]
  );

  return (
    <StandardLayout title="Test marker rotation">
      <TextInput
        label="Type trein"
        description="Kijk bij de opgeslagen treinen voor een lijst van alle types."
        value={trainType}
        onChange={(e) => setTrainType(e.target.value)}
      />
      <Slider
        mt="md"
        value={rotation}
        onChange={setRotation}
        min={0}
        max={360}
        step={1}
        marks={[
          { value: 0, label: "0°" },
          { value: 180, label: "180°" },
          { value: 360, label: "360°" },
        ]}
      />

      <Center style={{ maxHeight: "20rem" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/image/${encodeURIComponent(trainType)}`}
          alt={trainType}
          style={{
            height: "80px",
            transform: `rotate(${actualRotation}deg) scaleY(${
              shouldMirror ? -1 : 1
            })`,
            margin: "10rem",
          }}
        />
      </Center>
    </StandardLayout>
  );
}
