export async function login({ email, password }: { email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email && password) {
    const mockToken = "mock_access_token";

    // Guardar en localStorage (para hooks del cliente como useAuth)
    localStorage.setItem("access_token", mockToken);

    // Guardar en cookies (para middleware del servidor)
    document.cookie = `access_token=${mockToken}; path=/; max-age=86400; SameSite=Lax`;

    return { success: true, token: mockToken };
  }
  return { success: false, error: "Invalid credentials" };
}

export function logout() {
  // Limpiar localStorage
  localStorage.removeItem("access_token");

  // Limpiar cookie
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (name && email && password) {
    // Simula registro exitoso
    return { success: true };
  }
  return { success: false, error: "Invalid registration data" };
}

export async function forgotPassword({ email }: { email: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email) {
    // Simula envío de email de recuperación
    return { success: true };
  }
  return { success: false, error: "Email required" };
}
