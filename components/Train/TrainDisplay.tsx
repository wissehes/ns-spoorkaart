import { Badge, Flex } from "@mantine/core";

interface TrainDisplayProps {
  parts?: {
    image: string;
    identifier: string;
  }[];
}

/**
 * Displays the whole train
 */
export default function TrainDisplay({ parts = [] }: TrainDisplayProps) {
  return (
    <Flex
      style={{
        flexDirection: "row",
        overflow: "auto",
        gap: "5px",
      }}
    >
      {parts.map((p) => (
        <Flex
          style={{ height: "6rem", flexDirection: "column" }}
          key={p.identifier}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image || ""}
            alt={p.identifier}
            style={{
              height: "auto",
              width: "auto",
              maxHeight: "4rem",
              maxWidth: "fit-content",
            }}
          />
          <Badge
            style={{
              marginBottom: "1rem",
              marginLeft: "1rem",
              marginRight: "1rem",
            }}
          >
            Treinstel {p.identifier}
          </Badge>
        </Flex>
      ))}
    </Flex>
  );
}
