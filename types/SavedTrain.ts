export type SavedTrains = {
  trains: {
    [key: string]: SavedTrain;
  };
  date: Date;
};

export type SavedTrain = {
  id: number; // Materieel id
  ritId: string;
  lat: number;
  lng: number;
  snelheid: number;
  station?: string;
  date: Date;
  info?: {
    materieelnummer: number;
    type: string;
    faciliteiten: string[];
    afbeelding: string;
    breedte: number;
    hoogte: number;
    bakken: {
      afbeelding: { url: string };
    }[];
    zitplaatsen?: {
      zitplaatsEersteKlas: number;
      zitplaatsTweedeKlas: number;
      klapstoelEersteKlas: number;
      klapstoelTweedeKlas: number;
    };
  } | null;
};
