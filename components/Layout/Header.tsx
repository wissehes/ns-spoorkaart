import { Box, Text, Title } from "@mantine/core";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <Box style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      <Title>{title}</Title>
      {description && <Text>{description}</Text>}
    </Box>
  );
}
