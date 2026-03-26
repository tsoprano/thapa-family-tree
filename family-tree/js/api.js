import { supabase } from "./supabase.js";

export async function getPerson(id) {
  return supabase.from("people").select("*").eq("id", id).single();
}

export async function getChildren(id) {
  return supabase
    .from("relationships")
    .select("people!relationships_person_id_fkey(*)")
    .eq("related_person_id", id)
    .eq("relationship_type", "parent");
}

export async function getParents(id) {
  return supabase
    .from("relationships")
    .select("people!relationships_related_person_id_fkey(*)")
    .eq("person_id", id)
    .eq("relationship_type", "parent");
}
