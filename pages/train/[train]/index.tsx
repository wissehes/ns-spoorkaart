import { GetServerSideProps } from "next";

export default function TrainRedirect() {
  return <div>hi</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const train = context.params?.train;

  return {
    redirect: {
      destination: `/train/${train}/info`,
      permanent: false,
    },
  };
};
