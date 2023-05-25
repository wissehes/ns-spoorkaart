import { Badge, Box, Button, Flex, Group, Title } from "@mantine/core";
import { IconArrowBigRightLine } from "@tabler/icons";
import { JourneyDetails } from "../../types/getJourneyDetailsResponse";
import Link from "next/link";

export default function JourneyInfoDrawer({
  journey,
}: {
  journey: JourneyDetails;
}) {
  const firstStop = journey?.stops.find((s) => s.departures[0]);
  const product = firstStop?.departures[0]?.product;
  const destination =
    firstStop?.departures[0]?.destination?.name ||
    journey?.stops[journey.stops?.length - 1]?.stop?.name;
  return (
    <Box>
      <Title order={2}>
        {product?.operatorName || ""} {product?.longCategoryName || "Trein"}{" "}
        naar {destination}
      </Title>
      <Group
        sx={() => ({
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        })}
      >
        <Badge variant="filled">
          Rit {product?.number || journey?.productNumbers[0] || "?"}
        </Badge>
        <Badge
          variant="gradient"
          gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
        >
          Type {firstStop?.actualStock?.trainType || "?"}
        </Badge>
        <Badge>
          Zitplaatsen: {firstStop?.actualStock?.numberOfSeats || "?"}
        </Badge>
        {firstStop?.actualStock?.trainParts.map((p) => (
          <Badge
            key={p.stockIdentifier}
            variant="gradient"
            gradient={{ from: "teal", to: "lime", deg: 105 }}
          >
            Treinstel {p.stockIdentifier}
          </Badge>
        ))}
      </Group>
      <Flex
        style={{
          flexDirection: "row",
          overflow: "auto",
        }}
      >
        {journey?.stops[0]?.actualStock?.trainParts
          .filter((p) => p.image)
          .map((p) => (
            <Flex
              style={{ height: "6rem", flexDirection: "column" }}
              key={p.stockIdentifier}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image?.uri || ""}
                alt={p.stockIdentifier}
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
                Treinstel {p.stockIdentifier}
              </Badge>
            </Flex>
          ))}
      </Flex>

      <Button
        component={Link}
        href={`/journey/${journey?.productNumbers[0]}`}
        rightIcon={<IconArrowBigRightLine />}
      >
        Meer info
      </Button>
    </Box>
  );
}
