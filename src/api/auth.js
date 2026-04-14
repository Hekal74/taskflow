// Mock API — simulates POST /auth/register, POST /auth/login, GET /auth/me
// Replace fetch() calls here when real backend is ready

const fakeUsers = [];

export const registerUser = async ({ name, email, password }) => {
  await new Promise((res) => setTimeout(res, 800));

  const exists = fakeUsers.find((u) => u.email === email);
  if (exists) throw new Error("Email already registered");

  const user = { id: Date.now(), name, email, password };
  fakeUsers.push(user);

  const token = btoa(JSON.stringify({ id: user.id, email }));
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify({ id: user.id, name, email }));

  return { token, user: { id: user.id, name, email } };
};

export const loginUser = async ({ email, password }) => {
  await new Promise((res) => setTimeout(res, 800));

  const user = fakeUsers.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid email or password");

  const token = btoa(JSON.stringify({ id: user.id, email }));
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name, email }));

  return { token, user: { id: user.id, name: user.name, email } };
};

export const getMe = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};