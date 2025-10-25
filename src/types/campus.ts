export interface CampusData {
  items: CampusItem[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CampusItem {
  idCampus: number;
  claveCampus: string;
  nombre: string;
  direccion: string;
}
