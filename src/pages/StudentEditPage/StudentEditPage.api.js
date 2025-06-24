import { fetchData } from "../../api/api";

export const fetchRegions = async () => {
  const response = await fetchData("regions/?country_id=1");
  return response.results;
};

export const fetchDistricts = async (region_id) => {
  const response = await fetchData(`districts/?region_id=${region_id}`);
  return response.results;
};

export const fetchNeighborhood = async (district_id) => {
  const response = await fetchData(
    `neighbourhoods/?district_id=${district_id}`
  );
  return response.results;
};
