export interface State {
  id: string;
  nombre: string;
  abreviatura: string;
  municipios: null;
}

export interface Municipality {
  id: string;
  nombre: string;
  estadoId: string;
  estado: null;
  codigosPostales: null;
}

export interface Township {
  id: number;
  codigo: string;
  asentamiento: string;
  municipioId: string;
  municipio: null;
}
