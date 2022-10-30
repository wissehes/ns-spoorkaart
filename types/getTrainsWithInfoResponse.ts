import { TrainInformation } from "./getTrainInfoResponse";
import { Trein } from "./getTrainsResponse";

export type TreinWithInfo = Trein & { info?: TrainInformation };

// export type getTrainsWithInfoResponse = {
//   trains: Trein[];
//   info: getMultipleTrainsInfoResponse;
// };
