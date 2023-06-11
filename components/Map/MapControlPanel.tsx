import { Button, Paper, Stack, Switch, rem } from "@mantine/core";
import { useMapStore } from "../../stores/MapStore";
import { useQueryClient } from "@tanstack/react-query";
import useTrains from "../../hooks/useTrains";
import { IconRefresh } from "@tabler/icons-react";

export default function MapControlPanel() {
  const queryClient = useQueryClient();

  const [
    shouldRotate,
    setRotate,
    showTrack,
    setShowTrack,
    autoRefresh,
    setAutoRefresh,
  ] = useMapStore((s) => [
    s.shouldRotate,
    s.setRotate,
    s.showTrack,
    s.setShowTrack,
    s.autoRefresh,
    s.setAutoRefresh,
  ]);

  const updateTrains = () => queryClient.invalidateQueries(["trains"]);
  const trainQuery = useTrains();

  return (
    <Paper
      shadow="md"
      p="md"
      m="md"
      radius="md"
      pos="absolute"
      style={{ zIndex: 10, width: "auto", top: rem(60), right: 0 }}
    >
      <Stack>
        <Switch
          label="Automatisch verversen"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.currentTarget.checked)}
        />
        <Switch
          label="Draai treinen"
          checked={shouldRotate}
          onChange={(event) => setRotate(event.currentTarget.checked)}
        />
        <Switch
          label="Laat spoor zien"
          checked={showTrack}
          onChange={(e) => setShowTrack(e.currentTarget.checked)}
        />
        <Button
          onClick={updateTrains}
          loading={trainQuery.isFetching}
          size="sm"
          color="cyan"
          leftIcon={<IconRefresh size="1rem" />}
        >
          Update handmatig
        </Button>
      </Stack>
    </Paper>
  );
}
