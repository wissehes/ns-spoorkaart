import NS from "../NS";

/**
 * @description Converts a material number/code to a journey code.
 * @param materialNo The material number
 * @returns The journey code
 * @example
 * await getJourneyCode(1200)
 */
export default async function getJourneyCode(materialNo: string | number) {
  const { data } = await NS.get<number>(
    `/virtual-train-api/api/v1/ritnummer/${materialNo}`
  );

  return data;
}
