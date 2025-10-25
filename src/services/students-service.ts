import { PayloadCreateStudent, Student, StudentDetails, StudentsResponse } from "@/types/student";

import apiClient from "./api-client";

export async function getStudentsList(page?: number, pageSize?: number): Promise<StudentsResponse> {
  const { data } = await apiClient.get<StudentsResponse>(`/estudiantes?page=${page ?? 1}&pageSize=${pageSize ?? 20}`);
  return data;
}

export async function createStudent(payload: PayloadCreateStudent): Promise<Student> {
  const { data } = await apiClient.post<Student>(`/estudiantes`, payload);
  return data;
}

export async function getStudentById(studentId: number): Promise<StudentDetails> {
  const { data } = await apiClient.get<StudentDetails>(`/estudiantes/${studentId}`);
  return data;
}

export async function enrollStudent(data: { idEstudiante: number; matricula: string }): Promise<any> {
  return await apiClient.put<any>(`/estudiantes/matricular`, data);
}
