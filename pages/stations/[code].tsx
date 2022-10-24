import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code;

  return {
    redirect: {
      destination: `/stations/${code}/departures`,
      permanent: false,
    },
  };
};

const StationPage = () => {
  return <div>hi</div>;
};

export default StationPage;
