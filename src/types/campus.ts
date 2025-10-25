import { PaginatedResponse } from "./paginated-response";

export interface Campus {
  idCampus: number;
  claveCampus: string;
  nombre: string;
  direccion: string;
}

export interface PayloadCreateCampus {
  claveCampus: string;
  nombre: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  codigoPostalId: number;
}

export interface PayloadUpdateCampus extends PayloadCreateCampus {
  idCampus: number;
  status: number;
}

export type CampusResponse = PaginatedResponse<Campus>;
