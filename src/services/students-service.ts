import { StudentsResponse } from "@/types/student";

import apiClient from "./api-client";

export const getStudents = async (page?: number, pageSize?: number): Promise<StudentsResponse> => {
  const { data } = await apiClient.get<StudentsResponse>(`/estudiantes?page=${page ?? 1}&pageSize=${pageSize ?? 20}`);
  return data;
};
