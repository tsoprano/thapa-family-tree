import { supabase } from "./supabase.js";

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.app_metadata?.role === "admin";
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}
``