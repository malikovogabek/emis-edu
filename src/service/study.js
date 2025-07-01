import { postData } from "../api/api";

export const nextCursApiService = async (id) => {
  const res = await postData(`edu-groups/${id}/transfer-to-next-semester/`, {});
  return res;
};
export const prevCursApiService = async (groupId) => {
  const response = await postData(
    `edu-groups/${groupId}/transfer-to-previous-semester/`,
    {}
  );
  return response;
};

export const toFinishGroupApiService = async (id) => {
  const respons = await postData(`edu-groups/${id}/graduate/`, {});
  return respons;
};
