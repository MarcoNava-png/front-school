export interface UserAuth {
  userId: string;
  email: string;
  nombres: string;
  apellidos: string | null;
  telefono: string | null;
  biografia: string | null;
  role: string;
  token: string;
  expiration: string;
  photoUrl: string | null;
}
