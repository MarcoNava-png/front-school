export async function login({ email, password }: { email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email && password) {
    const mockToken = "mock_access_token";
    localStorage.setItem("access_token", mockToken);
    return { success: true, token: mockToken };
  }
  return { success: false, error: "Invalid credentials" };
}

export function logout() {
  localStorage.removeItem("access_token");
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
