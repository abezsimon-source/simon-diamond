import { getChatGPTUser } from "../app/chatgpt-auth";

export const ADMIN_EMAIL = "abezsimon@gmail.com";

export async function isAdmin() {
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === ADMIN_EMAIL;
}

export async function requireAdminApi() {
  if (!(await isAdmin())) {
    return Response.json({ error: "You are not authorized to manage this site." }, { status: 403 });
  }
  return null;
}
