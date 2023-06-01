/**
 * Page showing all saved images
 */

import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import StandardLayout from "../layouts/StandardLayout";
import DB from "../lib/DB";
import { Card, SimpleGrid, Text } from "@mantine/core";
import Image from "next/image";
import { Header } from "../components/Layout/Header";

const getData = async () => {
  return await DB.allImages();
};

type SSRData = NonNullable<Awaited<ReturnType<typeof getData>>>;
type ImageData = SSRData[number];

export const getServerSideProps: GetServerSideProps<{
  data: SSRData;
}> = async () => {
  const data = await getData();
  console.log(data);

  return { props: { data: data ?? [] } };
};

export default function ImagesPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <StandardLayout title="Images">
      <Header title="Alle opgeslagen icoontjes" />
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "62rem", cols: 4, spacing: "md" },
          { maxWidth: "48rem", cols: 3, spacing: "sm" },
          { maxWidth: "36rem", cols: 2, spacing: "sm" },
        ]}
      >
        {data.map((image, index) => (
          <ShowImage key={index} image={image} />
        ))}
      </SimpleGrid>
    </StandardLayout>
  );
}

function ShowImage({ image }: { image: ImageData }) {
  return (
    <Card>
      <Text fw="bold">{image.type}</Text>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${image.base64}`} alt={image.type} />
    </Card>
  );
}
