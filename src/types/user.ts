export interface PayloadCreateUser {
  email: string;
  password: string;
  roles: [string];
}

export interface PayloadUpdateUser {
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  biografia: string;
  photoFile: string;
}
